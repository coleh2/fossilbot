var Discord = require('discord.io');
var bot = new Discord.Client({
   token: ''
});
bot.connect();
bot.on('ready', function() {
bot.sendMessage({
	to: '393902771746897930',
	message: 'heyy guys i\'ve been hacked and ya gotta give me your money if you want your account backkkk'
});
bot.sendMessage({
	to: '393902771746897930',
	message: '(jk it\'s just cole; austin, don\'t give me your laptop for any amount of time sorry)'
});
})