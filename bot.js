var http = require('http');
var express = require('express');
var app = express();
var strdoc = require('./doc.json');
var Discord = require('discord.io');
var swears = require('bad-words'),
    swears = new swears();
//var xrs = require('x-ray-scraper');
var Profanity_Scanner = require('profanity-matcher');
var pf = new Profanity_Scanner();
var auth = require('./auth.json');
var pokemon = require('./getme_context_data/pokemon.json');
    pokemon = pokemon.pokemon;
var citiesdata = require('./getme_context_data/us_cities.json');
    citiesdata = citiesdata.cities;
var gothouses = require('./getme_context_data/got_noble_houses.json');
    gothouses = gothouses.Noble_Houses;
var hpchars = require('./getme_context_data/harry_potter_chars.json');
var resparray = [];
var request = require('request');
var fs = require('fs');
var jsonDb = require('simple-json-db');
var db = new jsonDb('./.data/db.json');
var htmlParse = require('fast-html-parser');
var cp = require('child_process');
var velociraptors = {cPs:[]};/*
var raptorTokens = require('./velociraptortokens.json');
velociraptors.cPs.push(cp.fork('./voicebot.js',[''],{env: {TOKEN: raptorTokens[0]}}));
velociraptors.cPs.push(cp.fork('./voicebot.js',[''],{env: {TOKEN: raptorTokens[1]}}));
velociraptors.cPs.push(cp.fork('./voicebot.js',[''],{env: {TOKEN: raptorTokens[2]}}));
for(var i = 0; i < 3; i++) {
    velociraptors.cPs[i].on('message', function(m) {
        if(m.f == 'freeRaptor') {
            if(!velociraptors[m.g]) { return }
            if(!velociraptors[m.g][m.c]) { return }
            var e = velociraptors[m.g][m.c];
            if(!e) { return }
            delete velociraptors[m.g][m.c]
        }
        
    });
}*/
var cooldowns = {};
cooldowns.everyone = {};
cooldowns.specific = {};
cooldowns.mass = {};
cooldowns.warned ={};
cooldowns.muted ={};
var loyalty = {};
var voiceSessions = {};
//var juliusTEST = new Julius();
var periodMessages = {sent: {}, arr: []};
var { createCanvas } = require('canvas');
   //Image = Canvas.Image;
var cp = require('child_process');
var ytsl = require('youtube-search-list').search;
var bayesMl = require('bayes');
var bayes = bayesMl();
const webserver = cp.fork(`${__dirname}/webserver.js`);
var pointCache = {};
var jsdom = require("jsdom");
const { JSDOM } = jsdom;


//load the ml data
/*(function() {
	var d = db.JSON();
	if(d.bayes) { bayes = bayesMl.fromJson(d.bayes); }
	
	
})();*/

var playerVotes = {};
var cfg = {
	cooldown_e: 2,
	cooldown_e_t: 3600000,
	cooldown_s: 5,
	cooldown_s_t: 180000 ,
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
	    "yellow": ['Citizen','Count','Keeper'],
	    "lime": ['Citizen','Count','Keeper'],
	    "cyan": ['Citizen','Count','Keeper'],
	    "purple": ["Count", "Keeper"],
	    "white": ["Count", "Keeper"],
		"slightly bloodthirsty orange": ["Count", "Keeper"],
	
	},
	commonSynonyms: {
	levels: "leaderboard",
	rank: "score",
	xp: "score",
	nametag: "namecolor",
	color: "namecolor",
	get: "getme",
	listnotify: "notifylist",
	name: "nametag",
	tag: "nametag",
	points: "score",
	colorname: "namecolor",
	lb: "leaderboard",
	add: "addmeto",
	take: "takemefrom"
	},
	msgs: {
	joinPublic: "Welcome to the server, <@{USER}>!",
	joinPrivate: "Welcome to the server, <@{USER}>!"
	},
    enabledFeatures:{"getme":true,"notify":true,"addmeto":true,"voicechannelgameemojis":true,"experience":true,"antispam":true,"autoresponse":true,"joinmessages":true,"namecolor":true},
    autoResp:{"^([A-Z \\d_]|[^\\w]){20,}$":"woah cool down fam","(R|r)(S|s)(M|m)":"This is what you meant, right? <https://www.urbandictionary.com/define.php?term=RSM>"}
};

console.log('💾 Process launched!');

webserver.on('message', function(m) {
	pointCache = m.c

	if(m.l) {
		var evt = m.e;
        if(!evt) return
		
		bot.sendMessage({
			to: evt.d.channel_id,
			message: 'Congrats, <@' + evt.d.author.id + '>! You just leveled up to level ' + m.d.discord.data[evt.d.guild_id].level + '\n*This message will be deleted in 10s*'
			
		}, function(e,r) { setTimeout(function() { bot.deleteMessage({channelID: r.channel_id, messageID: r.id}); }, 10000 ) 
    });
		
	} else if (m.fn == "giveLinkCode") {
		bot.sendMessage({
			to: m.evt.d.author.id,
			message: 'Your connection code is: ```' + m.code + '```. Alternatively, you can use this link to automatically sign in: \nhttp://fossilbot.cf/lb/' + m.evt.d.guild_id + '?acn=gcn&tcd=' + encodeURIComponent(m.code)
			
		});
        
    } else if (m.fn == "setServerConfig") {
    var dbc = db.JSON();
    dbc.config[m.cfg.guild_id] = m.cfg
	db.JSON(dbc);
	db.sync();
    
    }
	
	
});


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

app.get("/", (request, response) => {
  console.log('🔋 ' + Date.now() + " Ping Received");
  response.sendStatus(200);
});
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth
});
bot.connect();

function loyalty (n, f, evt) {
var d = db.JSON();
if (d.loyalty == null) {d.loyalty = {}}
if (d.loyalty[evt.d.guild_id] == null) {d.loyalty[evt.d.guild_id] = {}}
if (configVals(evt.d.guild_id)['loyalty-rank'] == null) {return false}
if (d.loyalty[evt.d.guild_id][evt.d.author.id] == null) {d.loyalty[evt.d.guild_id][evt.d.author.id].n = 0}
if (f == '+') {d.loyalty[evt.guild_id][evt.d.author.id].n = d.loyalty[evt.guild_id][evt.d.author.id].n + n}
else if (f == '-') {d.loyalty[evt.guild_id][evt.d.author.id].n = d.loyalty[evt.guild_id][evt.d.author.id].n - n}
else {d.loyalty[evt.guild_id][evt.d.author.id].n = n}
if (d.loyalty[evt.d.guild_id][evt.d.author.id].n < 0) {d.loyalty[evt.d.guild_id][evt.d.author.id].n = 0}
db.JSON(d);
}

