module.exports = function (evt, args, _cfg, bot, db) {
    if (!_cfg.enabledFeatures.notify) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return; }

    var notifName = args.slice(0, 3).join(" ");

    if(notifName.toLowerCase().endsWith("notifications"))  {
        //warn about notifications that end with "notifications", like "cs:go notifications notifications"
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "`[Error 301f73c.4.0]` Don't include 'notifications' at the end of the role; it is added automatically. You might be looking for `>notify " + notifName.replace(/ ?notifications$/i, "") + "` :)"
        });
        return;
    }

    var specificNotifRole = roleSearchByName(evt, ((args.slice(0, 3).join(" ").substring(0, 32)) || "Annoying People") + " Notifications");

    var memberStoredData = db.prepare("SELECT notifybudget FROM members WHERE guild_id = ? AND id = ?").get([evt.d.guild_id, evt.d.author.id]);
    if(!memberStoredData) {memberStoredData = {notifybudget: 0}; }

    if (!specificNotifRole) {
        if(_cfg.notifyBudget == undefined || _cfg.notifyBudget < 0) { _cfg.notifyBudget = Infinity; }
        if(_cfg.notifyBudget - memberStoredData.notifybudget > 0) {
            bot.createRole(evt.d.guild_id, function (err, resp) {
                if (err) { console.log(err); return; }

                db.prepare("REPLACE INTO members (id, guild_id, notifybudget) VALUES (?, ?, ?)").run([evt.d.author.id, evt.d.guild_id, (memberStoredData.notifybudget||0) + 1]);
                specificNotifRole = resp.id;
                console.log(specificNotifRole);
                bot.editRole({ serverID: evt.d.guild_id, roleID: specificNotifRole, name: ((args.slice(0, 3).join(" ").substring(0, 32)) || "Annoying People") + " Notifications", mentionable: true });
                if (specificNotifRole) {
                    bot.addToRole({
                        serverID: evt.d.guild_id,
                        userID: evt.d.author.id,
                        roleID: specificNotifRole
                    });
                }
            });
            bot.sendMessage({
                to: evt.d.channel_id,
                message: "You've been added to the notification role for `" + ((args.slice(0, 3).join(" ").substring(0, 32)) || "Annoying People") + "`"
            });
        } else {
            bot.sendMessage({
                to: evt.d.channel_id,
                message: "You've made "+_cfg.notifyBudget+" or more notification roles! Please ask an administrator in order to create more."
            });
        }
    } else {
        bot.addToRole({
            serverID: evt.d.guild_id,
            userID: evt.d.author.id,
            roleID: specificNotifRole
        });
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "You've been added to the notification role for `" + ((args.slice(0, 3).join(" ").substring(0, 32)) || "Annoying People") + "`"
        });
    }

    //utility method
    function roleSearchByName(evt, q) {
        if (!bot.servers[evt.d.guild_id]) { return null; }
        var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function (key) {
            var res = bot.servers[evt.d.guild_id].roles[key].name;
            if(!res) {res = "foo";}
            if (res.toLowerCase() == q.toLowerCase()) { return true; }
        }));
        return (r||null);
    }
};
