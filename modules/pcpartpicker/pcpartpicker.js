var request = require("request");
var JSDOM = require("jsdom").JSDOM;
var resolveRelative = require("resolve-relative-url");

const db = require("better-sqlite3")(__dirname + "/../../data/pcpartpickerparts.db");

var rgbIndex = 0;

module.exports = function (evt, _cfg, bot) {
    var pcPartListLinks =  evt.d.content.match(/<?(?:(?:https?:\/\/pcpartpicker.com\/user\/[\d\w@\.\+-_]+\/saved\/[\d\w-]+)|(?:https?:\/\/pcpartpicker.com\/list\/[\d\w-]+)|(?:https?:\/\/pcpartpicker.com\/user\/[\d\w@\.\+-_]+\/saved\/#view=[\d\w-]+))>?/g);

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
    });
}
function buildEmbed(pc) {
    if(!pc) return false;
    var componentFields = pc.components.map(function(comp) {
        return {
            "name": comp.type,
            "value": comp.name + " - " + comp.price,
            "inline": true
        };
    });
    return {
        title: pc.name,
        url: pc.url,
        description: `Price (minus shipping): ${pc.priceNoShip}; Total Price: ${pc.priceTotal}`,
        color: getRgb(rgbIndex++),
        author: {
            name: pc.username,
            url: `https://pcpartpicker.com/user/${pc.username}`,
            icon_url: pc.userimg
        },
        thumbnail: {
            url: pc.imageUrl
        },
        fields: componentFields
    };
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

function getRgb(i) {
    var colors = ["FF0000","FF8000","FFFF00","00FF00","0093FF","0F00FF","8B00FF","E400FF","FF00C1","FF005D"];
    return parseInt(colors[i % colors.length], 16);
}
