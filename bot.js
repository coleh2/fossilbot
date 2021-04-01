var Discord = require("discord.io");
var auth = require(__dirname + "/.data/auth.json");
const db = require("better-sqlite3")(__dirname + "/.data/sqlite.db");

//initialize sql tables
db.prepare("CREATE TABLE IF NOT EXISTS serverconfig (id TEXT PRIMARY KEY, cooldown_g NUMERIC, cooldown_e NUMERIC, cooldown_e_t NUMERIC, cooldown_s NUMERIC, cooldown_s_t NUMERIC, cooldown_m NUMERIC, colldown_m_t NUMERIC, spam_time_mins NUMERIC, autoorder_category_name TEXT, game_emoji TEXT, name_color_roles TEXT, msgs TEXT, enabled_getme INTEGER, enabled_autoorder INTEGER, enabled_notify INTEGER, enabled_addmeto INTEGER, enabled_voicechannelgameemojis INTEGER, enabled_experience INTEGER, enabled_antispam INTEGER, enabled_autoresponse INTEGER, enabled_namecolor INTEGER, auto_resp TEXT, notifybudget INTEGER)").run();
db.prepare("CREATE TABLE IF NOT EXISTS channelactivity (channel_id TEXT, guild_id TEXT, day INTEGER, messages INTEGER, UNIQUE(channel_id, guild_id, day))").run();
db.prepare("CREATE TABLE IF NOT EXISTS userknown (id TEXT PRIMARY KEY, email TEXT, pgscore INTEGER)").run();
db.prepare("CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, guild_id TEXT, notifybudget INTEGER, UNIQUE(id, guild_id))").run();

var voiceSessions = {};

var bot = new Discord.Client({
    token: auth
});

const webserver = require(__dirname + "/modules/webserver/webserver.js")(db,bot);
var channelActivity = require(__dirname + "/modules/channelactivity/channelactivity.js")(db);
var antiSpam = require(__dirname + "/modules/antispam/antispam.js");
var commandManager = require(__dirname + "/modules/commandmanager/commandmanager.js");
var reactionRoles = require(__dirname + "/modules/reactionroles/reactionroles.js")(bot);

var cfg = {
    cooldown_g: 30,
    cooldown_e: 2,
    cooldown_e_t: 3600000,
    cooldown_s: 5,
    cooldown_s_t: 180000,
    cooldown_m: 20,
    cooldown_m_t: 100,
    spam_time_mins: 10,
    gameEmoji: {
        "Counter-Strike: Global Offensive": "\ud83d\udd2b",
        "Minecraft": "\u26cf\ufe0f",
        "Town of Salem": "\u2696\ufe0f",
        "Tom Clancy's Rainbow Six Siege": "\ud83c\udf08",
        "Besiege": "\ud83d\udcd0",
        "Starmade": "\ud83d\ude80",
        "For Honor": "\u2694\ufe0f",
        "Sid Meier's Civilization V": "\ud83c\udf0d",
        "Rocket League": "\ud83d\ude97"
    },
    nameColorRoles: {

    },
    msgs: {
        joinPublic: "",
        joinPrivate: ""
    },
    "enabledFeatures": {
        "getme": true,
        "notify": true,
        "addmeto": true,
        "voicechannelgameemojis": false,
        "experience": false,
        "antispam": false,
        "autoresponse": false,
        "joinmessages": false,
        "namecolor": true,
        "namecolor_hex": false,
        "autoorder": false
    }
};

console.log("💾 Process launched!");

