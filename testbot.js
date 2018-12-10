var Discord = require('discord.io');
var bot = new Discord.Client({
   token: 'NTE1NTA4NDI1OTc5OTg1OTIw.DtrfFA.ENgMhRSe-cMFGBx1kF-NOnAlwAw'
});
bot.connect();
bot.on('ready', function() {
var tMO = {id: '352567610379862026' };
var e = bot.servers['392830469500043266'];
for(var i = 0, e = Object.keys(bot.servers['392830469500043266'].channels), x; i < e.length; i++) {
	x = JSON.parse(JSON.stringify(bot.servers['392830469500043266'].channels[e[i]]));
	delete bot.servers['392830469500043266'].channels[e[i]]
	bot.servers['392830469500043266'].channels[e[i]] = x;
}
console.log(JSON.stringify(bot.servers['392830469500043266']));
})