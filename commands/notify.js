var db;
module.exports = function (evt, args, _cfg, bot, db) {
    if (!_cfg.enabledFeatures.notify) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return }
    var dbc = db.JSON();
    if(!dbc.notifyBudget) dbc.notifyBudget = {};
    if(!dbc.notifyBudget[evt.d.guild_id]) dbc.notifyBudget[evt.d.guild_id] = {};
    if(dbc.notifyBudget[evt.d.guild_id][evt.d.author.id] === undefined) dbc.notifyBudget[evt.d.guild_id][evt.d.author.id] = (_cfg.notifyBudget || 5);

    var specificNotifRole = roleSearchByName(evt, ((args.slice(0, 3).join(' ').substring(0, 32)) || "Annoying People") + ' Notifications');
    if (specificNotifRole == null) {
        if(dbc.notifyBudget[evt.d.guild_id][evt.d.author.id] > 0) {
            bot.createRole(evt.d.guild_id, function (err, resp) {
                if (err) { console.log(err); return }
                //remote one credit from the human who did this
                dbc.notifyBudget[evt.d.guild_id][evt.d.author.id]--
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
            bot.sendMessage({
                to: evt.d.channel_id,
                message: "You've made more than "+dbc.notifyBudget[evt.d.guild_id][evt.d.author.id]+" notification roles! Please ask an administrator in order to create more."
            });
        }
    } else {
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