function loyaltyProcess(evt) {
  var a = bot.servers[evt.d.guild_id];
  var r = (Object.keys(a.roles).find(function(key) {
    var res = bot.channels[key].name;
    if(res == configVals(evt.d.server_id)['loyalty-rank']) {return true} else {}      
  }));
  if(db.JSON().loyalty[evt.d.guild_id][evt.d.author.id].n <= configVals(evt.d.server_id)['loyalty-req']) {
  }
}

//on bot ready
bot.on('ready', function (evt) {
    console.log('📡 Connected');
    console.log('🔑 Logged in as: ' + bot.username + ' - (' + bot.id + ')');
    bot.setPresence({ status: 'online', game: { name: 'with >help' } });
    console.log('📱 Presence set');
});
setInterval(() => {
	try {
      for (var i = 0, e; i <= Object.keys(cooldowns.everyone).length; i++){
        
	      cooldowns.everyone[Object.keys(cooldowns.everyone)[i]] = {}
	  }
	} catch(err) {console.log(err)}   
	  bot.connect();
	  console.log('@.everyone Cooldowns reset!');
}, 3600000);

// Automatically reconnect if the bot disconnects
bot.on('disconnect', function(erMsg, code) {
    console.log('⚠️ Bot disconnected from Discord with code ' + code + ' for reason: ' + erMsg);
    bot.connect();
});

var cmdprefix = ">";
var doRSM = true,
    botenabled = true;
var cfgtrytime = 0;
var createdRoleGlobal;


  

function resetDb() {
  db.JSON({config: {}, loyalty: {}})
  console.log('🗄️ Database reset!');
}

function bingGetPic(q, bot, channelID, x, number,evt) {
var cisnsfw = bot.servers[x.d.guild_id].channels[channelID].nsfw;

var _cfg = cfg;
if(db.JSON().config[x.d.guild_id]) { cfg = db.JSON().config[x.d.guild_id] }

if(number == 0) {

var pkmnItem = pokemon.find(itm => { return q.toLowerCase().match(itm.name.toLowerCase()) });
if(!pkmnItem) { var cityItem = citiesdata.find(itm => { return q.toLowerCase().match(itm.city.toLowerCase()) && (q.toLowerCase().match('population') || q.toLowerCase().match('city') || q.toLowerCase().match('location')) }); }
if(!pkmnItem && !cityItem) { var houseItem = gothouses.find(itm => { return q.toLowerCase().match('house ' + itm.House.toLowerCase())}); }
if(!pkmnItem && !cityItem && ! houseItem) { var hpcharItem = hpchars.find(itm => { return q.toLowerCase().match(itm.First.toLowerCase() + ' ' + itm.Last.toLowerCase()) || ( q.toLowerCase().match(itm.First.toLowerCase()) && itm.Last == "" && number == 0)  }); }
//console.log(pkmnItem)
 

if(pkmnItem) { q = pkmnItem.name + ' pokemon' }
else if(cityItem) { q = cityItem.city + ' city' }
else if(houseItem) { q = 'Game of Thrones House ' + houseItem.House }
else if(hpcharItem) { q = 'Harry Potter ' + hpcharItem.First + ' ' + hpcharItem.Last  }
}  

var url = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q) + '&safe=active';
var doLinkInstead = false, img;
if (cisnsfw) {url = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q) + '&safe=images'} 
//if(_cfg.getmeLinkKeywords) { if((function (a,b,e,i) { for(i=0,e=a.split(' ');i<e.length;i++) { if(b.toLowerCase().match(e[i].toLowerCase())) { return }  }})(_cfg.getmeLinkKeywords,q) ) { var doLinkInstead = true; url = 'https://www.google.com/search?q=' + encodeURIComponent(q) }  } }
if(q.toLowerCase().match('xkcd')) { url = 'https://www.google.com/search?q=' + encodeURIComponent(q); doLinkInstead = true; }
console.log('🖼️ Getme request for ' + url);
request(url, function (err, resp, body) {
  body = (new JSDOM(body)).window.document
  console.log(body);
if(doLinkInstead) {
  img = body.querySelectorAll('.r > a');
} else {
  img = body.querySelectorAll('img');
}
if(img[0] == null) {
bot.sendMessage({
  to: channelID,
  message: "That query didn't get any approved results!"
});
return
}
var color = _cfg.getmeColor || 7604687;
if(!img[number]) number = img.length - 1
console.log(img[number].href||img[number].src);
var finalUrl = img[number].href?img[number].href:img[number].src;
if(pkmnItem) {
    var pkmnTypes = ['','Normal','Fighting','Flying','Poison','Ground','Rock','Bug','Ghost','Steel','Fire','Water','Grass','Electric','Psychic','Ice','Dragon','Dark'];
	var pkmnColors = {};
    console.log( (pkmnTypes[pkmnItem.type1_id] ) + ( pkmnItem.type2_id?('/' + pkmnTypes[pkmnItem.type2_id]):'') );
    console.log(pkmnTypes[pkmnItem.type1_id] + pkmnTypes[pkmnItem.type2_id]);
    console.log(pkmnItem.type1_id + pkmnItem.type2_id);
	var data = {
	  "to": channelID,
	  "embed": {
		"title": pkmnItem.name + ':',
		"description": pkmnItem.species + ' Pokemon *Pokedex #' + pkmnItem.ndex + '*',
		"color": 13246239,
        "footer": {
             "text": "\u2122 Pok\u00E9mon & all related: The Pok\u00E9mon Company International and Nintendo."
        },
		"image": {
		  "url": finalUrl
		},
		"fields": [
			{
				"name": "Type:",
				"value": ( pkmnTypes[pkmnItem.type1_id] ) + ( pkmnItem.type2_id?('/' + pkmnTypes[pkmnItem.type2_id]):'' ),
				"inline": true
			},
			{
				"name": "Height/Weight:",
				"value": pkmnItem.height + '/' + pkmnItem.weight,
				"inline": true
			}
		
		]
	  }
	};
	
} else if (cityItem) {
	var data = {
	  "to": channelID,
	  "embed": {
		"title": cityItem.city + ':',
		"description": '',
		"color": 12383345,
        "footer": {
             "text": "Source: 2016 US population census"
        },
		"image": {
		  "url": finalUrl
		},
		"fields": [
			{
				"name": "State:",
				"value": cityItem.state,
				"inline": true
			},
			{
				"name": "Population:",
				"value": cityItem.population,
				"inline": true
			}
		
		]
	  }
	};
	
} else if (houseItem) {
	var data = {
	  "to": channelID,
	  "embed": {
		"title": 'House ' + houseItem.House + ':',
		"description": '',
		"color": 5982006,
        "footer": {
             "text": "data from: github.com/danielecappuccio"
        },
		"image": {
		  "url": finalUrl
		},
		"fields": [
			{
				"name": "Sigil:",
				"value": houseItem.Sigil,
				"inline": true
			},
			{
				"name": "Words/Motto:",
				"value": houseItem.Words.join?'"'+houseItem.Words.join('", "')+'"':'"'+houseItem.Words+'"',
				"inline": true
			},
			{
				"name": "Seats:",
				"value": houseItem.Seats.join?houseItem.Seats.join(', '):houseItem.Seats,
				"inline": true
			},
			{
				"name": "Founded By:",
				"value": houseItem.Founders.join?houseItem.Founders.join(', '):houseItem.Founders,
				"inline": true
			}
		
		]
	  }
	};
	
} else if (hpcharItem) {
	var data = {
	  "to": channelID,
	  "embed": {
		"title": hpcharItem.First + ' ' + hpcharItem.Last + ':',
		"description": '',
		"color": 11934253,
		"image": {
		  "url": finalUrl
		},
		"fields": [
			{
				"name": "House:",
				"value": hpcharItem.House,
				"inline": true
			},
			{
				"name": "Blood Status:",
				"value": hpcharItem.Status,
				"inline": true
			},
			{
				"name": "Canonicity:",
				"value": hpcharItem.Canonicity,
				"inline": true
			},
			{
				"name": "Hogwarts Class Year:",
				"value": hpcharItem.Year,
				"inline": true
			},
			{
				"name": "Total Mentions:",
				"value": hpcharItem.Mentions,
				"inline": true
			},
			{
				"name": "Hogwarts Prefect | Head Student",
				"value": (hpcharItem.Prefect?'\u2705':'\u274c') + '/' + (hpcharItem.Head?'\u2705':'\u274c'),
				"inline": true
			},
			{
				"name": "Order of the Phoenix Member",
				"value": (hpcharItem.OotP?'\u2705':'\u274c'),
				"inline": true
			}
		
		]
	  }
	};
	
} else {
	if(doLinkInstead) {
	var data = {
	  "to": channelID,
	  "message": decodeURIComponent(finalUrl.substring(7).split('&')[0])
	}; 
    } else { 
	var data = {
	  "to": channelID,
	  "embed": {
		"color": color,
		"image": {
		  "url": finalUrl
		}
	  }
	};
    }
	
}
bot.sendMessage(data);
});
}

