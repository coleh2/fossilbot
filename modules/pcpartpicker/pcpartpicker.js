var pcppParser = require("pcpartpickerparser");
var request = require("request");
var JSDOM = require("jsdom").JSDOM;
var resolveRelative = require("resolve-relative-url");

module.exports = function (evt, _cfg, bot) {
    var pcPartListLinks =  evt.d.content.match(/(?:https:\/\/pcpartpicker.com\/user\/[\d\w@\.\+-_]+\/saved\/[\d\w-]+)|(?:https:\/\/pcpartpicker.com\/list\/[\d\w-]+)/g);

    if(!pcPartListLinks) return false;
    else parseAndSendLists(pcPartListLinks, bot);
}

function parseAndSendLists(links, bot) {
    recursiveParseListPage(0, links, function(err, data) {
        if(err) return console.error(err);
        for(var i = 0; i < Math.min(links.length, 5); i++) {
            bot.sendMessage({
                to: evt.d.channel_id,
                embed: buildEmbed(data[i])
            });
        }


    });
}
function buildEmbed(pc) {
    var componentFields = pc.components.map(function(comp) {
        return {
            "name": comp.type,
            "value": comp.name + " - " + comp.price,
            "inline": true
        };
    });
    return {
        title: pc.name,
        description: `Price (minus shipping): ${pc.priceNoShip}; Total Price: ${listJson.priceTotal}`,
        color: 8311585,
        author: {
            name: pc.username,
            url: `https://pcpartpicker.com/user/${pc.username}`,
            icon_url: listJson.userimg
        },
        fields: componentFields
    }
}
function recursiveParseListPage(i, links, cbEnd, accumulator) {
    if(!accumulator) accumulator = [];
    request.get(links[i], function(err, res, bod) {
        if(err) return cbEnd(err);

        var dom = new JSDOM(bod);
        var pageTitle = dom.window.document.querySelector("title");
        var pageHeading = dom.window.document.querySelector("h1.pageTitle");
        var userDiv = dom.window.document.querySelector("div.user");
        var listTable = dom.window.document.querySelector("table.xs-col-12 tbody");
        
        var listJson = {};

        listJson.url = links[i];

        listJson.title = pageTitle.textContent;
        listJson.name = pageHeading.textContent;
        listJson.priceNoShip = listTable.querySelector("tr__total tr__price").textContent;
        listJson.priceTotal = listTable.querySelector("tr__total--final tr__price").textContent;
        
        listJson.username = userDiv.textContent;
        listJson.userimg = resolveRelative(userDiv.querySelector("img").getAttribute("src"), listJson.url);
        
        listJson.imageUrl = "https://pcpartpicker.com/static/responsive/images/default-avatar.png";
        listJson.components = [];

        for(var i = 0; i < listTable.children.length; i++) {
            var row = listTable.children[i];
            var rowJson = {};

            if(row.querySelector(".td__component")) continue;

            rowJson.type = row.querySelector(".td__component").textContent;
            rowJson.image = resolveRelative(row.querySelector(".td__image").querySelector("img").getAttribute("src"), listJson.url);
            rowJson.name = row.querySelector(".td__name").textContent;
            rowJson.baseprice = row.querySelector(".td__base").textContent;
            rowJson.price = row.querySelector(".td__price").textContent;

            if(rowJson.type == "Case") listJson.imageUrl = rowJson.image;

            listJson.components.push(rowJson);
        }


        if(links[i+1]) recursiveParseListPage(i+1, links, cbEnd, accumulator);
        else cbEnd(null, accumulator);
    });
}
module.exports.test = function() {
    module.exports({
        "d": {
            "content": "so summary message because scrolling\nhttps://pcpartpicker.com/user/ItzCloudy/saved/J6MPnQ - most upgrade-friendly\nhttps://pcpartpicker.com/user/ItzCloudy/saved/dshskL - most value and power, not as upgradable\nhttps://pcpartpicker.com/user/ItzCloudy/saved/sygYHx - Value/Power/Portability (i.e. college and occasional LAN)"
        }
    });
}