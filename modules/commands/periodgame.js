var periodGameManager;

module.exports = function (evt, args, _cfg, bot, db) {
    if(!periodGameManager) periodGameManager = require(__dirname + '/../periodgame/periodgame.js')(bot, db);
    
    if(args[0] == "join") {
        periodGameManager.addPersonToRole(evt);
    } else if (args[0] == "begin") {
        periodGameManager.setPlayState(args[1] == "start", evt) 
    } else {
        periodGameManager.message(evt, args, _cfg, bot);
    }
}