//Update the name of voice channels when the first person joins
bot.on('voiceStateUpdate', function(evt) {
	
	var _cfg = cfg;
	if(db.JSON().config[evt.d.guild_id]) { cfg = db.JSON().config[evt.d.guild_id] }

if(!_cfg.enabledFeatures.voicechannelgameemojis) { return }	
	
if(!evt.d.channel_id || voiceSessions[evt.d.user_id]) { 
	if(!voiceSessions[evt.d.user_id]) { return }
	evt.d._channel_id = voiceSessions[evt.d.user_id];
	if(Object.keys(bot.channels[evt.d._channel_id].members).length == 0 && bot.channels[evt.d._channel_id].name.substring(0,3) == '\ud83c\udfae:' && bot.channels[evt.d._channel_id].name.length >= 5) {
	request({
      url: 'https://discordapp.com/api/v6/channels/' + evt.d._channel_id,
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
		  'Authorization': 'Bot ' + auth
      },
	  body: '{"name": "' + bot.channels[evt.d._channel_id].name.split('| ').splice(1).join('| ') + '"}'
  },function(e,r,b) {console.log(r.statusCode)});
	}
	
	voiceSessions[evt.d.user_id] = null
	if(!evt.d.channel_id) { return } 
}
voiceSessions[evt.d.user_id] = evt.d.channel_id
if(!bot.users[evt.d.user_id].game) { 
    if(Object.keys(bot.channels[evt.d.channel_id].members).length == 1 && bot.channels[evt.d.channel_id].name.length < 96&& bot.channels[evt.d.channel_id].name.substring(0,3) != '\ud83c\udfae:') {
	request({
      url: 'https://discordapp.com/api/v6/channels/' + evt.d.channel_id,
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
		  'Authorization': 'Bot ' + auth
      },
	  body: '{"name": "' + ( ( '\ud83c\udfae:' + '\ud83c\udf37') + '| ' + bot.channels[evt.d.channel_id].name ) + '"}'
  },function(e,r,b) {console.log(r.statusCode)});
    return
	}
 }
 if(!_cfg.gameEmoji) { _cfg.gameEmoji = {'foo':'bar'} }
if(Object.keys(bot.channels[evt.d.channel_id].members).length == 1 && bot.channels[evt.d.channel_id].name.length < 96&& bot.channels[evt.d.channel_id].name.substring(0,3) != '\ud83c\udfae:') {
	request({
      url: 'https://discordapp.com/api/v6/channels/' + evt.d.channel_id,
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
		  'Authorization': 'Bot ' + auth
      },
	  body: '{"name": "' + ( '\ud83c\udfae:' + (_cfg.gameEmoji[bot.users[evt.d.user_id].game.name] || '\ud83c\udfb2') + '| ' + bot.channels[evt.d.channel_id].name ) + '"}'
  },function(e,r,b) {console.log(r.statusCode)});
}
});

