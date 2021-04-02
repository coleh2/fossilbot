// var PERIOD_GAME_CHANNEL_ID = "512675043159965719";
// var PERIOD_GAME_ROLE_NAME = ". Notifications";

// var currentlyPlayingGame = false;
// var players = [];
// var lastPerson = "";
// var currentBounds;
// var currentRoundPlayerCount;

// var bot;
// var db;

// var exportFuncs = {
//     message: function (evt) {
//         var messageText = evt.d.content;

//         if(evt.d.author.id == bot.id) return;
//         if (evt.d.channel_id == PERIOD_GAME_CHANNEL_ID) {


//             if (currentlyPlayingGame) {
//                 if(isTimeToStartNewRound(players.length, currentRoundPlayerCount)) startNewRound();
//                 failExpiredUsers();

//                 if (!isPlaying(evt.d.author.id)) return youFailed(true,evt);
//                 if (messageText != ".") return youFailed(false,evt);

//                 var playerRecord = getPlayer(evt.d.author.id);
//                 if (lastPerson == evt.d.author.id) return youFailed(false,evt);
//                 if (playerRecord.last !== null) {
//                     if (playerRecord.last < currentBounds.more) return youFailed(false,evt);
//                     if (playerRecord.last > currentBounds.less) return youFailed(false,evt);
//                 }

//                 resetLastMessageCount(evt.d.author.id);
//                 lastPerson = evt.d.author.id;
//                 increaseLastMessageCounts();
                

//             } else {
//                 sendTemporaryMessage("Sorry, but the game isn't active at the moment!", evt.d.channel_id);
//                 bot.deleteMessage({ channelID: evt.d.channel_id, messageID: evt.d.id });
//             }
//         }
//     }
// };

// module.exports = function (_bot, _db) {
//     if (!_bot || !_db) { return false; }

//     bot = _bot;
//     db = _db;

//     return exportFuncs;
// };