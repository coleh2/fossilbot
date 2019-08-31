module.exports = function(evt,args,_cfg,bot) {
    if (!_cfg.enabledFeatures.addmeto) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return; }
    var specificChannelRole = roleSearchByName(evt, ((args.slice(0, 3).join(" "))) + " Channel");
    if (specificChannelRole != null) {
        bot.addToRole({
            serverID: evt.d.guild_id,
            userID: evt.d.author.id,
            roleID: specificChannelRole
        });
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "You've been added to the channel."
        });
    } else {
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "I didn't find an open channel by that name. I've sent the full list to your DMs; maybe you made a typo?"
        });
        bot.sendMessage({
            to: evt.d.author.id,
            message: "Open Channels:\n" + (function (evt) {

                var e = [];
                (Object.keys(bot.servers[evt.d.guild_id].roles).forEach(function (key) {
                    var res = bot.servers[evt.d.guild_id].roles[key].name;
                    if (res.substring(res.length - 8, res.length).toLowerCase() == " channel") { e.push("`>addmeto " + res.substring(0, res.length - 8) + "`"); } 
                }));
                return e;


            })(evt).join("\n")
        });
    }
    //utility method
    function roleSearchByName(evt, q) {
        if (!bot.servers[evt.d.guild_id]) { return null; }
        var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function (key) {
            var res = bot.servers[evt.d.guild_id].roles[key].name;
            if (res.toLowerCase() == q.toLowerCase()) { return true; }
        }));
        if (r != null) { return r; } else { return null; }
    }
};