//when people join, do stuff
bot.on('guildMemberAdd', function(member,evt) {
	
	var _cfg = cfg;
	if(db.JSON().config[evt.d.guild_id]) { cfg = db.JSON().config[evt.d.guild_id] }
	
    bot.addToRole({serverID: evt.d.guild_id, userID: evt.d.user.id, roleID: roleSearchByName(evt, 'New Recruit')}, function (err) {if (err != null && err.statusMessage != 'NOT FOUND') {console.log(err);}});
if(!_cfg.msgs.joinPublic) { return }
if(!_cfg.msgs.joinPrivate) { return }
if(!_cfg.enabledFeatures.joinmessages) { return }
   try {
	bot.sendMessage({
		to: evt.d.guild_id,
		message: _cfg.msgs.joinPublic.replace('{USER}',evt.d.user.id)
	});	
   } catch (e) { }
	bot.sendMessage({
		to: evt.d.user.id,
		message: _cfg.msgs.joinPrivate.replace('{USER}',evt.d.user.id)
	});

});
bot.on('message', function (user, userID, channelID, message, evt) {
	try {
	

	
  //deny commands in DMs
  if(!bot.servers[evt.d.guild_id] && message.split(' ')[0] == '>help') {
			var helpdochere = strdoc.help.main
			if(message.split(' ')[1] && strdoc.help[message.split(' ')[1]]) { helpdochere = strdoc.help[message.split(' ')[1]] }
				bot.sendMessage({
					to: userID,
					message: helpdochere
				});	  
			return
	} else if(!bot.servers[evt.d.guild_id]) { return } 
	
	var _cfg = cfg;
	if(db.JSON().config[evt.d.guild_id]) { _cfg = db.JSON().config[evt.d.guild_id] } else {
    (function() {
        var dbc = db.JSON();
        dbc.config[evt.d.guild_id] = cfg
        dbc.config[evt.d.guild_id].guild_id = evt.d.guild_id
        db.JSON(dbc);
        db.sync();
        
    })();    
    }
	
  //if the user is a bot, stop ALL of this stuff
  if(evt.d.author.bot) return
  if(_cfg.enabledFeatures.antispam) {
	//set timeout for checking for the spam emoji-- if it's not an isthisspam command
    /*if(evt.d.content.split(' ')[0].toLowerCase() != '>isthisspam') {
        setTimeout(function() {
        request({
          url: 'https://discordapp.com/api/v6/channels/' + evt.d.channel_id + '/messages/' + evt.d.id,
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bot ' + auth
          }
      },function(e,r,b) {
            //console.log('resp:\n');
            //console.log(b);
            //console.log('\n:resp');
          if(e == null && b) {
            if(!b) { return }
              try {
            var resp = JSON.parse(b);
            } catch (e) {}
            if(!resp) { return }
            if(!resp.content) { return }
            if(!bayes.toJson().docCount) { var confrm = true; } else { var confrm = false; }
            if( confrm || ((bayes.toJson().docCount.nospam || 0) <= ((bayes.toJson().docCount.spam || 0) + 5))) {
                if(!resp.reactions) { bayes.learn(resp.content, 'nospam'); return }
                if(resp.reactions.filter(x => (x.emoji.name.toLowerCase() === "this_is_spam"))) {
                    bayes.learn(resp.content, 'spam');
                
                } else {
                    bayes.learn(resp.content, 'nospam');
                }
          }
            var dbc = db.JSON();
            dbc.bayes = bayes.toJson();
            db.JSON(dbc);
            db.sync();
            
          } else { console.log('error with GETting message obj') };
          
      });
        },120000);
    }*/
    (function(d,c) {
        d=db.JSON();
        c=evt.d;
        if(!d.mL) { d.mL = [] }
        d.mL.push(c);
        db.JSON(d);
        db.sync();        
    })();
  if(cooldowns.everyone[evt.d.author.id] == null || isNaN(cooldowns.everyone[evt.d.author.id])) {cooldowns.everyone[evt.d.author.id] = 2}
  if (evt.d.mention_everyone) {
    cooldowns.everyone[evt.d.author.id] = cooldowns.everyone[evt.d.author.id] - 1
    console.log('📯 Message mentioning @everyone in server ' + evt.d.guild_id + ' from ' + evt.d.author.username + '#' + evt.d.author.discriminator + '. They have ' + cooldowns.everyone[evt.d.author.id] + ' uses left before cooldown.');
    if (cooldowns.everyone[evt.d.author.id] <= 0) {
      var everyonerole = everyoneRoleSearch(evt);
      console.log('User ' + evt.d.author.username + '#' + evt.d.author.discriminator + ' is now on @everyone cooldown for server ' + evt.d.guild_id + ' ("' + bot.servers[evt.d.guild_id].name + '"). The role is ' + everyonerole); 
    bot.removeFromRole({serverID: evt.d.guild_id, userID: evt.d.author.id, roleID: everyonerole}, function (err) {if (err != null && err.statusMessage != 'NOT FOUND') {console.log(err);}});
      
    }
  }

  if (cooldowns.everyone[evt.d.author.id] > 0 || cooldowns.everyone[evt.d.author.id] === null) {
    var everyonerole = everyoneRoleSearch(evt);
    bot.addToRole({serverID: evt.d.guild_id, userID: evt.d.author.id, roleID: everyonerole}, function (err) {if (err != null && err.statusMessage != 'NOT FOUND') {console.log(err);}});
  }
  
  //cooldowns for pinging specific people and/or mass pingin
  //if the account is a bot account, don't do any of this
  if(!evt.d.author.bot) {
	  //if either mass or specific records don't exist, make them
	  if (cooldowns.specific[userID] == null) cooldowns.specific[userID] = {}
	  if (cooldowns.mass[userID] == null) cooldowns.mass[userID] = []
	  
	  //if specific records for the @-ed person(s) don't exist, make them (if applicable)
	  
	  for(var i = 0; i < evt.d.mentions.length; i++) {
		  if(cooldowns.specific[userID][evt.d.mentions[i].id] == null) cooldowns.specific[userID][evt.d.mentions[i].id] = [];
	  }
	  
	  //loop through and delete expired entries
	  //for specific
	  var slst = Object.keys(cooldowns.specific[userID]);
	  
	  for(var i = 0, x; i < slst.length; i++) {
		x = slst[i];
		for(var iz = 0, y; iz < cooldowns.specific[userID][x].length; iz++) {
			y = cooldowns.specific[userID][x][iz];
			if(y.t < Date.now() - _cfg.cooldown_s_t) {
				cooldowns.specific[userID][x].splice(i, 1);
			}
		}
		
	  }
	  //for mass
	  for(var i = 0, x; i < cooldowns.mass[userID].length; i++) {
		x = cooldowns.mass[userID][i];
		
		if(x.t < Date.now() - _cfg.cooldown_m_t) {
			cooldowns.mass[userID].splice(i, 1);
		}
		
	  }
	  
	  //Add message data to records, if applicable
	  //for warnings and mutings
	  
	  if(!cooldowns.warned[userID]) { cooldowns.warned[userID] = false }
	  if(!cooldowns.muted[userID]) { cooldowns.muted[userID] = false }
	  
	  //for actual spamming
	  if(evt.d.mentions.length > 0) {
			var time = Date.now();
			//for specific people:
			for(var i = 0; i < evt.d.mentions.length; i++) {
				cooldowns.specific[userID][evt.d.mentions[i].id].push({t: time, m: evt.d.id});
			}
	  
	  //for mass @ing:
		for(var i = 0; i < evt.d.mentions.length; i++) {
			cooldowns.mass[userID].push({t: time, m: evt.d.id});//note: this is disabled atm
		}	  
	  }
	  
	  //Where everything actually gets done-- if they went over the limit, give them the Criminal role and send a message explaining how they were detected
	  if(cooldowns.mass[userID].length >= _cfg.cooldown_m || Object.keys(cooldowns.specific[userID]).filter(itm => cooldowns.specific[userID][itm].length >= _cfg.cooldown_s).length > 0) {
		if(cooldowns.muted[userID] == false) {
		bot.sendMessage({
			to: channelID,
			message: 'You have been auto-detected as spamming! Please wait ' +( _cfg.spam_time_mins )+ ' minutes in order to be able to type again.'
		});
		cooldowns.muted[userID] = true
		}
		
		
		bot.addToRole({
			serverID: evt.d.guild_id,
			userID: evt.d.author.id,
			roleID: '461629603996368928' //'485614819341238302'
		});
		console.log('detected as spam');

	 //then, after half an hour, remove the role & unwarn them
	  setTimeout(function() {
		bot.removeFromRole({
			serverID: evt.d.guild_id,
			userID: evt.d.author.id,
			roleID: '461629603996368928' 
		});
		cooldowns.warned[userID] = false
		cooldowns.muted[userID] = false

	  
	  }, _cfg.spam_time_mins * 60000);
	  
	  } else if((cooldowns.mass[userID].length >= _cfg.cooldown_m - 1 || Object.keys(cooldowns.specific[userID]).filter(itm => cooldowns.specific[userID][itm].length >= _cfg.cooldown_s - 1).length > 0) && cooldowns.warned[userID] == false) {
	   bot.sendMessage({
		to: channelID,
		message: ':warning: You\'re about to be marked for spam; please hold off on the pinging or you\'ll be muted for ' +( _cfg.spam_time_mins )+ ' minutes. Thank you!'
	   });
	   cooldowns.warned[userID] = true
	  }
	 // console.log('Warned: ' + cooldowns.warned[userID] + '\n Muted: ' + cooldowns.muted[userID]);
  }
  }
  if(_cfg.enabledFeatures.experience) {  
  //add a random number between 10 and 25 to the score
  if(message.substring(0,1) != cmdprefix) {
	  try {
  webserver.send({cmd: evt,serverDat: bot.servers[evt.d.guild_id]});
	  } catch (e) { console.log(e)}
  }
  }

  evt.d.server_id = evt.d.guild_id
  var svid = evt.d.server_id;
    if (message.substring(0, 15) == "fossilbotprefix" && botenabled == true) {
      var args = message.substring(1).split(' ');
      var cmd = args[0];
      cmdprefix = args[1];
 
      
      bot.setPresence({ status: 'online', game: { name: "with " + cmdprefix + "help" } });
      bot.sendMessage({
        to: channelID,
        message: 'The command prefix (`>` by default) was set to `' + cmdprefix + "`"
      });
      return
    }
    
    
    
    
    
    
    
    
    if (message.substring(0, 1) == cmdprefix) {

        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch(cmd.toLowerCase()) {
            // !info
            case 'info':
                //parse argument for userID
                var thatUser;
                if(evt.d.mentions[0]) {
                    thatUser = bot.servers[evt.d.guild_id].members[evt.d.mentions[0].id].id
                } else if(args[0].split('#').length == 2) {
                    if(Object.values(bot.servers[evt.d.guild_id].members).find(x => { return bot.users[x.id].username == args[0].split('#')[0] && bot.users[x.id].discriminator == args[0].split('#')[1] })) {
                        thatUser = Object.values(bot.servers[evt.d.guild_id].members).find(x => { return bot.users[x.id].username == args[0].split('#')[0] && bot.users[x.id].discriminator == args[0].split('#')[1] }).id
                    }
                }
                if(thatUser) {
                    var tUO = bot.users[thatUser];
                    var tMO = bot.servers[evt.d.guild_id].members[thatUser];
                    var messageDat = {
                        to: channelID,
                        embed: {
                            "title": 'Data on ' + tUO.username + ":",
                            "image":     {
                                "url": tUO.avatar?"https://cdn.discordapp.com/avatars/"+tUO.id+"/"+ tUO.avatar:"https://cdn.discordapp.com/embed/avatars/"+ (tUO.discriminator%5) +".png"
                            },
                            "fields": [
                              {
                                "name": "Joined At",
                                "value": Date(Date.parse(tMO.joined_at)).toString(),
                                "inline": true
                              },
                              {
                                "name": "Internal ID",
                                "value": tMO.id,
                                "inline": true
                              },
                              {
                                  "name": "Roles",
                                  "value": tMO.roles.length?'<@&'+tMO.roles.join('>, <@&') + '>':'',
                                  "inline": true
                              },
                              {
                                  "name": "Name",
                                  "value": db.JSON().users[tUO.id]?db.JSON().users[tUO.id]:'Unknown',
                                  "inline": true
                              },
                              {
                                "name": "Join Place",
                                "value": ((Object.values(bot.servers[evt.d.guild_id].members)).sort(function(a,b) { return a.joined_at - b.joined_at}).findIndex(x => {return x.id == tMO.id})) + 1,
                                "inline": true
                              }
                            ]
                        
                        }
                    }
                    bot.sendMessage(messageDat);
                } else {
					bot.sendMessage({
						to: channelID,
						message: "I didn't find anyone from that search. Please be sure to include a user's Discord Username and Tag (e.g. username#0000"
					}); 
                }
                
            break
			// !isthisspam
			/*case 'isthisspam':
			var cat = bayes.categorize(args.join(' '));
			console.log(cat);
                bot.sendMessage({
                    to: channelID,
                    message: ( cat || "Could not classify, sorry")
                });
			break*/
			case 'vote':
			if(!Object.values(playerVotes).find(x => {return (x.q == args.join(' '))}) && !playerVotes[args[0]]) {
				playerVotes[args.join('_').toLowerCase()] = {q: args.join(' '), c: evt.d.author.id, y:0, n:0, v: {}, i: Object.values(playerVotes).length+1}
                bot.sendMessage({
                    to: channelID,
                    message: "Your poll, `" + args.join('_') + "`, has been created! Use `>vote " + args.join('_') + " yes|no` to cast a vote =)" 
                });
			} else if(args[1] && args[1] != "score" && playerVotes[args[0]]) {
				if(playerVotes[args[0]].v[evt.d.author.id]) {
					bot.sendMessage({
						to: channelID,
						message: "You can only vote once!"
					});
					
				} else {
				switch(args[1].toLowerCase()) {
					case 'yes':
					    playerVotes[args[0]].y = playerVotes[args[0]].y + 1
						playerVotes[args[0]].v[evt.d.author.id] = true
                bot.sendMessage({
                    to: channelID,
                    message: "Your vote has been recorded, thank you! The current score is " + playerVotes[args[0]].y + " votes for Yes, and " + playerVotes[args[0]].n + " votes for No"
                });
					break
					case 'no':
					    playerVotes[args[0]].n = playerVotes[args[0]].n + 1
						playerVotes[args[0]].v[evt.d.author.id] = true
                bot.sendMessage({
                    to: channelID,
                    message: "Your vote has been recorded, thank you! The current score is " + playerVotes[args[0]].y + "votes for Yes, and " + playerVotes[args[0]].n + " votes for No"
                });
					break
					default:
				bot.sendMessage({
                    to: channelID,
                    message: "Oops, that's an error! Are you sure your command follows the syntax correctly?"
                });
					break
				}
			}
			} else if(playerVotes[args[0]]) {
				bot.sendMessage({
                    to: channelID,
                    message: "Currently, the score for `" + playerVotes[args[0]].q + "` is " + playerVotes[args[0]].y + " for Yes to " + playerVotes[args[0]].n + " for No"
                });
			} else {
				bot.sendMessage({
                    to: channelID,
                    message: "Oops, that's an error! Are you sure your command follows the syntax correctly?"
                });
			}				
			break
			//!coffee
            case 'coffee':
                bot.sendMessage({
                    to: channelID,
                    message: 'https://www.dunkindonuts.com/en/food-drinks/hot-drinks/coffee'
                });
			break
			// !tea
            case 'tea':
                bot.sendMessage({
                    to: channelID,
                    message: 'https://www.dunkindonuts.com/en/food-drinks/hot-drinks/tea'
                });
			break
			// !leaderboard
            case 'leaderboard':
                bot.sendMessage({
                    to: channelID,
                    message: 'You can view this server\'s leaderboard at <http://fossilbot.cf/lb/' + evt.d.guild_id + '>'
                });
            break	
			case 'remindme':
			
			break
			case 'addmeto':
            if(!_cfg.enabledFeatures.addmeto) { console.log(_cfg.enabledFeatures); return }
            var specificChanRole = roleSearchByName(evt, (( args.slice(0,3).join(' ') ) ) + ' Channel');
			if(specificChanRole != null) {
				bot.addToRole({
					serverID: evt.d.guild_id,
					userID: evt.d.author.id,
					roleID: specificChanRole
				});
				bot.sendMessage({
					to: channelID,
					message: 'You\'ve been added to the channel.'
				});
			} else {
				bot.sendMessage({
					to: channelID,
					message: 'I didn\'t find an open channel by that name. I\'ve sent the full list to your DMs; maybe you made a typo?'
				});
				bot.sendMessage({
					to: evt.d.author.id,
					message: (function (evt) { 
					
var e = [];
 var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function(key) {
    var res = bot.servers[evt.d.guild_id].roles[key].name;
    if(res.substring(res.length - 8, res.length).toLowerCase() == ' Channel') {e.push(res.substring(0, res.length  - 8))} else {}      
  }));
  return e
  

					})(evt).join('\n')
				});
            }
			
			break
			case 'takemefrom':
			try {
			if(roleSearchByName(evt, (( args.slice(0,3).join(' ') ) ) + ' Channel')) {
			bot.removeFromRole({
				serverID: evt.d.guild_id,
				userID: evt.d.author.id,
				roleID: roleSearchByName(evt, (( args.slice(0,3).join(' ') ) ) + ' Channel')});
			bot.sendMessage({
				to: channelID,
				message: 'You\'ve been removed from the channel.'
			});
			} else {
			bot.sendMessage({
				to: channelID,
				message: 'I didn\'t find that. Maybe you made a typo?'
			});


			} } catch(e) {console.log(e)}
			break
			// !notifylist
			case 'notifylist':
            if(!_cfg.enabledFeatures.notify) { return }	
			var thatNotifyRole = roleSearchByName(evt, args.slice(0,3).join(' ').substring(0,32) + ' Notifications');
			if(thatNotifyRole) {
			var usrs = bot.servers[evt.d.guild_id].members;
			if(!usrs) { return }
			usrs = Object.values(usrs);
			usrs = usrs.filter(x => {
				return x.roles.includes(thatNotifyRole);
				
			});
			var endMsg = [];
			for(var i = 0; i < usrs.length; i++) {
			    endMsg.push( usrs[i].nick || bot.users[usrs[i].id].username );
			
			}
			var txtMsg = ( 'Here are the people in that role (' + endMsg.length + ' total): \n- ' + endMsg.join('\n- '));
			
			bot.sendMessage({
				to: channelID,
				message: txtMsg
			});
			}
			break
			// !notifyroles
			case 'notifyroles':
            if(!_cfg.enabledFeatures.notify) { return }	
			var nRoles = Object.values(bot.servers[evt.d.guild_id].roles).filter(x => { 
				return (x.name.substring(x.name.length - 14, x.name.length) == ' Notifications')
			});
		    if(!nRoles) { return }
			for(var i = 0; i < nRoles.length; i++) {
			nRoles[i] = nRoles[i].name
			}
			var txtMsg = ( 'Notification Roles In '+ bot.servers[evt.d.guild_id].name +' (' + nRoles.length + ' total): \n- ' + nRoles.join('\n- '));
			
			bot.sendMessage({
				to: channelID,
				message: txtMsg
			});
			break
			//>score
            case 'score':
								
				fs.readFile('./webserver/db/webcache.json', 'utf8', function (err, data) {
				
					if(err) return

					var s = JSON.parse(data).cache.find(x => { return x.discord.id.id == evt.d.author.id});

					if(!s) return
					s = s.discord.data[evt.d.guild_id]
					

					bot.sendMessage({
						to: channelID,
						message: '<@'+evt.d.author.id+'>, you are currently at level '+s.level+' and have '+s.score+' XP points. You need '+(s.totalNeededXp-s.score)+' more XP points to level up ('+( Math.floor(((s.totalNeededXp-s.score)/s.neededXp)*100 ) )+'%)'
					});
				});
            break
			// !help 
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'Don\'t worry, <@' +userID+'>-- I\'ll DM you the help documentation.'
                });
			var helpdochere = strdoc.help.main
			if(args[0] && strdoc.help[args[0]]) { helpdochere = strdoc.help[args[0]] }
				bot.sendMessage({
					to: userID,
					message: helpdochere
				});
			break
			//>notify
			case 'notify':
            if(!_cfg.enabledFeatures.notify) { return }	
                        var specificNotifRole;
			if(roleSearchByName(evt, (( args.slice(0,3).join(' ').substring(0,32) ) || "Annoying People") + ' Notifications') == null) {
			    bot.createRole(evt.d.guild_id, function(err,resp) { 
					if(err) { console.log(err); return }
					console.log(resp);
					specificNotifRole = resp.id 
					console.log(specificNotifRole);
					bot.editRole({serverID:evt.d.guild_id,roleID:specificNotifRole,name: ( ( args.slice(0,3).join(' ').substring(0,32) ) || "Annoying People") + ' Notifications',mentionable:true});
					if(specificNotifRole) { 
						bot.addToRole({
						serverID: evt.d.guild_id,
						userID: evt.d.author.id,
						roleID: specificNotifRole 
						}); 
					}
				});
			} else {
                        specificNotifRole = roleSearchByName(evt, ( ( args.slice(0,3).join(' ').substring(0,32) ) || "Annoying People") + ' Notifications');
                        bot.addToRole({
				serverID: evt.d.guild_id,
				userID: evt.d.author.id,
				roleID: specificNotifRole
			});
                        }
			bot.sendMessage({
				to: channelID,
				message: 'You\'ve been added to the notification role for `'+ ( ( args.slice(0,3).join(' ').substring(0,32) ) || "Annoying People") + '`'
			});
			
            break   
			//!unnotify
			case 'unnotify':
            if(!_cfg.enabledFeatures.notify) { return }	
			try {
			if(roleSearchByName(evt, args.slice(0,3).join(' ').substring(0,32) + ' Notifications')) {
			bot.removeFromRole({
				serverID: evt.d.guild_id,
				userID: evt.d.author.id,
				roleID: roleSearchByName(evt, args.slice(0,3).join(' ').substring(0,32) + ' Notifications')			});
			bot.sendMessage({
				to: channelID,
				message: 'You\'ve been removed from the notification role for `' + args.join(' ') +'`'
			});
			} else {
			bot.sendMessage({
				to: channelID,
				message: 'I didn\'t find the notification role for `' + args.join(' ') +'`. Maybe you made a typo?'
			});


			} } catch(e) {console.log(e)}
            break  		
		  case 'link':
		  bot.sendMessage({
			  to: channelID,
			  message: 'I\'ll DM you with a linking code right away, <@' + evt.d.author.id + '>'
		});
		webserver.send({fn: 'getLinkCode', evt: evt});
		  break
			// >getme
          case 'getme':
          if(!_cfg.enabledFeatures.getme) { return }
				var query = args.join(' ');
				var indx = null;
			        var _indx = /(?:(?:number)|#) *(\d+)/i.exec(query);
				if(_indx) { indx = _indx[1] } else { indx = 0 }
				if(indx) { query = query.replace(/(?:(?:number)|#) *(\d+)/i, '') }
				
				if(!query) { return }
				if(query.toLowerCase().match(/Eli Perchenok ?/i)) { bot.sendMessage({to:channelID,message:"The subject of this picture has requested that it be removed from the results. Thank you!"}); return }
				bingGetPic(query, bot, channelID, evt, indx);
                break
      case 'namecolor':
      if(!_cfg.enabledFeatures.namecolor) { return }
        var c = roleName(evt, args.join(' ').toLowerCase());
		var accpt = (_cfg.nameColorRoles[(args.join(' ') || 'None').toLowerCase()]);
        if(!bot.servers[evt.d.guild_id]) {
		  c = null
		  bot.sendMessage({
			  to: channelID,
			  message: 'An error occured! Try again in another server!'
		});
		
		}
        if (c != null) {
			var iscpt = false, nocpt = 0;
			if(accpt) {
			    for(var i = 0; i < accpt.length; i++) {
					console.log(nocpt);
				    var aR = roleSearchByName(evt,accpt[i]);
					console.log(aR);
				    if(aR) {
                        console.log(bot.servers[evt.d.guild_id].members[evt.d.author.id].roles[aR]);
						if(!bot.servers[evt.d.guild_id].members[evt.d.author.id].roles[aR]) {
						     nocpt++
						
						}
					}
				}
				if(nocpt > 0) { iscpt = false } else { iscpt = true}
				console.log(iscpt);
			} else { iscpt = true }
            console.log({iscpt:iscpt,accpt:accpt,nocpt:nocpt});
			if(!iscpt) {
			  bot.sendMessage({
				to: channelID,
				message: 'Sorry, but you are not permitted to have that color'
			  });	
			} else if (iscpt) {
				evt.d.member.roles.find(function(key) {
				  var res = bot.servers[evt.d.guild_id].roles[key].name;
				  if(res.substring(res.length - 8, res.length).toLowerCase() == ' nametag' && key != c){ bot.removeFromRole({serverID: evt.d.guild_id, userID: userID, roleID: key});} else {}      
				});
			  console.log("🖌️ Nametag Color on server " + evt.d.server_id + " for " + evt.d.author.username + "#" + evt.d.author.discriminator + " changed to " + args.join(' ') + " (" + c +")");
			  bot.addToRole({serverID: evt.d.guild_id, userID: evt.d.author.id, roleID: c});
			  bot.sendMessage({
				to: channelID,
				message: 'Your nametag color has been set!'
				  
			  });
			}
        } else if(args[0].toUpperCase().replace('#','').match(/^([0-F]){6}$/)) {
            if(_cfg.enabledFeatures.namecolor_hex) {
                var hexCode = args[0].replace('#','').match(/^([0-F]){6}$/).input;
                if(!hexCode) {
                    bot.sendMessage({
                        to: channelID,
                        message: "Okay, if you're seeing this error, something has gone VERY WRONG. DM coleh#1346 ASAP",
                    });
                } else {
                   var hexDecNum = parseInt(hexCode,16);
                   function hexColorDelta(hex1, hex2) {
                        // get red/green/blue int values of hex1
                        var r1 = parseInt(hex1.substring(0, 2), 16);
                        var g1 = parseInt(hex1.substring(2, 4), 16);
                        var b1 = parseInt(hex1.substring(4, 6), 16);
                        // get red/green/blue int values of hex2
                        var r2 = parseInt(hex2.substring(0, 2), 16);
                        var g2 = parseInt(hex2.substring(2, 4), 16);
                        var b2 = parseInt(hex2.substring(4, 6), 16);
                        // calculate differences between reds, greens and blues
                        var r = 255 - Math.abs(r1 - r2);
                        var g = 255 - Math.abs(g1 - g2);
                        var b = 255 - Math.abs(b1 - b2);
                        // limit differences between 0 and 1
                        r /= 255;
                        g /= 255;
                        b /= 255;
                        // 0 means opposit colors, 1 means same colors
                        return (r + g + b) / 3;
                    }
                    if(hexColorDelta(hexCode, '140A02') < 0.8) {
                        if(colorRoleObjList(evt).find(x => { return hexColorDelta(x.color.toString(16),hexCode) > 0.95 })) {
                            bot.addToRole({
                            serverID: evt.d.guild_id,
                            userID: evt.d.author.id,
                            roleID: colorRoleObjList(evt).find(x => { return hexColorDelta(x.color.toString(16),hexCode) > 0.95 }).id 
                            }); 
                              bot.sendMessage({
                                to: channelID,
                                message: 'Your nametag color has been set! *Please note that your color has been \'snapped\' to a preexisting color I found, which was more than 95% the same as yours.'
                                  
                              });
                        } else {
                            bot.createRole(evt.d.guild_id, function(err,resp) { 
                                if(err) { console.log(err); return }
                                //console.log(resp);
                                var JustMadeRole = resp.id;
                                bot.editRole({serverID:evt.d.guild_id,roleID:JustMadeRole,name: '#' + hexCode + ' Nametag',color:hexDecNum});
                                if(JustMadeRole) { 
                                    bot.addToRole({
                                    serverID: evt.d.guild_id,
                                    userID: evt.d.author.id,
                                    roleID: JustMadeRole 
                                    }); 
                                      bot.sendMessage({
                                        to: channelID,
                                        message: 'Your nametag color has been set!'
                                          
                                      });
                                }
                            });
                        }
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: "Oh no, it looks like that color is too close to Discord Grey. Please pick a more contrasting color :smiley:",
                        });
                    }
                    
                }
            } else {
                bot.sendMessage({
                    to: channelID,
                    message: "Oops, custom hex codes for nametags aren't supported on this server.",
                });
            }
        }else if (colorRoleList(evt).length > 0) {
		var clrRoleList = colorRoleList(evt);
		if(args.length > 0 && ( args[0] != 'none' && args[0] != 'clear') ) {
		bot.sendMessage({
			to: channelID,
			message: "That's not a valid color here! I'll DM you a list of colors that work on this server.",
		});
		//Generate image of colors 

var canvas = createCanvas(100,(clrRoleList.length*40));
var ctx = canvas.getContext('2d');
var colorRObjs = colorRoleObjList(evt);
ctx.font = '12px Arial';
 for(var i = 0; i < colorRObjs.length; i++) {
  ctx.beginPath();
  ctx.fillStyle = '#' + colorRObjs[i].color.toString(16);
  console.log(i);
  ctx.rect(0,i*40,100,40);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = colorRObjs[i].color>3355443?'#000000':'#ffffff';
  var _name = colorRObjs[i].name.split(' Nametag')[0]
  if(_name.length > 16) {
  _name = _name.substring(0,16)+ '...';
  }
  ctx.fillText(_name,5,(i*40)+15);
  
} 
console.log(canvas.height);
//console.log(canvas.toDataURL());
		bot.uploadFile({
			to: evt.d.author.id,
			message: 'Colors: \n' + clrRoleList.join('\n'),
			file: canvas.toBuffer(),
			filename: 'colorRole.png' 
		});
		
	    } else if (args[0] == 'none' || args[0] == 'clear') {
			evt.d.member.roles.find(function(key) {
				var res = bot.servers[evt.d.guild_id].roles[key].name;
				if(res.substring(res.length - 8, res.length).toLowerCase() == ' nametag'){ bot.removeFromRole({serverID: evt.d.guild_id, userID: userID, roleID: key});} else {}      
			});
			bot.sendMessage({
				to: channelID,
				message: "Your name color has been restored to the default!",
			});
		} else {
		bot.sendMessage({
			to: channelID,
			message: 'You need to include a color!',
		});
		}
		evt.d.member.roles.find(function(key) {
            var res = bot.servers[evt.d.guild_id].roles[key].name;
            if(res.substring(res.length - 8, res.length).toLowerCase() == ' nametag'){ bot.removeFromRole({serverID: evt.d.guild_id, userID: userID, roleID: key});} else {}      
        });
        } else {
		bot.sendMessage({
			to: channelID,
			message: "Sorry, that feature isn't enabled on this server! Use `>help namecolor` to learn more.",
		});
		}
		break
		default:
			
			if(_cfg.commonSynonyms[cmd.toLowerCase()]) { var dym = " Do you mean `>" + _cfg.commonSynonyms[cmd] + '`?'; } else { var dym; }
			bot.sendMessage({
				to: channelID,
				message: "Sorry, I couldn't find a command named `" + cmd + '`.' + (dym || ' Try using `>help` to get a list of commands :smiley:' )
			});
		break
         }

      return
     }
     
     if(_cfg.enabledFeatures.autoresponse) {

    
    if(_cfg.autoResp) {
    
    for(var i = 0, e = Object.keys(_cfg.autoResp); i < e.length; i++) {
        if(_cfg.autoResp[e[i]]) {
        if(message.match(RegExp(e[i]))) {
            bot.sendMessage({
                to: channelID,
                message: _cfg.autoResp[e[i]],
            });
            break
        }
        }
    }
    
    }
         
     
    if((message.toLowerCase().indexOf('sry') != -1 || message.toLowerCase().indexOf('sorry')) != -1 && message.length < 16 && evt.d.author.id == 297151429087592449) {
    bot.sendMessage({
    to: channelID,
    message: 'no'
    }, function(e,r) { setTimeout(function() { bot.deleteMessage({channelID: r.channel_id, messageID: r.id}); }, 5000 ) 
    });
    //setTimeout(function() { bot.deleteMessage({channelID: evt.channel_id, messageID: evt.id}, function(e,r){if(e) { console.log(e) } } ); }, 5000 );
    }
     }
  } 
  catch(err) {
  console.log(err.lineNumber);
  console.log(err);
  bot.sendMessage({
      to: (channelID||"447382861771833364"),
      message: "Sorry, there was an error. The error has been reported to <@297151429087592449>; please try again later."
  });
  bot.sendMessage({
      to: "297151429087592449",
      message: 'ERROR, FRIEND:\n```' + err.toString() + '``` and the message object was ```' + JSON.stringify(evt.d) + '```'
  });
    
}
});
function embedPic(url, color) {
var embed = {
  "color": color,
  "image": {
    "url": url
  }
};
return embed
}
function configVals(x) {
  var e = db.JSON();
  if (e.config == null) {return null}
  return e.config[x]
}

