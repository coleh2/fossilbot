module.exports = function(evt,args,_cfg,bot) {
    var thatUser;
    if (evt.d.mentions[0]) {
        thatUser = bot.servers[evt.d.guild_id].members[evt.d.mentions[0].id].id
    } else if (args[0].split('#').length == 2) {
        if (Object.values(bot.servers[evt.d.guild_id].members).find(x => { return bot.users[x.id].username == args[0].split('#')[0] && bot.users[x.id].discriminator == args[0].split('#')[1] })) {
            thatUser = Object.values(bot.servers[evt.d.guild_id].members).find(x => { return bot.users[x.id].username == args[0].split('#')[0] && bot.users[x.id].discriminator == args[0].split('#')[1] }).id
        }
    }
    if (thatUser) {
        var tUO = bot.users[thatUser];
        var tMO = bot.servers[evt.d.guild_id].members[thatUser];
        var messageDat = {
            to: evt.d.channel_id,
            embed: {
                "title": 'Data on ' + tUO.username + ":",
                "image": {
                    "url": tUO.avatar ? "https://cdn.discordapp.com/avatars/" + tUO.id + "/" + tUO.avatar : "https://cdn.discordapp.com/embed/avatars/" + (tUO.discriminator % 5) + ".png"
                },
                "fields": [
                    {
                        "name": "Joined At",
                        "value": Date(Date.parse(tMO.joined_at)).toString(),
                        "inline": true
                    },
                    {
                        "name": "Internal ID",
                        "value": tMO.id,
                        "inline": true
                    },
                    {
                        "name": "Roles",
                        "value": tMO.roles.length ? '<@&' + tMO.roles.join('>, <@&') + '>' : '',
                        "inline": true
                    },
                    {
                        "name": "Name",
                        "value": db.JSON().users[tUO.id] ? db.JSON().users[tUO.id] : 'Unknown',
                        "inline": true
                    },
                    {
                        "name": "Join Place",
                        "value": ((Object.values(bot.servers[evt.d.guild_id].members)).sort(function (a, b) { return a.joined_at - b.joined_at }).findIndex(x => { return x.id == tMO.id })) + 1,
                        "inline": true
                    }
                ]

            }
        }
        bot.sendMessage(messageDat);
    } else {
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "I didn't find anyone from that search. Please be sure to include both the user's Discord Username and Tag (e.g. `username#0000`)"
        });
    }
}