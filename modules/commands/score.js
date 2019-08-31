var fs = require("fs");

module.exports = function(evt,args,_cfg,bot) {
    fs.readFile(__dirname + "/modules/webserver/db/webcache.json", "utf8", function (err, data) {

        if (err) return;

        var s = JSON.parse(data).cache.find(x => { return x.discord.id.id == evt.d.author.id; });

        if (!s) return;
        s = s.discord.data[evt.d.guild_id];


        bot.sendMessage({
            to: evt.d.channel_id,
            message: "<@" + evt.d.author.id + ">, you are currently at level " + s.level + " and have " + s.score + " XP points. You need " + (s.totalNeededXp - s.score) + " more XP points to level up (" + (Math.floor(((s.totalNeededXp - s.score) / s.neededXp) * 100)) + "%)"
        });
    });
};