function roleName(evt, q) {
if(!bot.servers[evt.d.guild_id]) { return null }
  var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function(key) {
    var res = bot.servers[evt.d.guild_id].roles[key].name;
    if(res.substring(0, res.length - 8).toLowerCase() == q.toLowerCase() && res.substring(res.length - 8, res.length).toLowerCase() == ' nametag') {return true} else {}      
  }));
  if (r != null) {return r} else {return null}
}

function roleSearchByName(evt, q) {
if(!bot.servers[evt.d.guild_id]) { return null }
  var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function(key) {
    var res = bot.servers[evt.d.guild_id].roles[key].name;
    if(res.toLowerCase() == q.toLowerCase() ) {return true} else {}      
  }));
  if (r != null) {return r} else {return null}
}

function colorRoleList(evt) {
if(!bot.servers[evt.d.guild_id]) { return null }
var e = [];
 var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function(key) {
    var res = bot.servers[evt.d.guild_id].roles[key].name;
    if(res.substring(res.length - 8, res.length).toLowerCase() == ' nametag') {e.push(res.substring(0, res.length  - 8))} else {}      
  }));
  return e
}
function colorRoleObjList(evt) {
if(!bot.servers[evt.d.guild_id]) { return null }
var e = [];
 var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function(key) {
    var res = bot.servers[evt.d.guild_id].roles[key].name;
    if(res.substring(res.length - 8, res.length).toLowerCase() == ' nametag') {e.push(bot.servers[evt.d.guild_id].roles[key])} else {}      
  }));
  return e
}



function colorRoleObjList(evt) {
if(!bot.servers[evt.d.guild_id]) { return null }
var e = [];
 var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function(key) {
    var res = bot.servers[evt.d.guild_id].roles[key].name;
    if(res.substring(res.length - 8, res.length).toLowerCase() == ' nametag') {e.push(bot.servers[evt.d.guild_id].roles[key])} else {}      
  }));
  return e
}

function everyoneRoleSearch(evt) {
if(!bot.servers[evt.d.guild_id]) { return null }
var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function(key) {
    var res = bot.servers[evt.d.guild_id].roles[key].name;
	if(res) {
    if(res.toLowerCase().substring(0, 8) == 'everyone') {return true} else {}    
	}	
  }));
  if (r != null) {return r} else {return null}
}

process.on('SIGTERM', function() {  webserver.kill() });
