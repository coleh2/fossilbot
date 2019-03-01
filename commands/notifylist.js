module.exports = function (evt, args, _cfg, bot) {
    if (!_cfg.enabledFeatures.notify) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return }
    var thatNotifyRole = roleSearchByName(evt, args.slice(0, 3).join(' ').substring(0, 32) + ' Notifications');
    if (thatNotifyRole) {
        var usrs = bot.servers[evt.d.guild_id].members;
        if (!usrs) { return }
        usrs = Object.values(usrs);
        usrs = usrs.filter(x => {
            return x.roles.includes(thatNotifyRole);

        });
        var endMsg = [];
        for (var i = 0; i < usrs.length; i++) {
            endMsg.push(usrs[i].nick || bot.users[usrs[i].id].username);

        }
        var txtMsg = ('Here are the people in that role (' + endMsg.length + ' total): \n- ' + endMsg.join('\n- '));

        bot.sendMessage({
            to: evt.d.channel_id,
            message: txtMsg
        });
    }
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