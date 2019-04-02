var strdoc = require('../doc.json');

module.exports = function (evt, args, _cfg, bot) {
    bot.sendMessage({
        to: evt.d.channel_id,
        message: 'Don\'t worry, <@' + userID + '>-- I\'ll DM you the help documentation.'
    });
    var helpdochere = strdoc.help.main
    if (args[0] && strdoc.help[args[0]]) { helpdochere = strdoc.help[args[0]] }
    bot.sendMessage({
        to: userID,
        message: helpdochere
    });
}