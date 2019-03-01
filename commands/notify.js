module.exports = function (evt, args, _cfg, bot) {
    if (!_cfg.enabledFeatures.notify) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return }
    var specificNotifRole;
    if (roleSearchByName(evt, ((args.slice(0, 3).join(' ').substring(0, 32)) || "Annoying People") + ' Notifications') == null) {
        bot.createRole(evt.d.guild_id, function (err, resp) {
            if (err) { console.log(err); return }
            console.log(resp);
            specificNotifRole = resp.id
            console.log(specificNotifRole);
            bot.editRole({ serverID: evt.d.guild_id, roleID: specificNotifRole, name: ((args.slice(0, 3).join(' ').substring(0, 32)) || "Annoying People") + ' Notifications', mentionable: true });
            if (specificNotifRole) {
                bot.addToRole({
                    serverID: evt.d.guild_id,
                    userID: evt.d.author.id,
                    roleID: specificNotifRole
                });
            }
        });
    } else {
        specificNotifRole = roleSearchByName(evt, ((args.slice(0, 3).join(' ').substring(0, 32)) || "Annoying People") + ' Notifications');
        bot.addToRole({
            serverID: evt.d.guild_id,
            userID: evt.d.author.id,
            roleID: specificNotifRole
        });
    }
    bot.sendMessage({
        to: evt.d.channel_id,
        message: 'You\'ve been added to the notification role for `' + ((args.slice(0, 3).join(' ').substring(0, 32)) || "Annoying People") + '`'
    });
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