webserver.onLevelUp(function (m) {
    var evt = m.e;
    if (!evt) return;

    bot.sendMessage({
        to: evt.d.channel_id,
        message: "Congrats, <@" + evt.d.author.id + ">! You just leveled up to level " + m.d.discord.data[evt.d.guild_id].level + "\n*This message will be deleted in 10s*"

    }, function (e, r) {
        setTimeout(function () { bot.deleteMessage({ channelID: r.channel_id, messageID: r.id }); }, 10000);
    });
});
webserver.onEmailAuth(function (m) {
    bot.removeFromRole({
        serverID: m.guild_id,
        userID: m.userid,
        roleID: roleSearchByName({ d: { guild_id: m.guild_id } }, "New Recruit")
    });
    var directory = require(__dirname + "/nhs_resources/nps_email_directory.json");
    var directoryItem = directory.find(x => { return x.e == m.email; });
    if (!directoryItem) return;
    var hasMidddleInitial = (directoryItem.n.split(" ").length == 4);
    var nick = hasMidddleInitial ? (bot.users[m.userid].username + " (" + directoryItem.n.split(" ")[0] + " " + directoryItem.n.split(" ")[2].substring(0, 1) + ")") : (bot.users[m.userid].username + " (" + directoryItem.n.split(" ")[0] + " " + directoryItem.n.split(" ")[1].substring(0, 1) + ")");
    bot.editNickname({
        serverID: m.guild_id,
        userID: m.userid,
        nick: nick
    });
    db.prepare("INSERT OR REPLACE INTO userknown (id, email) VALUES (?, ?)", [m.userid, m.email]).run();

});
webserver.onSnowDayAnnounced(function(m) {
    bot.sendMessage({
        "to": "485200425176268824",
        "message": "Snow day?",
        "embed": {
            "description": m.text,
            "color": 1942002,
            "timestamp": (new Date(m.at)).toISOString(),
            "footer": {
                "icon_url": "https://i.ibb.co/5xtV2XC/Twitter-Logo-Blue.png",
                "text": "via IFTTT"
            },
            "author": {
                "name": "Daniel Gutekanst",
                "url": m.link,
                "icon_url": "https://pbs.twimg.com/profile_images/1109937281010491393/kqiSI01L.jpg"
            }
        }
    });
});
// Initialize Discord Bot
bot.connect();

var autoReconnectCount = 0;
var lastAutoReconnect = Date.now();
//on bot ready
bot.on("ready", function () {
    console.log("📡 Connected");
    console.log("🔑 Logged in as: " + bot.username + " - (" + bot.id + ")");
    bot.setPresence({ status: "online", game: { name: "with >help" } });
    console.log("📱 Presence set");
    autoReconnectCount = 0;
});

// Automatically reconnect if the bot disconnects -- only 5 times!
bot.on("disconnect", function (erMsg, code) {
    console.log("⚠️ Bot disconnected from Discord with code " + code + " for reason: " + erMsg);
    if(autoReconnectCount < 5) {
        if(code != 1000 && Date.now() - lastAutoReconnect < 1000) autoReconnectCount++;
        console.log("Automatically reconnecting -- attempt " + autoReconnectCount + "/5");
        lastAutoReconnect = Date.now();
        bot.connect();
    }
});

var cmdprefix = ">";

//Update the name of voice channels when the first person joins
bot.on("presenceUpdate", function (evt) {
    var _cfg = db.prepare("SELECT * FROM serverconfig WHERE id = ?").get([evt.d.guild_id]);
    if (!_cfg) { _cfg = cfg; } else { _cfg = toLegacyConfigSchema(_cfg); }

    if (!_cfg.enabledFeatures.voicechannelgameemojis || !voiceSessions[evt.d.user.id] || !bot.channels[voiceSessions[evt.d.user_id]]) { return; }
    if(bot.users[evt.d.user.id].game) {
        bot.editChannelInfo({
            channelID: voiceSessions[evt.d.user_id],
            name: "\ud83c\udfae:" + (_cfg.gameEmoji[bot.users[evt.d.user.id].game.name] || "\ud83c\udfb2") + "| " + bot.channels[voiceSessions[evt.d.user_id]].name
        });
    }
});
bot.on("voiceStateUpdate", function (evt) {

    require("./voice-state-saver.js")(evt);

    try {
        var _cfg = db.prepare("SELECT * FROM serverconfig WHERE id = ?").get([evt.d.guild_id]);
        if (!_cfg) { _cfg = cfg; } else { _cfg = toLegacyConfigSchema(_cfg); }

        if (!_cfg.enabledFeatures.voicechannelgameemojis) { return; }

        if (!evt.d.channel_id || voiceSessions[evt.d.user_id]) {
            evt.d.channel_id = evt.d.channel_id || voiceSessions[evt.d.user_id];
            if (Object.keys(bot.channels[evt.d.channel_id].members).length == 0 && bot.channels[evt.d.channel_id].name.substring(0, 3) == "\ud83c\udfae:" && bot.channels[evt.d.channel_id].name.length >= 5) {
                bot.editChannelInfo({
                    channelID: evt.d.channel_id,
                    name: bot.channels[evt.d.channel_id].name.split("| ").splice(1).join("| ")
                });
            }

            delete voiceSessions[evt.d.user_id];
            if (!evt.d.channel_id) { return; }
        }
        voiceSessions[evt.d.user_id] = evt.d.channel_id;

        if (!_cfg.gameEmoji) { _cfg.gameEmoji = { "foo": "bar" }; }
        if(bot.users[evt.d.user_id].game) {
            if (Object.keys(bot.channels[evt.d.channel_id].members).length == 1 && bot.channels[evt.d.channel_id].name.length < 96 && bot.channels[evt.d.channel_id].name.substring(0, 3) != "\ud83c\udfae:") {
                bot.editChannelInfo({
                    channelID: evt.d.channel_id,
                    name: "\ud83c\udfae:" + (_cfg.gameEmoji[bot.users[evt.d.user_id].game.name] || "\ud83c\udfb2") + "| " + bot.channels[evt.d.channel_id].name
                });
            }
        }
    } catch(e) { console.error(e); }
});
bot.on("any", function(evt) {
    if(evt.t == "MESSAGE_REACTION_ADD") reactionRoles.reaction(evt);
    else if(evt.t == "INTERACTION_CREATE") handleInteractionCreated(evt.d);
});

