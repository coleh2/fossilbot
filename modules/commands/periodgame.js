var periodGameManager;

module.exports = function (evt, args, _cfg, bot, db) {
    if (!periodGameManager) {
        periodGameManager = require(__dirname + '/../periodgame/periodgame.js')(bot, db);
        bot.on("message", function (user, userID, channelID, message, evt) {
            periodGameManager.message(evt, _cfg);
        });
    }

    if (args[0] == "join") {
        periodGameManager.addPersonToRole(evt);
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "Added to role!"
        });
    } else if (args[0] == "begin") {
        periodGameManager.setPlayState(args[1] == "start", evt);
        bot.sendMessage({
            to: evt.d.channel_id,
            message: `Game ${(args[1] == start) ? "Started" : "Stopped"}`
        });
    }
}
