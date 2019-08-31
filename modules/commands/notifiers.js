module.exports = function (evt, args, _cfg, bot) {
    if (!_cfg.enabledFeatures.notify) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return; }
    var nRoles = Object.values(bot.servers[evt.d.guild_id].roles).filter(x => {
        return (x.name.substring(x.name.length - 14, x.name.length) == " Notifications");
    });
    if (!nRoles) { return; }
    for (var i = 0; i < nRoles.length; i++) {
        nRoles[i] = nRoles[i].name;
    }
    var txtMsg = ("Notification Roles In " + bot.servers[evt.d.guild_id].name + " (" + nRoles.length + " total): \n- " + nRoles.join("\n- "));

    bot.sendMessage({
        to: evt.d.channel_id,
        message: txtMsg
    });
};