var request = require("request");

function handleInteractionCreated(event) {
    var url = `https://discord.com/api/v8/interactions/${event.id}/${event.token}`;

request.post(url + "/callback", {
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        type: 5,
        data: {
            content: "..."
        }
    })
});


    var _cfg = db.prepare("SELECT * FROM serverconfig WHERE id = ?").get([event.guild_id]);

    commandManager.commands[event.data.name](event, event.data.options.map(x=>x.value), _cfg, makeShimInteractionBot(url), db);
}

function makeShimInteractionBot(callbackUrl) {
    var request = require("request");

    return {
        sendMessage(data) {
             request.patch(callbackUrl + "/messages/@original", {
                 headers: {
                     "Content-Type": "application/json"
                 },
                 body: JSON.stringify({
                     type: 4,
                     data: {
                         content: data.message
                     }
                 })
             });

        }

    }
}

//when people join, do stuff
bot.on("guildMemberAdd", function (member, evt) {

    var _cfg = db.prepare("SELECT * FROM serverconfig WHERE id = ?").get([evt.d.guild_id]);
    if (!_cfg) { _cfg = cfg; } else { _cfg = toLegacyConfigSchema(_cfg); }


    if (evt.d.guild_id != "392830469500043266") {
        if (!_cfg.msgs.joinPublic) { return; }
        if (!_cfg.msgs.joinPrivate) { return; }
        if (!_cfg.enabledFeatures.joinmessages) { return; }
        try {
            bot.sendMessage({
                to: evt.d.guild_id,
                message: _cfg.msgs.joinPublic.replace("{USER}", evt.d.user.id)
            });
        } catch (e) { console.error(e); }
        bot.sendMessage({
            to: evt.d.user.id,
            message: _cfg.msgs.joinPrivate.replace("{USER}", evt.d.user.id)
        });
    } else {
        try {
            bot.addToRole({ serverID: evt.d.guild_id, userID: evt.d.user.id, roleID: roleSearchByName(evt, "New Recruit") }, function (err) { if (err != null && err.statusMessage != "NOT FOUND") { console.log(err); } });
            bot.sendMessage({
                to: evt.d.user.id,
                message: "Hey, welcome to NHS! As you can see, there aren't many open channels. This is to keep the majority of the server secure against trolling; we're a very friendly server, and we don't want that to be taken advantage of. If you want to be automatically allowed in, please use the `>nhs email <email address>` command in this DM so I can make sure you're from our school. Please use your school-provided email address. Thanks, and I hope to see you in the server!"
            });
        } catch (e) { console.error(e); }
    }

});

