// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
//app = http.createServer(app);
var request = require('request');
var fs = require('fs');
var jsonDb = require('simple-json-db');
var cache = new jsonDb('./webserver/db/webcache.json');
var userDb = new jsonDb('./webserver/db/userdb.json');
var channelDb = new jsonDb('./webserver/db/channelDb.json');
//var auths = require('./webserver/apiCodes.json');
var botAuth = require('./auth.json');

Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

if(cache.JSON().cache === undefined) {
	cache.JSON({"cache": [],"stats":{}});
	cache.sync();
	//console.log('cache initialized: ' + cache.JSON().cache);
}
//console.log(cache.JSON().cache);

app.use(express.json());

//console.log(cache.JSON().cache);
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html

app.get('/discordoauthresponse', function (req,resp) {
        resp.sendFile(__dirname + '/webserver/assets/discordoauthredirect.html');
});
// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(req, resp) {
  resp.send('');
});// http://expressjs.com/en/starter/basic-routing.html
app.get('/lb/:serverId', function(req, resp) {
  resp.sendFile(__dirname + '/webserver/pages/lb.html');
});
app.get('/cp/:serverId', function(req, resp) {
  resp.sendFile(__dirname + '/webserver/pages/cp.html');
});
app.get('/sd/:serverId/:fileName', function(req, resp) {
  try {
  resp.sendFile(__dirname + '/webserver/pages/sd/' + req.params.serverId + req.params.fileName + '.html');
  } catch (e) {}
});
app.get('/lb/csgo', function(req, resp) {
  resp.sendFile(__dirname + '/webserver/pages/csgo.html');
});


app.post('/adminAction',function(req,resp) {
	
	var notAuth = function() {
        console.log('notAuth executed');
        resp.status(401);
        resp.send('"Not Authorized"');
	}
	
    //console.log(req.headers['authorization']);
    if(!req.headers['authorization']) { notAuth(); return }
	var authHead = req.headers['authorization'];
	var authHeadSplit = authHead.split('|');
	if(authHeadSplit.length != 2) { notAuth(); return }
	
	var _usUser = cache.JSON().cache.find(x => {return (x.discord.id.id == authHeadSplit[1])});
	console.log(_usUser.discord.auth);
	if(!_usUser) { notAuth(); return }
	if(!_usUser.discord) { notAuth(); return }
	if(_usUser.discord.auth != authHead) { notAuth(); return }
	
    console.log(req.body);
    
	if(!req.body.guild_id) { resp.sendStatus(400); return }
	
	request({
	  url: 'http://discordapp.com/api/v6/guilds/'+ req.body.guild_id +'/members/' + authHeadSplit[1],
	  method: 'GET',
      headers: {
		  'Authorization': 'Bot ' + botAuth
      }
	}, function(e,r,b) {
		if(e) { console.log('e: ' + e); notAuth(); return }
		var rolesArr;
		try { rolesArr = JSON.parse(b).roles } catch(e) { if(e) { notAuth(); return } }
		//console.log(rolesArr);
		request({
		  url: 'http://discordapp.com/api/v6/guilds/'+ req.body.guild_id,
		  method: 'GET',
		  headers: {
			  'Authorization': 'Bot ' + botAuth
		  }
		}, function(e,r,b) {
		    if(e) { notAuth(); return }
			var serverRolesArr;
			//console.log(b);
			try { serverRolesArr = JSON.parse(b).roles } catch(e) { if(e) { notAuth(); return } }
			serverRolesArr = serverRolesArr.filter(x => {
			    return (0x8 & x.permissions)
			});
			if(!serverRolesArr.find(x => { return ~rolesArr.indexOf(x.id) })) { notAuth(); return }
			//now that all that validation's aside, let's get down to bid-ness.
			console.log('yeah seems legit');
			
			process.send({fn: "setServerConfig", cfg: req.body});
			
			resp.sendStatus(200);
		});
	});
});

