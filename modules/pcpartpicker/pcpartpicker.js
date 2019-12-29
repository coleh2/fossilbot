var request = require("request");
var JSDOM = require("jsdom").JSDOM;
var resolveRelative = require("resolve-relative-url");

const db = require("better-sqlite3")(__dirname + "/../../data/pcpartpickerparts.db");
const benchmarkGrabOrder = ["CPU", "GPU", "RAM", "Storage"];

var rgbIndex = 0;

module.exports = function (evt, _cfg, bot) {
    var pcPartListLinks =  evt.d.content.match(/<?(?:(?:https?:\/\/pcpartpicker.com\/user\/[\d\w@.+-_]+\/saved\/[\d\w-]+)|(?:https?:\/\/pcpartpicker.com\/list\/[\d\w-]+)|(?:https?:\/\/pcpartpicker.com\/user\/[\d\w@.+-_]+\/saved\/#view=[\d\w-]+))>?/g);

    if(!pcPartListLinks) return false;
    else parseAndSendLists(pcPartListLinks.map(x=>x.replace("#view=","")/*normalize url*/).filter(x=>!x.startsWith("<")&&!x.endsWith(">")/*disregard <link>s*/), bot, evt);
};

function parseAndSendLists(links, bot, evt) {
    var listMessageIndices = [];
    if(links.length == 0) return true;
    for(let i = 0; i < links.length; i++) {
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "<a:load:593253216741883904> Loading list number " + (i+1) + "/" + links.length + "..."
        }, function(err, res) {
            if(err) return false;
            listMessageIndices[i] = res.id;
        });
    } 
    console.log(links);
    recursiveParseListPage(0, links, function(err, data, index) {
        if(err) return console.error(err);
        console.log(data);
        bot.editMessage({
            messageID: listMessageIndices[index],
            channelID: evt.d.channel_id,
            message: "",
            embed: buildEmbed(data)
        });
        recursiveFindUbmId(data.components, function (err, accBenchmarkData) {
            if(err) return console.error(err);

            bot.editMessage({
                messageID: listMessageIndices[index],
                channelID: evt.d.channel_id,
                message: "",
                embed: buildEmbed(data,accBenchmarkData)
            });     
        });
    });
}
function buildEmbed(pc, benchmarks) {
    if(!pc) return false;
    var componentLines = pc.components.map(comp =>
        `**${comp.type}**: [${comp.name}](${comp.url})`        
    );
    
    var defaultBenchmarkText = "<a:load:593253216741883904> Loading benchmarks...";
    var benchmarkText = defaultBenchmarkText;
    if(benchmarks) {
        var benchmarkableComponents = pc.components.filter(x=>getTableName(x.type) != "");
        if(benchmarks.length < benchmarkableComponents.length) benchmarkText = `Fetching benchmark for ${benchmarkableComponents[benchmarks.length].type} (${benchmarks.length})/${benchmarkableComponents.length})`;
        else benchmarkText = `Projected Performance (gaming): ${gamingAverageBenchmarks(benchmarks)}%\nProjected Performance (general use): ${generalAverageBenchmarks(benchmarks)}%\n`;

        for(let i = 0; i < benchmarks.length; i++) {
            let benchmark = benchmarks[i];
            benchmarkText = `**${benchmark.type}**: ${benchmark.score}%\n` + benchmarkText;
        }
    }

    return {
        title: pc.name,
        url: pc.url,
        description: "",
        color: getRgb(rgbIndex++),
        author: {
            name: pc.username,
            url: `https://pcpartpicker.com/user/${pc.username}`,
            icon_url: pc.userimg
        },
        thumbnail: {
            url: pc.imageUrl
        },
        fields: [
            {
                name: "Pricing",
                value: `Price (minus shipping): ${pc.priceNoShip}; Total Price: ${pc.priceTotal}`,
                inline: true
            },
            {
                name: "Components",
                value: componentLines.join("\n"),
                inline: true
            },
            {
                name: "Benchmarks",
                value: benchmarkText,
                inline: true
            }
        ]
    };
}

function recursiveFindUbmId(components, cb, i, accumulator) {
    if(!i) i = 0;
    if(!accumulator) accumulator = [];

    var usableComponents = components.filter(x=>getTableName(x.type) != "");
    var currentComponent = usableComponents[i];
    if(!currentComponent) {
        accumulator.push({type: "", score: ""});
        return recursiveFindUbmId(components, cb, i+1, accumulator);
    }
    request.get("https://www.userbenchmark.com/Search?searchTerm=" + encodeURIComponent(currentComponent.name), function(err, res, bod) {
        if(err) return cb(err);

        var dom = new JSDOM(bod);
        var searchResults = dom.window.document.querySelector(".row .col-xs-6.col-xs-offset-1");

        if(!searchResults.querySelector("a.tl-tag")) {
            accumulator.push({type: "", score: ""});
            return recursiveFindUbmId(components, cb, i+1, accumulator);
        }

        var relevantResult = searchResults.querySelector("a.tl-tag");

        var resultDesc = relevantResult.querySelector(".tl-desc").textContent;
        var resultTitle = relevantResult.querySelector(".tl-title").textContent;
        var resultCaption = relevantResult.querySelector(".tl-caption").textContent;

        var benchmark = parseFloat(resultDesc.match(/ [\d.]+%/)[0]);
        accumulator.push({
            type: (currentComponent.rotSpeed=="SSD")?"SSD":benchmarkGrabOrder[i],
            score: benchmark
        });
        cb(null, accumulator);
        if(usableComponents[i+1]) recursiveFindUbmId(components, cb, i+1, accumulator);
    });
}

function recursiveParseListPage(j, links, cb, accumulator) {
    if(!accumulator) accumulator = [];
    request.get(links[j], function(err, res, bod) {
        if(err) return cb(err);

        var dom = new JSDOM(bod);
        var pageTitle = dom.window.document.querySelector("title");
        var pageHeading = dom.window.document.querySelector("h1.pageTitle");
        var userDiv = dom.window.document.querySelector("div.user");
        var listTable = dom.window.document.querySelector("table.xs-col-12 tbody");

        var listJson = {};

        listJson.url = links[j];

        listJson.title = pageTitle.textContent;
        listJson.name = pageHeading.textContent;
        listJson.priceNoShip = listTable.querySelector(".tr__total .td__price").textContent;
        listJson.priceTotal = listTable.querySelector(".tr__total--final .td__price").textContent;

        listJson.username = userDiv.textContent;
        listJson.userimg = resolveRelative(userDiv.querySelector("img").getAttribute("src"), listJson.url);

        listJson.imageUrl = "https://pcpartpicker.com/static/responsive/images/default-avatar.png";
        listJson.components = [];

        for(var i = 0; i < listTable.children.length; i++) {
            var row = listTable.children[i];
            var rowJson = {};

            if(!row.querySelector(".td__component")) continue;

            rowJson.type = row.querySelector(".td__component").textContent;
            rowJson.image = resolveRelative(row.querySelector(".td__image").querySelector("img").getAttribute("src"), listJson.url);
            rowJson.url = resolveRelative(row.querySelector(".td__name a").getAttribute("href"));
            rowJson.name = row.querySelector(".td__name").textContent.trim();
            rowJson.id = getIdFromUrl(row.querySelector(".td__name a").getAttribute("href"));
            rowJson.baseprice = row.querySelector(".td__base").textContent;
            rowJson.price = row.querySelector(".td__price").textContent;

            if(rowJson.type == "Case") listJson.imageUrl = rowJson.image;

            if(getTableName(rowJson.type.toLowerCase())) {
                let dbResults = db.prepare(`SELECT * FROM ${getTableName(rowJson.type.toLowerCase())} WHERE id = '${rowJson.id}'`).get();
                unify(dbResults || {}, rowJson);
            }
            listJson.components.push(rowJson);
        }

        accumulator.push(listJson);
        console.log("i is", j);

        cb(null, listJson, j);

        if(links[j+1]) recursiveParseListPage(j+1, links, cb, accumulator);
    });
}
module.exports.test = function() {
    module.exports({
        "d": {
            "content": "so summary message because scrolling\nhttps://pcpartpicker.com/user/ItzCloudy/saved/J6MPnQ - most upgrade-friendly\nhttps://pcpartpicker.com/user/ItzCloudy/saved/dshskL - most value and power, not as upgradable\nhttps://pcpartpicker.com/user/ItzCloudy/saved/sygYHx - Value/Power/Portability (i.e. college and occasional LAN)"
        }
    });
};

function unify(a,b) {
    let keys = Object.keys(a);
    for(let i = 0; i < keys.length; i++) {
        b[keys[i]] = a[keys[i]];
    }
}
function getIdFromUrl(url) {
    if(!url) return "";
    else if(!url.match(/product\/([\d\w-]+)\//)) return "";
    else return (/product\/([\d\w-]+)\//).exec(url)[1];
}
function getTableName(componentType) {
    switch(componentType) {
    case "cpu":
        return "cpu";
    case "video card":
        return "gpu";
    case "memory":
        return "ram";
    case "storage":
        return "storage";
    case "motherboard":
        return "mobo";
    default:
        return "";
    }
}
function gamingAverageBenchmarks(benchmarks) {
    var gamingBenchmarkWeights = {
        "Storage": 0.25,
        "GPU": 0.5,
        "CPU": 0.25,
        "SSD": 
    };

    let result = 0;
    for(let i = 0; i < benchmarks.length; i++) {
        result += benchmarks[i].score*gamingBenchmarkWeights[benchmarks[i].type];
    }
    return result;
}
function generalAverageBenchmarks(benchmarks) {
    var generalBenchmarkWeights = {
        "Storage": 0.4,
        "GPU": 0.1,
        "CPU": 0.5,
        "SSD": 0.3
    };

    let result = 0;
    for(let i = 0; i < benchmarks.length; i++) {
        result += benchmarks[i].score*generalBenchmarkWeights[benchmarks[i].type];
    }
    return result;
}
function getRgb(i) {
    var colors = ["FF0000","FF8000","FFFF00","00FF00","0093FF","0F00FF","8B00FF","E400FF","FF00C1","FF005D"];
    return parseInt(colors[i % colors.length], 16);
}