bot.on("message", function (user, userID, channelID, message, evt) {
    try {

        //deny commands in DMs
        if (!bot.servers[evt.d.guild_id]) {
            if (message.split(" ")[0] == ">help") {
                var strdoc = require(__dirname + "/data/doc.json");
                var helpdochere = strdoc.help.main;
                if (message.split(" ")[1] && strdoc.help[message.split(" ")[1]]) { helpdochere = strdoc.help[message.split(" ")[1]]; }
                bot.sendMessage({
                    to: userID,
                    message: helpdochere
                });
                return;
            } else if (message.split(" ")[0].toLowerCase() == ">nhs") {
                let cmd = message.toLowerCase().split(" ");
                let email = cmd[2];

                if (email.split("@")[1] != "students.needham.k12.ma.us" || email.split("@")[0].length > 6) {
                    bot.sendMessage({
                        to: userID,
                        message: `Sorry, \`${email}\` is not a valid email address.`
                    });
                } else {
                    bot.sendMessage({
                        to: userID,
                        message: "Okay, I'm sending an email with a validation code to you now..."
                    }, function () {
                        webserver.email({ evt: evt, email_address: email }, function (r) {
                            bot.sendMessage({
                                to: userID,
                                message: r.err ? "It looks like there was an error with sending the email. The error code I got was `" + r.err + "`. Try again later, maybe?" : "Email sent successfully to `" + r.email + "`. If you don't see it, try looking in your Spam or Junk folders."
                            });
                        });
                    });
                }
            }
            return;
        }

        var _cfg = db.prepare("SELECT * FROM serverconfig WHERE id = ?").get([evt.d.guild_id]);
        if (!_cfg) { _cfg = cfg; } else { _cfg = toLegacyConfigSchema(_cfg); }

        //if the user is a bot, stop ALL of this stuff
        if (evt.d.author.bot) return;

        //preston's footnose thing
        if(evt.d.guild_id == "392830469500043266" || evt.d.guild_id == "427197003035049985") {
            if(evt.d.attachments && evt.d.attachments[0]) {
                if(require(__dirname + "/data/bannedFileNames.json").includes(evt.d.attachments[0].filename)) {
                    bot.deleteMessage({
                        channelID: evt.d.channel_id,
                        messageID: evt.d.id
                    });
                }

            }

        }


        //mark's anti-politics thing
        if(evt.d.guild_id == "392830469500043266" && !(["511690095238316042","447478213388795904","509375073958887424","485200425176268824"]).includes(channelID)){
            var offTopicPolitics = ["aoc","biden","bernie","blm","black lives matter","brutality","covid","covid-19","coronavirus","candidate","cnn","donald","democrat","democracy","dictator","fox","fox news","police","gender","ben shapiro","communism","facism","anarchy","government","a right", "election","rigging", "free healthcare","racism","tyranny","violate"];
            for(var i = 0; i < offTopicPolitics.length; i++) {
                if(message.toLowerCase().match(offTopicPolitics[i])) {
                    //someone's being naughty!
                    /*bot.sendMessage({
                        to: channelID,
                        message: "Hi there! According to a list of terms specified by Mark, it looks like you're being political in a non-political chat. Here is the term that triggered this message: \"" + offTopicPolitics[i] + "\". Please move to #paulitics!"
                    });*/
                    break;
                }
            }
        }
        //antispam section
        if (_cfg.enabledFeatures.antispam) {
            antiSpam.update(evt, _cfg);

            var userSpamStatus = antiSpam.getUserState(evt);
            if (userSpamStatus.tomute) {
                bot.sendMessage({
                    to: channelID,
                    message: "You have been auto-detected as spamming! Please wait " + (_cfg.spam_time_mins) + " minutes in order to be able to type again."
                });

                var roleIdToMuteWith = roleSearchByName(evt, "Criminal");
                bot.addToRole({
                    serverID: evt.d.guild_id,
                    userID: evt.d.author.id,
                    roleID: roleIdToMuteWith
                });
                antiSpam.muted(evt.d.guild_id, evt.d.author.id);
                //then, after half an hour, remove the role & unwarn them
                setTimeout(function () {
                    bot.removeFromRole({
                        serverID: evt.d.guild_id,
                        userID: evt.d.author.id,
                        roleID: roleIdToMuteWith
                    });
                    antiSpam.unmuted(evt.d.guild_id, evt.d.author.id);
                }, _cfg.spam_time_mins * 60000);

            } else if (userSpamStatus.towarn) {
                bot.sendMessage({
                    to: channelID,
                    message: ":warning: You're about to be marked for spam; please hold off on the pinging or you'll be muted for " + (_cfg.spam_time_mins) + " minutes. Thank you!"
                });
                antiSpam.warned(evt.d.guild_id, evt.d.author.id);
            }
        }
        //auto-ordering channels
        if (_cfg.enabledFeatures.autoorder && _cfg.autoorder_category_name) {
            channelActivity.updateData(evt);
            if (channelActivity.getLastReorderTime(evt.d.guild_id) < Date.now() - 3600000) {
                var categoryId = channelSearchByName(evt, _cfg.autoorder_category_name);
                if (categoryId) {
                    channelActivity.orderChannels(evt.d.guild_id, categoryId);
                }
            }
        }
        
        //reaction role adding
        reactionRoles.add(evt);

        //exp management section
        if (_cfg.enabledFeatures.experience) {
            //add a random number between 10 and 25 to the score
            if (message.substring(0, 1) != cmdprefix) {
                try {
                    webserver.incrementXp({ evt: evt, serverDat: bot.servers[evt.d.guild_id] });
                } catch (e) { console.log(e); }
            }
        }
        if(evt.d.channel_id == "513465814519906314" && evt.d.attachments[0]) {
            bot.addReaction({
                channelID: evt.d.channel_id,
                messageID: evt.d.id,
                reaction: "❤"
            });
        }
        //commands
        if (message.substring(0, 1) === cmdprefix) {

            var args = message.substring(1).split(" ");
            let cmd = args[0].toLowerCase();
            args = args.splice(1);

            //find the command; if it exists, run it
            if (commandManager.commands[cmd]) {
                commandManager.commands[cmd](evt, args, _cfg, bot, db);
            }

            return true;
        }
        //automatic response
        if (_cfg.enabledFeatures.autoresponse && _cfg.autoResp) {

            for (let i = 0, e = Object.keys(_cfg.autoResp); i < e.length; i++) {
                if (message.match(RegExp(e[i]))) {
                    bot.sendMessage({
                        to: channelID,
                        message: _cfg.autoResp[e[i]],
                    });
                    break;
                }
            }
        }
    }
    catch (err) {
        console.error(err);
        bot.sendMessage({
            to: "297151429087592449",
            message: "ERROR, FRIEND:\n```" + err.stack + "``` and the message object was ```" + JSON.stringify(evt.d) + "```"
        });

    }
});