app.get('/connectCode',function(req,resp) {
   // console.log(req.headers);
    if(!req.headers['authorization']) { return }
    
	request({
      url: 'https://discordapp.com/api/v6/users/@me',
      method: 'GET',
      headers: {
		  'Authorization': 'Bearer ' + req.headers['authorization']
      }
  },function(e,r,b) {
      console.log(b);
      if(r.statusCode==200) {
          resp.status = 200;
          var sendDat = (function() {
                    try { b = JSON.parse(b); } catch(e) {console.log(e) }
                    var udb = cache.JSON();
                     var uimI = udb.cache.findIndex(x => {return (x.discord.id.id == b.id)});
                     if(uimI == -1) { return }
                     if(!udb.cache[uimI].discord.auth) {
            udb.cache[uimI].discord.auth = (function (m,n,i,c,f) { 
                c = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890_-!";
                for(i=0;i<30;i++) {
                    f = (f||'') + c.charAt(m.floor(m.random() * c.length));
                }
                return f
            })(Math) + '|' + b.id
            cache.JSON(udb);
            cache.sync();
        }
        
        return {code: udb.cache[uimI].discord.auth, user: udb.cache[uimI].discord.id}
              })();
           console.log(sendDat);    
          resp.send(sendDat);
      } else {
        resp.status = 403;
        resp.send('"Not Authorized"');
      }
  });


});

app.get('/data', function(req, resp) {
	console.log('request for data!');
	var u = userDb.JSON();
	var c = cache.JSON().cache;
	var q = req.query;
	if(q.src == 'steam') {
				if(q.type == 'lb') {
					try {
					var uS = c.filter(x => { return x[q.src].data[q.mode]});
					//uS = uS.slice(q.start, q.start + 100)
					for(var i = 0; i < uS.length; i++) {
					
					uS[i] = {r: 
					{stats: uS[i][q.src].data[q.mode].playerstats.stats.filter(x => {
						return x.name == 'total_kills' || x.name == 'total_deaths' || x.name == 'total_contribution_score' || x.name == 'total_matches_won' || x.name == 'total_matches_played' || x.name == 'total_shots_fired' || x.name == 'total_shots_hit'
						}) }, discord: uS[i].discord.id}
					
					}
					uS[0].s = cache.JSON().stats
					} catch (e) {console.log(e)}
					if(!uS) {
					resp.status = 404
					resp.send('404 Not Found');
					return null
					
					}
					
					//console.log(uS);
					resp.status = 200
					resp.send(uS);
				
				} else if(q.type == 'spec') {
					try {
						var uS = c.filter(x => { return x[q.src].data[q.mode]});
						uS = uS.find(x => { return x.discord.id.id == q.did })
						
						
					} catch(e) {console.log(e)}
					if(!uS) {
					resp.status = 404
					resp.send('404');
					return null
					
					}
					
					uS = uS[q.src].data[q.mode]
					resp.status = 200
					resp.send(uS);
					
				}
	} else if (q.src == 'discord') {
	
					if(q.type == 'lb') {
						try {
						var uS = c.filter(x => { try {return x[q.src].data[q.mode] } catch(e) {}});
						if(!uS) console.log('uS isn"t a thing!!');
                        var _uSLength = uS.length;
						uS = uS.slice(q.start, q.start + 100)
						for(var i = 0; i < uS.length; i++) {
						uS[i] = {r: uS[i][q.src].data[q.mode], discord: uS[i].discord.id}
						}
						uS[0].s = cache.JSON().stats;
                        uS[0].s.aL = _uSLength;
						} catch (e) {console.log('Caught Error ' +e)}
						
						if(!uS) {
						resp.status = 404
						resp.send('404');
						return null
						}
						
						//console.log(uS);
						resp.status = 200
						resp.send(uS);
				} else if (q.type == 'cfg') {
					if(!q.mode) { resp.sendStatus(400); return }

					//~~just some authentication-- nothing drastic needed here~~ cHANGE OF PLANS AUTHORIZATION REEQQQUUUIIIREDDD
	var notAuth = function() {
        console.log('notAuth executed');
        resp.status(401);
        resp.send('"Not Authorized"');
	}
	
    //console.log(req.headers['authorization']);
    if(!req.headers['authorization']) { notAuth(); return }
	var authHead = req.headers['authorization'];
	var authHeadSplit = authHead.split('|');
	if(authHeadSplit.length != 2) { notAuth(); return }
	
	var _usUser = cache.JSON().cache.find(x => {return (x.discord.id.id == authHeadSplit[1])});
	console.log(_usUser.discord.auth);
	if(!_usUser) { notAuth(); return }
	if(!_usUser.discord) { notAuth(); return }
	if(_usUser.discord.auth != authHead) { notAuth(); return }
	
    console.log(req.body);
    
	
	request({
	  url: 'http://discordapp.com/api/v6/guilds/'+ q.mode +'/members/' + authHeadSplit[1],
	  method: 'GET',
      headers: {
		  'Authorization': 'Bot ' + botAuth
      }
	}, function(e,r,b) {
		if(e) { console.log('e: ' + e); notAuth(); return }
		var rolesArr;
		try { rolesArr = JSON.parse(b).roles } catch(e) { if(e) { notAuth(); return } }
		//console.log(rolesArr);
		request({
		  url: 'http://discordapp.com/api/v6/guilds/'+ q.mode,
		  method: 'GET',
		  headers: {
			  'Authorization': 'Bot ' + botAuth
		  }
		}, function(e,r,b) {
		    if(e) { notAuth(); return }
			var serverRolesArr;
			//console.log(b);
			try { serverRolesArr = JSON.parse(b).roles } catch(e) { if(e) { notAuth(); return } }
			serverRolesArr = serverRolesArr.filter(x => {
			    return (0x8 & x.permissions)
			});
			if(!serverRolesArr.find(x => { return ~rolesArr.indexOf(x.id) })) { notAuth(); return }
			//now that all that validation's aside, let's get down to bid-ness.
			console.log('yeah seems legit');
					fs.readFile('./.data/db.json', 'utf8', function (err, data) {
				
					if(err) return

					var s = JSON.parse(data).config[q.mode];

					if(!s) { resp.sendStatus(500); return }
					if(!s.guild_id) { s.guild_id = q.mode }
					 resp.send(s);
				});
		});
	});

				} else if (q.type == 'votes') {
                if(!q.mode) { resp.sendStatus(400); return }
				if(!cache.JSON().discordvotes[q.mode]) { cache.JSON().discordvotes[q.mode] = [] }
                resp.send({d: cache.JSON().discordvotes[q.mode].slice(q.start, q.start + 100)})
                } else {
					resp.sendStatus(400); return 
				}
	} else {
		resp.sendStatus(400); return 
	}
});

