module.exports = function(evt,args,_cfg,bot) {
    bot.sendMessage({
        to: evt.d.channel_id,
        message: "You can view this server's leaderboard at <http://fossilbot.cf/lb/" + evt.d.guild_id + ">"
    });
};