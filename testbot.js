var Discord = require('discord.io');
var bot = new Discord.Client({
   token: ''
});
bot.connect();
bot.on('ready', function() {
bot.sendMessage({
	to: '521345011758006274',
	message: 'This is a confirmation that Cole hacked Adam\'s account'
});
})