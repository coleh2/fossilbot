var Discord = require('discord.io');
var bot = new Discord.Client({
   token: 'NTE1NTA4NDI1OTc5OTg1OTIw.DtrfFA.ENgMhRSe-cMFGBx1kF-NOnAlwAw'
});
bot.connect();
bot.on('ready', function() {
var tMO = {id: '352567610379862026' };
console.log((((Object.values(bot.servers['392830469500043266'].members)).sort(function(a,b) { return a.joined_at - b.joined_at}).findIndex(x => {return x.id == tMO.id}))+1) + '/' + Object.keys(bot.servers['392830469500043266'].members).length);
})