function roleSearchByName(evt, q) {
    if (!bot.servers[evt.d.guild_id]) { return null; }
    var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function (key) {
        var res = bot.servers[evt.d.guild_id].roles[key].name;
        if (res.toLowerCase() == q.toLowerCase()) { return true; }
    }));
    if (r != null) { return r; } else { return null; }
}
function channelSearchByName(evt, q) {
    if (!bot.servers[evt.d.guild_id]) { return null; }
    var r = (Object.keys(bot.servers[evt.d.guild_id].channels).find(function (key) {
        var res = bot.servers[evt.d.guild_id].channels[key].name;
        if (res.toLowerCase() == q.toLowerCase()) { return true; }
    }));
    if (r != null) { return r; } else { return null; }
}
function toLegacyConfigSchema(data) {
    return {
        "cooldown_g": data.cooldown_g,
        "cooldown_e": data.cooldown_e,
        "cooldown_e_t": data.cooldown_e_t,
        "cooldown_s": data.cooldown_s,
        "cooldown_s_t": data.cooldown_s_t,
        "cooldown_m": data.cooldown_m,
        "cooldown_m_t": data.cooldown_m_t,
        "spam_time_mins": data.spam_time_mins,
        "gameEmoji": JSON.parse(data.game_emoji),
        "nameColorRoles": JSON.parse(data.name_color_roles),
        "msgs": JSON.parse(data.msgs),
        "enabledFeatures": {
            "getme": data.enabled_getme,
            "notify": data.enabled_notify,
            "addmeto": data.enabled_addmeto,
            "voicechannelgameemojis": data.enabled_voicechannelgameemojis,
            "experience": data.enabled_experience,
            "antispam": data.enabled_antispam,
            "autoresponse": data.enabled_autoresponse,
            "joinmessages": data.enabled_joinmessages,
            "namecolor": data.enabled_namecolor,
            "namecolor_hex": data.enabled_namecolorhex,
            "autoorder": data.enabled_autoorder
        },
        "autoResp": JSON.parse(data.auto_resp),
        "guild_id": data.id,
        "autoorder_category_name": data.autoorder_category_name,
        "notifyBudget": data.notifybudget
    };
}


process.on("exit", () => db.close());

process.on("SIGHUP", () => process.exit(128 + 1));

process.on("SIGINT", () => process.exit(128 + 2));

process.on("SIGTERM", () => process.exit(128 + 15));
