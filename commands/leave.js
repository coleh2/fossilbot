module.exports = function(evt,args,_cfg,bot) {
    try {
        if (roleSearchByName(evt, ((args.slice(0, 3).join(' '))) + ' Channel')) {
            bot.removeFromRole({
                serverID: evt.d.guild_id,
                userID: evt.d.author.id,
                roleID: roleSearchByName(evt, ((args.slice(0, 3).join(' '))) + ' Channel')
            });
            bot.sendMessage({
                to: evt.d.channel_id,
                message: 'You\'ve been removed from the channel.'
            });
        } else {
            bot.sendMessage({
                to: evt.d.channel_id,
                message: 'I didn\'t find that. Maybe you made a typo?'
            });


        }
    } catch (e) { console.error(e) }
    //utility method
    function roleSearchByName(evt, q) {
        if (!bot.servers[evt.d.guild_id]) { return null }
        var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function (key) {
            var res = bot.servers[evt.d.guild_id].roles[key].name;
            if (res.toLowerCase() == q.toLowerCase()) { return true } else { }
        }));
        if (r != null) { return r } else { return null }
    }
}