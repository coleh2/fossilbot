var request = require("request");

var jsdom = require("jsdom");
var { JSDOM } = jsdom;

module.exports = function(evt,args,_cfg,bot) {
    if (!_cfg.enabledFeatures.getme) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return; }
    var query = args.join(" ");
    var indx = null;
    var _indx = /(?:(?:number)|#) *(\d+)/i.exec(query);
    if (_indx) { indx = _indx[1]; } else { indx = 0; }
    if (indx) { query = query.replace(/(?:(?:number)|#) *(\d+)/i, ""); }

    if (!query) { return; }

    bot.sendMessage({to: evt.d.channel_id, message: "<a:load:593253216741883904> Googling..."}, function(err, resp) {
        if(err) { return false; }
        bingGetPic(query, bot, evt.d.channel_id, evt, indx, resp.id);
    });


    function bingGetPic(q, bot, channelID, evt, number, protoMessageId) {
        var isChannelNSFW = bot.servers[evt.d.guild_id].channels[channelID].nsfw;

        var url = "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(q) + "&safe=active";
        if (isChannelNSFW) { url = "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(q) + "&safe=images"; }
        request(url, function (err, resp, body) {

            if(err) return bot.editMessage({channelID: evt.d.channel_id, messageID: protoMessageId, message: ":warning: Error in Google Images. Please try again later."});

            var parsedBody = (new JSDOM(body)).window.document;

            var imgs = Array.from(parsedBody.querySelectorAll("img")).filter(x=>(x.src||x.href)&&!(x.src || x.href || "").includes("branding"));

            if (imgs[0] == null) {
                bot.sendMessage({
                    to: channelID,
                    message: ":warning: That query didn't get any approved results!"
                });
                return;
            }
            var color = _cfg.getmeColor || 7604687;
            if (!imgs[number]) number = imgs.length - 1;

            console.log(imgs.map(x=>x.src||x.href));
            var finalUrl = imgs[number].src || imgs[number].href;

            console.log(imgs[number]);

            console.log(finalUrl);

            var message = {
                "messageID": protoMessageId,
                "channelID": evt.d.channel_id,
                "message": "",
                "embed": {
                    "color": color,
                    "image": {
                        "url": finalUrl
                    }
                }
            };
            bot.editMessage(message);
        });
    }
};
