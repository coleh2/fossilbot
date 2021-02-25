var request = require("request");
var JSDOM = require("jsdom").JSDOM;
var resolveRelative = require("resolve-relative-url");

const db = require("better-sqlite3")(__dirname + "/../../data/pcpartpickerparts.db");

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
        bot.editMessage({
            messageID: listMessageIndices[index],
            channelID: evt.d.channel_id,
            message: "",
            embed: buildEmbed(data)
        }, function(err) {

            if(err) console.error(err);
            var benchmarkableComponents = data.components.filter(x=>(getUbmType(x)));
            recursiveFindUbmId(benchmarkableComponents, function (err, accBenchmarkData, isSync) {
                if(err) return console.error(err);
                console.log(accBenchmarkData);

                if(!isSync || accBenchmarkData.length == benchmarkableComponents.length) bot.editMessage({
                    messageID: listMessageIndices[index],
                    channelID: evt.d.channel_id,
                    message: "",
                    embed: buildEmbed(data,accBenchmarkData)
                });
            });
        });
    });
}
function buildEmbed(pc, benchmarks) {
    if(!pc) return false;
    var componentLines = pc.components.map(comp =>`**${comp.type}**: [${comp.name}](${comp.url})`);

    var componentFields = [];

    for(let i = 0; i < componentLines.length; i++) {
        if(!componentFields[0] || componentFields[componentFields.length - 1].value.length + componentLines[i].length > 1024) {
            componentFields.push({name: `Components (${componentFields.length + 1})`, value: "", inline: true});
        }
        componentFields[componentFields.length - 1].value += componentLines[i] + "\n";
    }

    var defaultBenchmarkText = "<a:load:593253216741883904> Loading benchmarks...";
    var benchmarkText = defaultBenchmarkText;
    if(benchmarks) {
        var benchmarkableComponents = pc.components.filter(x=>getUbmType(x));
        if(benchmarks.length < benchmarkableComponents.length) benchmarkText = `<a:load:593253216741883904> Fetching benchmark for ${benchmarkableComponents[benchmarks.length].type} (${benchmarks.length}/${benchmarkableComponents.length})`;
        else benchmarkText = `Projected Performance (gaming): ${roundToPlace(gamingAverageBenchmarks(benchmarks),10)}%\nProjected Performance (general use): ${roundToPlace(generalAverageBenchmarks(benchmarks),10)}%\n`;

        for(let i = 0; i < benchmarks.length; i++) {
            let benchmark = benchmarks[i];
            benchmarkText = benchmarkText + `\n**${benchmark.type}**: ${benchmark.score}%`;
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
        fields: ([
            {
                name: "Pricing",
                value: `Price (minus shipping): ${pc.priceNoShip}; Total Price: ${pc.priceTotal}`,
            },
            {
                name: "Benchmarks",
                value: benchmarkText.substring(0,1024),
            }
        ]).concat(componentFields)
    };
}

function recursiveFindUbmId(components, cb, i, accumulator) {
    if(!i) i = 0;
    if(!accumulator) accumulator = [];

    var currentComponent = components[i];
    if(!currentComponent) {
        console.log("no currentcomponent",components);
        accumulator.push({type: "", score: ""});
        return cb("no component");
    }

    let componentDbEntry = db.prepare(`SELECT * FROM ${getTableName(currentComponent.type)} WHERE id = '${currentComponent.id}'`).get();
    if(componentDbEntry.ubmId) {
        var benchmarkDbEntry = db.prepare(`SELECT * FROM userbenchmarks WHERE ID = '${componentDbEntry.ubmId}'`).get();
        accumulator.push({type: getUbmType(currentComponent), score: benchmarkDbEntry.Benchmark});
        cb(null, accumulator, true);
        if(components[i+1]) return recursiveFindUbmId(components, cb, i+1, accumulator);
        else return true;
    }
    request.get("https://bing.com/search?q=" + encodeURIComponent(("site:userbenchmark.com/SpeedTest " +currentComponent._name).substring(0,60)), function(err, res, bod) {
        if(err) return cb(err);

        var dom = new JSDOM(bod);


        require("fs").writeFileSync(__dirname + "/bingsearch_"+currentComponent._name.replace(/\W+/g,"_")+".html", bod);

        var searchResults = dom.window.document.querySelector("#b_results");

        console.log(searchResults);

        if(!searchResults || !searchResults.querySelector(".b_algo:not(.ans_adsup)")) {
            accumulator.push({type: "", score: 0});
            if(components[i+1]) return recursiveFindUbmId(components, cb, i+1, accumulator);
            else return cb("unable to find searchResults", accumulator);
        }

        console.log("found search res");

        var relevantResult = searchResults.querySelector(".b_algo:not(.ans_adsup)");

        console.log(relevantResult.innerHTML);

        var resultUrl = relevantResult.querySelector("h2 a").getAttribute("href");

        var benchmarkId = (/SpeedTest\/(\d+)/).exec(resultUrl)[1] + "";

        var benchmarkDbEntry = db.prepare(`SELECT * FROM userbenchmarks WHERE ID = '${getUbmType(currentComponent).toLowerCase() + benchmarkId}'`).get();
        console.log(getUbmType(currentComponent).toLowerCase() + benchmarkId);

        if(!benchmarkDbEntry) {
            accumulator.push({type: "", score: 0});
            if(components[i+1]) return recursiveFindUbmId(components, cb, i+1, accumulator);
            else return cb("unable to find benchmarkDbEntry for " + benchmarkId, accumulator);
        }

        console.log("found benchmark db entry ", getUbmType(currentComponent).toLowerCase() + benchmarkId);

        db.prepare(`UPDATE ${getTableName(currentComponent.type)} SET ubmId = '${getUbmType(currentComponent).toLowerCase() + benchmarkId}' WHERE id = '${currentComponent.id}'`).run();

        accumulator.push({
            type: getUbmType(currentComponent),
            score: benchmarkDbEntry.Benchmark
        });
        console.log("success!");
        console.log(accumulator);
        cb(null, accumulator);
        if(components[i+1]) recursiveFindUbmId(components, cb, i+1, accumulator);
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

        if(!pageHeading || !pageTitle) return console.error(bod);

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
            rowJson.url = resolveRelative(row.querySelector(".td__name a").getAttribute("href"), listJson.url);
            rowJson.name = row.querySelector(".td__name").textContent.trim();
            rowJson._name = rowJson.name;
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
function roundToPlace(num, place) {
    return Math.round(num * place) / place;
}
function getIdFromUrl(url) {
    if(!url) return "";
    else if(!url.match(/product\/([\d\w-]+)\//)) return "";
    else return (/product\/([\d\w-]+)\//).exec(url)[1];
}
function getTableName(componentType) {
    componentType = componentType.toLowerCase();
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
        "HDD": 0.1,
        "GPU": 0.5,
        "CPU": 0.25,
        "SSD": 0.15,
        "RAM": 0
    };

    let result = 0;
    for(let i = 0; i < benchmarks.length; i++) {
        if(isNaN(benchmarks[i].score)) console.log(benchmarks);
        if(typeof benchmarks[i].score != "number") benchmarks[i].score = parseFloat(benchmarks[i].score);
        result += benchmarks[i].score*gamingBenchmarkWeights[benchmarks[i].type];
    }
    return result;
}
function generalAverageBenchmarks(benchmarks) {
    var generalBenchmarkWeights = {
        "HDD": 0.1,
        "GPU": 0.1,
        "CPU": 0.5,
        "SSD": 0.3,
        "RAM": 0
    };

    console.log(benchmarks);
    let result = 0;
    for(let i = 0; i < benchmarks.length; i++) {
        if(typeof benchmarks[i].score != "number") benchmarks[i].score = parseFloat(benchmarks[i].score);
        result += benchmarks[i].score*generalBenchmarkWeights[benchmarks[i].type];
    }
    return result;
}
function getUbmType(component) {
    switch(component.type.toLowerCase()) {
    case "storage":
        return component.rotSpeed=="SSD"?"SSD":"HDD";
    case "cpu":
        return "CPU";
    case "video card":
        return "GPU";
    case "memory":
        return "RAM";
    default:
        return "";
    }
}
function getRgb(i) {
    var colors = ["FF0000","FF8000","FFFF00","00FF00","0093FF","0F00FF","8B00FF","E400FF","FF00C1","FF005D"];
    return parseInt(colors[i % colors.length], 16);
}
