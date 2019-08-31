var request = require("request");
module.exports = function (evt, args, _cfg, bot) {
    if(!args[0]) return bot.sendMessage({to: evt.d.channel_id, message: "Please include a game title to search!"});
    if(args[0].length == 0) return bot.sendMessage({to: evt.d.channel_id, message: "Please include a game title to search!"});
    if(args.join(" ").length < 2) return bot.sendMessage({to: evt.channel_id, message: "To prevent abuse, you must enter more than 2 characters to search for. Please try again!"});
    bot.sendMessage({to: evt.d.channel_id, message: "<a:load:593253216741883904> Seaching Steam for games..."}, function(err, resp) {
        if(err) {return false;}
        var protoMessageId = resp.id;
        var localData = require(__dirname + "/data/steamapps.json").applist.apps.app;
        var filteredData = localData.filter(x => {return x.name.toLowerCase().includes(args.join(" ").toLowerCase());});

        if(filteredData.length == 0) {return bot.editMessage({channelID: evt.d.channel_id, messageID: protoMessageId, message: ":x: Could not find any games with your search term."});}

        var sortedData = filteredData.sort((a,b) => {return a.name.length - b.name.length;});
        var game = sortedData[0];

        bot.editMessage({channelID: evt.d.channel_id, messageID: protoMessageId, message: "<a:load:593253216741883904> Found game! Getting details from Steam servers..."});

        request("https://store.steampowered.com/api/appdetails?appids=" + game.appid, function(err, resp, body) {
            if(err) return bot.editMessage({channelID: evt.d.channel_id, messageID: protoMessageId, message: ":x: Error in requesting game..."});
            body = JSON.parse(body)[game.appid];
            if(!body.success) return bot.editMessage({channelID: evt.d.channel_id, messageID: protoMessageId, message: ":x: Something happened! Please DM coleh#1346 about this."});

            var data = body.data;
            bot.editMessage({channelID: evt.d.channel_id, messageID: protoMessageId, message: "", embed: {
                description: data.short_description,
                title: data.name,
                thumbnail: {
                    url: data.header_image
                },
                url: "https://store.steampowered.com/app/" + game.appid,
                color: 1779768,
                fields: [
                    {
                        name: "Price",
                        value: data.is_free?"Free":data.price_overview.discount_percent?("~~"+data.price_overview.initial_formatted+"~~ " + data.price_overview.final_formatted + " ("+data.price_overview.discount_percent+"% off)"):(data.price_overview.initial_formatted),
                        inline: true
                    },
                    {
                        name: "Release Date",
                        value: data.release_date.date,
                        inline: true
                    },
                    {
                        name: "Developer" + (data.developers.length > 1?"s":""),
                        value: data.developers.join(", "),
                        inline: true
                    },
                    {
                        name: "Publisher" + (data.publishers.length > 1?"s":""),
                        value: data.publishers.join(", "),
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
                },
                timestamp: (new Date()).toISOString()


            }});
        });
        
    });    
};
