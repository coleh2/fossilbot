module.exports = function (evt, args, _cfg, bot) {
	if (!_cfg.enabledFeatures.notify) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return }
					try {
						if (roleSearchByName(evt, args.slice(0, 3).join(' ').substring(0, 32) + ' Notifications')) {
							bot.removeFromRole({
								serverID: evt.d.guild_id,
								userID: evt.d.author.id,
								roleID: roleSearchByName(evt, args.slice(0, 3).join(' ').substring(0, 32) + ' Notifications')
							});
							bot.sendMessage({
								to: evt.d.channel_id,
								message: 'You\'ve been removed from the notification role for `' + args.join(' ') + '`'
							});
						} else {
							bot.sendMessage({
								to: evt.d.channel_id,
								message: 'I didn\'t find the notification role for `' + args.join(' ') + '`. Maybe you made a typo?'
							});


						}
					} catch (e) { console.log(e) }

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