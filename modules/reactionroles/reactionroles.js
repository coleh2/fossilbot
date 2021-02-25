var reactionMessagesDb = new (require("simple-json-db"))(__dirname + "/../../.data/reactionRoleMessages.json");

var bot;

module.exports = function(_bot) {
    bot = _bot;

    return {
        "add": createReactionMsg,
        "reaction": onReact,
    };
};

function createReactionMsg(evt) {
    if(!(evt.d.content || "").toLowerCase().startsWith(">reactionrole") &&
    !(evt.d.content || "").toLowerCase().startsWith(">rr")) return false;

    console.log(evt.d.content);

    let dbContent = reactionMessagesDb.JSON();

    let reacts = parseMessage(evt.d.content);

    console.log(reacts);
    if(reacts == false) return bot.sendMessage({to:evt.d.channel_id,message:"Please don't use custom emoji!"});

    let dbEntry = {
        "serverId": evt.d.guild_id,
        "messageId": evt.d.id,
        "reactions": reacts
    };

    dbContent[evt.d.id] = dbEntry;

    reactionMessagesDb.JSON(dbContent);
    reactionMessagesDb.sync();

    bot.sendMessage({
        to: evt.d.channel_id,
        message: "Reaction Roles detected & registered! Listening for reactions: " + Object.keys(reacts).join(", ") + ". You can delete this message or edit your original message."
    });
}

function onReact(evt) {
    console.log(evt);

    let dbContent = reactionMessagesDb.JSON();

    let releventMessage = dbContent[evt.d.message_id];

    if(!releventMessage) return false;

    let emoji = evt.d.emoji.id ? `<:${evt.d.emoji.name}:${evt.d.emoji.id}>` : evt.d.emoji.name;

    console.log("emoji",emoji);
    console.log("roles",releventMessage.reactions);
    console.log("emojirole",releventMessage.reactions[emoji]);

    if(!releventMessage.reactions[emoji]) return false;


    bot.addToRole({
        serverID: releventMessage.serverId,
        roleID: releventMessage.reactions[emoji],
        userID: evt.d.user_id
    },console.log);
}


function parseMessage(msgText) {
    let lines = msgText.split("\n");

    if(!lines[0].includes("<@&")) lines.splice(0,1);

    let result = {};

    for(let i = 0; i < lines.length; i++) {
        let lineTerms = lines[i].split(/ +/);

        let emoji = lineTerms[0];

        result[emoji] = (/<@&(\d+)>/).exec(lineTerms[1])[1];
    }

    return result;
}