app.use(express.static(__dirname + '/webserver/assets'));

process.on('message', (m) => {
  if(m.cmd) {
	  var evt = m.cmd;
	  var c = cache.JSON();
	  var cC = c.cache;
	  var cDb = channelDb.JSON();
	  var s = cC.find(x => { return x.discord.id.id == evt.d.author.id });
	  
	  if(!cDb[evt.d.guild_id]) { cDb[evt.d.guild_id] = {} }
	  
	  if(!cDb[evt.d.guild_id][evt.d.author.id]) { cDb[evt.d.guild_id][evt.d.author.id] = Date.parse(evt.d.timestamp) }
	  
	  //if an item is too old, delete it
	  for(var i = 0, e = Object.keys(cDb[evt.d.guild_id]); i < e.length; i++) {
	     if(cDb[evt.d.guild_id][e[i]] < Date.parse(evt.d.timestamp) - 604800000) { delete cDb[evt.d.guild_id][e[i]] }
	  }
	  //adjust activity metrics
	  /*
      if(!cDb[evt.d.guild_id]) { cDb[evt.d.guild_id] = {} }
      if(!cDb[evt.d.guild_id].tree) { cDb[evt.d.guild_id].tree = {} }
      if(!cDb[evt.d.guild_id].total) { cDb[evt.d.guild_id].total = 0 }
      if(!cDb[evt.d.guild_id].tree[evt.d.channel_id]) { cDb[evt.d.guild_id].tree[evt.d.channel_id] = 0 }
	  
	  cDb[evt.d.guild_id].lastSet = Date.now();
	  cDb[evt.d.guild_id].tree[evt.d.channel_id] = cDb[evt.d.guild_id].tree[evt.d.channel_id] + 1
	  cDb[evt.d.guild_id].total = cDb[evt.d.guild_id].total + 1
	  
	  //calculation for "activity score": (c/t)*(r/1000000000000)
	  */
	  channelDb.JSON(cDb);
	  channelDb.sync();
	  
	  
	  if(!s) { 
	  
	  cC.push({discord: {id: evt.d.author, data: {} }})
	  s = {discord: {id: evt.d.author, data: {} }}
	  
	  }
	  
	  
	  
	  if(!s.discord) s.discord = {}
	  if(!s.discord.data) s.discord.data = {}
	  if(!s.discord.data[evt.d.guild_id]) s.discord.data[evt.d.guild_id] = {}
	  
	  if(!s.discord.data[evt.d.guild_id].lastGain) s.discord.data[evt.d.guild_id].lastGain = 0
	  
	  s.discord.id = evt.d.author;
	  
	  var cS = s.discord.data[evt.d.guild_id].score; 
	  var cM = s.discord.data[evt.d.guild_id].sms;
	  var cL = s.discord.data[evt.d.guild_id].level;
	  var lvUped = false;
	  
	  if(!cS) cS = 0;
	  if(!cM) cM = 0;
	  if(!cL) cL = 0;
	  
	  if(s.discord.data[evt.d.guild_id].lastGain < Date.now()-(1000*60)) {
	  cS = cS + Math.floor( (Math.random() * 15 ) + 10 )
      s.discord.data[evt.d.guild_id].lastGain = Date.now()
      }
	  
	  cM++
	  
	  s.discord.data[evt.d.guild_id].score = cS
	  s.discord.data[evt.d.guild_id].sms = cM
	  s.discord.data[evt.d.guild_id].neededXp = Math.floor(5 / 6 * (cL+1) * (2 * (cL+1) * (cL+1) + 27 * (cL+1) + 91))
	  s.discord.data[evt.d.guild_id].level = cL
	  s.discord.data[evt.d.guild_id].totalNeededXp = ( s.discord.data[evt.d.guild_id].neededXp + ( 5 / 6 * (cL) * (2 * (cL) * (cL) + 27 * (cL) + 91) ) )
	  

	  s.discord.data[evt.d.guild_id].sName = m.serverDat.name
	  s.discord.data[evt.d.guild_id].sId = m.serverDat.id
	  s.discord.data[evt.d.guild_id].sIcon = m.serverDat.icon
	  
	   
	  
	  /*console.log('current score: ' +cS);
	  console.log('Total Exp Required to level up: ' + ( s.discord.data[evt.d.guild_id].neededXp + ( 5 / 6 * (cL) * (2 * (cL) * (cL) + 27 * (cL) + 91) ) ));
	  console.log('Can Level Up: ' + ( cS >= ( s.discord.data[evt.d.guild_id].totalNeededXp)));*/
	  
	  for( ; cS >= s.discord.data[evt.d.guild_id].totalNeededXp ; ) {
		s.discord.data[evt.d.guild_id].level = s.discord.data[evt.d.guild_id].level + 1
	    s.discord.data[evt.d.guild_id].neededXp = Math.floor(5 / 6 * (s.discord.data[evt.d.guild_id].level+1) * (2 * (s.discord.data[evt.d.guild_id].level+1) * (s.discord.data[evt.d.guild_id].level+1) + 27 * (s.discord.data[evt.d.guild_id].level+1) + 91))
	    s.discord.data[evt.d.guild_id].totalNeededXp = ( s.discord.data[evt.d.guild_id].neededXp + ( 5 / 6 * (s.discord.data[evt.d.guild_id].level) * (2 * (s.discord.data[evt.d.guild_id].level) * (s.discord.data[evt.d.guild_id].level) + 27 * (s.discord.data[evt.d.guild_id].level) + 91) ) )
		console.log('Level up!');
		lvUped = true;
	  }
	  /*if(cS >= s.discord.data[evt.d.guild_id].neededXp + ( 5 / 6 * (cL) * (2 * (cL) * (cL) + 27 * (cL) + 91) )) {
		  s.discord.data[evt.d.guild_id].level++
		  
	  }*/
	  
	  var tI = cC.findIndex(x => { return x.discord.id.id == evt.d.author.id });
	  cC[tI] = s
	  
	  c.cache = cC;
	  cache.JSON(c);
	  cache.sync();
	  process.send({c:cache.JSON(),e:evt,l:lvUped,d:s});
    } else if (m.fn == 'getLinkCode') {
        var udb = cache.JSON();
        if(!m.evt) { return } else { var evt = m.evt }
        var uimI = udb.cache.findIndex(x => {console.log( x.discord.id.id == evt.d.author.id ); return (x.discord.id.id == evt.d.author.id)});
        console.log('uimI: ' + uimI);
        if(uimI == -1) { return }
        if(!udb.cache[uimI].discord.auth) {
            udb.cache[uimI].discord.auth = (function (m,n,i,c,f) { 
                c = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890_-!";
                for(i=0;i<30;i++) {
                    f = (f||'') + c.charAt(m.floor(m.random() * c.length));
                }
                return f
            })(Math) + '|' + evt.d.author.id
            cache.JSON(udb);
            cache.sync();
        }
        
        process.send({code: udb.cache[uimI].discord.auth, evt: evt, fn: 'giveLinkCode'});
        
    }
});



