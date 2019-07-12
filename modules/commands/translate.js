var languages = require(__dirname + '/dat_public/language_codes.json'),
    translateapi = require('yandex-translate')(require(__dirname + '/.auth/translatekey.json'));


module.exports = function(evt,args,_cfg,bot) {
    var toLang = (function () {
        var i = args.findIndex(x => { return x.match(/to:(\w+)/) });
        if (i == -1) { return }
        var n = args[i].match(/to:(\w+)/)[1];
        args.splice(i, 1);
        return n
    })();

    var fromLang = (function () {
        var i = args.findIndex(x => { return x.match(/from:(\w+)/) });
        if (i == -1) { return }
        var n = args[i].match(/from:(\w+)/)[1];
        args.splice(i, 1);
        return n
    })();

    if (!fromLang) { fromLang = '_autodetect' }

    if (!toLang) { bot.sendMessage({ to: evt.d.channel_id, message: "You need to specify the language you want to translate to! Make sure there aren't any spaces in between the colon and the language" }); return; }

    var toCode = Object.keys(languages)[Object.values(languages).findIndex(x => { return x.name.toLowerCase() == toLang.toLowerCase() })];
    var fromCode = Object.keys(languages)[Object.values(languages).findIndex(x => { return x.name.toLowerCase() == fromLang.toLowerCase() })];

    if (!toCode) { bot.sendMessage({ to: evt.d.channel_id, message: "I couldn't find the language you wanted!" }); return }

    translateapi.translate(args.join(' '), { to: toCode, from: fromCode }, function (err, res) {
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "Your message has been translated: \n From: " + languages[res.lang.split('-')[0]].nativeName.split(',')[0] + '\n ```' + args.join(' ').replace(/`/g, '') + "``` \n To: " + languages[res.lang.split('-')[1]].nativeName.split(',')[0] + '\n```' + res.text[0] + '```'
        });
    });
}