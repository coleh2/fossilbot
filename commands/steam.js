var request = require("request");
module.exports = function (evt, args, _cfg, bot) {
    if(!args[0]) return bot.sendMessage({to: evt.d.channel_id, message: "Please include a game title to search!"});
    if(args[0].length == 0) return bot.sendMessage({to: evt.d.channel_id, message: "Please include a game title to search!"});
    if(args.join(' '))
    bot.sendMessage({to: evt.d.channel_id, message: "<a:load:593253216741883904> Seaching Steam for games..."}, function(err, resp) {
        var protoMessageId = resp.id;
        var localData = require("../dat/steamapps.json");
        var filteredData = localData.filter(x => {return x.name.toLowerCase().includes(args.join(' ').toLowerCase())});

        if(filteredData.length == 0) {return bot.editMessage({channelID: evt.d.channel_id, messageID: messageId, message: ":x: Could not find any games with your search term."})}

        var sortedData = filteredData.sort((a,b) => {return a.name.length - b.name.length});
        var game = sortedData[0];

        bot.editMessage({channelID: evt.d.channel_id, messageID: protoMessageId, message: "<a:load:593253216741883904> Found game! Getting details from Steam servers..."});

        request("https://store.steampowered.com/api/appdetails?appids=" + game.appid, function(err, resp, body) {
            if(err) return bot.editMessage({channelID: evt.d.channel_id, messageID: protoMessageId, message: ":x: Error in requesting game..."});
            body = JSON.parse(body)[game.appid];
            if(!body.success) return bot.editMessage({channelID: evt.d.channel_id, messageID: protoMessageId, message: ":x: Something happened on Steam's end, sorry..."});

            body = body.data;
            bot.editMessage({{channelID: evt.d.channel_id, messageID: protoMessageId, message: "", embed: {
                description: body.short_description;
                title: body.name,
                url: "https://store.steampowered.com/app/" + game.appid,
                color: 1779768,
                fields: [
                    {
                        name: "Price",
                        value: body.price_overview.discount_percent?('~~'+body.price_overview.initial_formatted+'~~ ' + body.price_overview.final_formatted + ' ('+body.price_overview.discount_percent+'% off)'):(body.price_overview.initial_formatted),
                        inline: true
                    },
                    {
                        name: "Release Date",
                        value: data.release_date.date,
                        inline: true
                    },
                    {
                        name: "Developer" + (data.developers.length > 1?'s':''),
                        value: data.developers.join(', '),
                        inline: true
                    },
                    {
                        name: "Publisher" + (data.publishers.length > 1?'s':''),
                        value: data.publishers.join(', '),
                        inline: true
                    },
                    {
                        name: "Minimum Age",
                        value: data.required_age,
                        inline: true
                    },

                ],
                footer: {
                    text: (sortedData.length - 1) + " more results-- use >showres"
                }
                timestamp: (new Date()).toISOString()


            }});
        });
        
    });    
}