function reloadCache(service, mode) {
//var sKey = auths[service];

if(!sKey) return null
console.log('Reloading cache for ' + service + '.');
switch (service) {

case 'steam':
var filteredUserDb = userDb.JSON().filter(x => {return x.ids.steam != ''} )
	for(var i = 0; i < filteredUserDb.length; i++) {
		
		var u = filteredUserDb;
		var c = cache.JSON().cache;
		console.log(u[i].ids.steam);
		request.get('http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid='+ mode + '&key=' + sKey +'&steamid=' +  u[i].ids.steam, function(err,resp,body) {
			    if(resp.statusCode != 200) {
					console.log(resp.request.uri.query.split('&steamid=')[1]);
					var u = filteredUserDb;
					var udI = u.findIndex(x => { return x.ids.steam == resp.request.uri.query.split('&steamid=')[1] });
				     u[udI].ids.steam = ''
					userDb.JSON(u);
					userDb.sync();
				console.log('Error reloading the cache for user ' + (udI+1) + ': ' + resp.statusCode + ' - Steam ID cleared.');
				
				} else {
			    try {
				body = JSON.parse(body);
				} catch(e) {if(e) {console.log(body); } }
				//console.log(body);
				if(body.playerstats) {
				var c = cache.JSON().cache;
				var u = filteredUserDb;
				var uI = c.findIndex(x => { return x.steam.data[mode].playerstats.steamID == body.playerstats.steamID });
				var udI = u.findIndex(x => { return x.ids.steam == body.playerstats.steamID });
				console.log(uI,udI);
				if(uI != -1) {
					if(c[uI].steam.data[mode] != body) {
					c[uI].steam.data[mode] = body;
					if(c[uI].discord === null || c[uI].discord === undefined) {
						c[uI].discord = {}
					    c[uI].discord.id = u[udI].ids.discord
					}
					var cacheSet = cache.JSON();
					cacheSet.cache = c
					cache.JSON(cacheSet);
					cache.sync();
					}
				  var cacheStatSet = cache.JSON();
				  cacheStatSet.stats.lastReload = Date.now();
				  cache.JSON(cacheStatSet);
				  cache.sync()
				} else if (udI != -1) {
					var x = {};
					x.steam = {}
					if(x.discord) {
					x.discord = {}
					x.discord.id = u[udI].ids.discord
					}
					x.steam.data = {}
					x.steam.data[mode] = body;
					c.push(x);
					var cacheSet = cache.JSON();
					cacheSet.cache = c
					cacheSet.stats.lastReload = Date.now();
					cache.JSON(cacheSet);
					cache.sync();
					console.log('Added a user to the cache!');
				} else console.log('Reload failed');
				}
				}
			 });
		
	}
	break
}
}/*
setInterval(function() {
	reloadCache('steam','730');
}, 600000)
reloadCache('steam','730');*/

var server = app.listen(5555, function() {
  console.log('Your app is listening on port ' + server.address().port);
});
process.on('SIGTERM', function() {  server.close(); cache.sync(); process.exit(); });
