var PERIOD_GAME_CHANNEL_ID = "";
var PERIOD_GAME_ROLE_NAME = "period game";

var currentlyPlayingGame = false;
var players = [];
var lastPerson = "";
var currentBounds;
var currentRoundPlayerCount;

var bot;
var db;

var exportFuncs = {
    message: function (evt, args, _cfg) {
        var messageText = evt.d.content;

        if (evt.d.channel_id == PERIOD_GAME_CHANNEL_ID) {


            if (currentlyPlayingGame) {
                function youFailed(isAlreadyOut) {
                    if (isAlreadyOut) {
                        sendTemporaryMessage("You're already out of the game! Please wait until the next round :)", evt.d.channel_id);
                    } else {
                        failUser(evt.d.author.id);
                        sendTemporaryMessage("You're out of the game!", evt.d.channel_id);
                    }

                    bot.deleteMessage({ channelID: evt.d.channel_id, messageID: evt.d.id });
                }

                if (!isPlaying(evt.d.author.id)) return youFailed(true);
                if (messageText != ".") return youFailed(false);

                var playerRecord = getPlayer(evt.d.author.id);
                if (lastPerson == evt.d.author.id) return youFailed(false);
                if (playerRecord.last !== null) {
                    if (playerRecord.last < currentBounds.more) return youFailed(false);
                    if (playerRecord.last > currentBounds.less) return youFailed(false);
                }

                resetLastMessageCount(evt.d.author.id);
                lastPerson = evt.d.author.id;
                increaseLastMessageCounts();
                failExpiredUsers();

                if(isTimeToStartNewRound(players.length, currentRoundPlayerCount)) startNewRound(evt);

            } else {
                sendTemporaryMessage("Sorry, but the game isn't active at the moment!", evt.d.channel_id);
                bot.deleteMessage({ channelID: evt.d.channel_id, messageID: evt.d.id });
            }
        }
    },
    setPlayState: function (state, evt) {
        currentlyPlayingGame = state;
        if(state) {
            players = getPlayingList(evt);
            startNewRound();
        }
        
    },
    addPersonToRole: function(evt) {
        bot.addToRole({
            serverID: evt.d.guild_id,
            userID: evt.d.author.id,
            roleID: roleSearchByName(PERIOD_GAME_ROLE_NAME)
        });
    }
};

module.exports = function (_bot, _db) {
    if (!_bot || !_db) { return false; }

    bot = _bot;
    db = _db;

    return exportFuncs;
}



function isTimeToStartNewRound(currentPlayers, roundPlayers) {
    return 0.25 * Math.pow(currentPlayers, 2) < roundPlayers; 
}
function startNewRound(evt) {
    currentRoundPlayerCount = players.length;
    currentBounds = calculateBounds(players.length);
    if(currentRoundPlayerCount == 1) return endGame();
    else bot.sendMessage({to: evt.d.channel_id, message: `New round! After ${currentBounds.more}, before ${currentBounds.less}. In the game are: ${getPlayerListString()}`})
}
function calculateBounds(playerCount) {
    return {
        more: Math.floor(Math.sqrt(playerCount)),
        less: Math.max(Math.ceil(playerCount - Math.log(playerCount)), 3),
    };
}
function endGame() {
    bot.sendMessage({to: evt.d.channel_id, message: `Game complete! The winner is ${players[0].name}`});
    awardWinner(players[0].id);
    currentlyPlayingGame = false;
}
function isPlaying(userId) {
    for (var i = 0; i < players; i++) {
        if (players[i].id == userId) return true;
    }
    return false;
}
function failUser(userId) {
    for (var i = 0; i < players; i++) {
        if (players[i].id == userId) {
            delete players[i];
            break;
        }
    }
}
function failExpiredUsers() {
    for (var i = 0; i < players; i++) {
        if (players[i].last > currentBounds.less) {
            delete players[i];
        }
    }
}
function awardWinner(playerId) {
    var currentPlayerSave = db.prepare("SELECT * FROM userknown WHERE id = ?", [playerId]).get();
    var scoreToBe;
    if(currentPlayerSave == null) scoreToBe = 1;
    else scoreToBe = currentPlayerSave.pgscore + 1;
    db.prepare("INSERT OR REPLACE INTO userknown (id, pgscore) VALUES (?, ?)", [playerId, scoreToBe]).run();
}
function getPlayerListString() {
    var endMsg = "";
    for(var i = 0; i < players; i++) {
        endMsg += "\n> " + players[i].name;
    }
    return endMsg;
}
function getPlayer(playerId) {
    for (var i = 0; i < players; i++) {
        if (players[i].id == playerId) return players[i];
    }
}
function resetLastMessageCount(playerId) {
    for (var i = 0; i < players; i++) {
        if (players[i].id == playerId) return players[i].last = -1;
    }
}
function increaseLastMessageCounts() {
    for (var i = 0; i < players; i++) {
        if (players[i].last === null) players[i].last = null;
        else players[i].last++;
    }
}
function getPlayingList(evt) {
    var roleId = roleSearchByName(evt, PERIOD_GAME_ROLE_NAME);
    if (roleId) {
        var usrs = bot.servers[evt.d.guild_id].members;
        if (!usrs) { return }
        usrs = Object.values(usrs);
        usrs = usrs.filter(x => {
            return x.roles.includes(roleId);
        });

        var end = [];
        for (var i = 0; i < usrs.length; i++) {
            end.push({
                name: usrs[i].nick || bot.users[usrs[i].id].username,
                id: usrs[i].id,
                last: null
            });

        }

        return end;
    }

}

function sendTemporaryMessage(messageText, channelId, cb) {
    bot.sendMessage({
        to: channelId,
        message: messageText
    }, function (err, resp) {
        var justSendId = resp.id;
        setTimeout(function () {
            bot.deleteMessage({
                channelID: channelId,
                messageID: justSendId
            }, cb);
        }, 3000);
    });
}

//utility method
function roleSearchByName(evt, q) {
    if (!bot.servers[evt.d.guild_id]) { return null }
    var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function (key) {
        var res = bot.servers[evt.d.guild_id].roles[key].name;
        if (res.toLowerCase() == q.toLowerCase()) { return true } else { }
    }));
    if (r != null) { return r } else { return null }
}