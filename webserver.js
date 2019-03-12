
var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
//app = http.createServer(app);
var request = require('request');
var fs = require('fs');
var nodemailer = require('nodemailer')
var jsonDb = require('simple-json-db');
var cache = new jsonDb('./webserver/db/webcache.json');
var userDb = new jsonDb('./webserver/db/userdb.json');
var channelDb = new jsonDb('./webserver/db/channelDb.json');
//var auths = require('./webserver/apiCodes.json');
var botAuth = require('./auth.json');

var callbacks = {};

var db;


module.exports = function(_db) {
	if(!_db) return false;
	db = _db
	return exportFunctions;
}


var exportFunctions = {
	onLevelUp: (cb) => { callbacks.onLevelUp = cb; },
	onEmailAuth: (cb) => { callbacks.onEmailAuth = cb; },
	incrementXp: incrementXpFunc,
	emailCodeGenerateAndSend: emailCodeGenerateAndSend
}


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
			if(JSON.parse(b).owner_id != authHeadSplit[1] && !serverRolesArr.find(x => { return ~rolesArr.indexOf(x.id) })) { notAuth(); return }
			//now that all that validation's aside, let's get down to bid-ness.
			console.log('yeah seems legit');
			
			var dbc = db.JSON();
			dbc.config[req.body.guild_id] = req.body
			db.JSON(dbc);
			db.sync();
			
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
			if(JSON.parse(b).owner_id != authHeadSplit[1] && !serverRolesArr.find(x => { return ~rolesArr.indexOf(x.id) })) { notAuth(); return }
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

app.get('/validate_email', (req, res) => {
	 if(!req.query.userid || !req.query.serverid || !req.query.code) return res.sendStatus(400)

	 var cacheObject = cache.JSON();
	 var cacheContents = cacheObject.cache;
	 var userRecord = cacheContents.find(x => { return x.discord.id.id == req.query.userid });
	 if(!userRecord) return res.sendStatus(404)
	 if(userRecord.emailConnectCode != req.query.code) return res.sendStatus(401)

	 callbacks.onEmailAuth({userid: req.query.userid, guild_id: req.query.serverid});

   res.end('ok great thanks! you should have been authorized now.');
});

app.use(express.static(__dirname + '/webserver/assets'));

var emailCodeGenerateAndSend = (m,cb) => {
	var evt = m.evt;
	var cacheObject = cache.JSON();
	var cacheContents = cacheObject.cache;
	var userRecord = cacheContents.find(x => { return x.discord.id.id == evt.d.author.id });
	
	if(!userRecord) {
		 cacheContents.push({discord: {id: evt.d.author, data: {} }});
		 userRecord = cacheContents.find(x => { return x.discord.id.id == evt.d.author.id });
		}
		
	if(cacheContents.find(x => { return x.email_address == m.email_address })) return cb({err: 'That email is already linked to an account.'})


	var generateCode = function (m, n, i, c, f) {
		m = Math;
		c = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890_-!";
		for (i = 0; i < 30; i++) {
			f = (f || '') + c.charAt(m.floor(m.random() * c.length));
		}
		return f
	};
	//it's always going to be nhs
	var guild_id = '392830469500043266';
	
	var user_id = evt.d.author.id
	var code = generateCode();
	
	userRecord.emailConnectCode = code
	
	cacheObject.cache = cacheContents;
	cache.JSON(cacheObject);

	var transporter = nodemailer.createTransport({
		host: 'smtp.zoho.com',
		port: 587,
		auth: {
			user: 'fossilbot-donotreply@coleh.net',
			pass: require('./email_auth.json')
		}
	});
	
	var mailOptions = {
		from: 'fossilbot-donotreply@coleh.net',
		to: 'cbh221@students.needham.k12.ma.us',
		subject: 'Code for Verification',
		text: `Go to https://fossilbot.cf/validate_email?userid=${user_id}&serverid=${guild_id}&code=${code}&action=verify`,
		html: `<!DOCTYPE HTML><html><head></head><body style=\"padding: 3em; margin: 0px; color: #000000; background: #dedede;font-family: sans-serif;\">\r\n <div style=\"padding: 10px; background: #fefefe; \">\r\n    <h1 style=\"width: 100%; display: block; height: 2em; position: relative;\">\r\n\t    <img src=\"cid:fossilbotlogo\" style=\"width: 2em;border-radius:100%; width: 2em;\" alt=\"Fossilbot logo\">\r\n\t\t<span style=\"display: inline-block; position: absolute; top: 0px; left: 2.5em; line-height: 2em; vertical-align: middle;\">Email Verification<\/span>\r\n\t<\/h1>\r\n\t<div style=\"padding:10px;\">\r\n\t\t<p>Hey there! Someone wanted to use this email address to access the <b>NHS</b> Discord server. If it was you, click on the button below.<\/p>\r\n\t    <div style=\"background: #dedede; padding: 10px; border-radius: 4px; font-size: 2em;\">\r\n\t\t\t<button style=\"margin: auto; display:block; background: #61B774; outline: none; border: none; padding: 0.5em; padding-left: 0.75em; padding-right: 0.75em; font-size: 1.25em; color: white; border-radius: 0.25em; width: auto; cursor: pointer; overflow: hidden; transition: width 10s linear;\">\r\n\t\t\t    <a style=\"text-decoration:none;color:black;\" href="https://fossilbot.cf/validate_email?userid=${user_id}&serverid=${guild_id}&code=${code}&action=verify">Verify Email<\/a>\r\n\t\t\t<\/button>\r\n\t\t<\/div>\r\n\t\t<p>If you didn\'t request this email, please click <a href=\"mailto:coleh@coleh.net\" style=\"color: #3333cc;\">here<\/a> to notify  a human about that.<\/p>\r\n\t\t\r\n\t<\/div>\r\n\r\n <\/div>\r\n<div style=\"background: #cecece; padding: 10px; position: relative; text-align: center;\">\r\n\t<i><span style=\"white-space: nowrap;\"><a href=\"https:\/\/discordapp.com\/oauth2\/authorize?client_id=387963766798811136&permissions=335760448&scope=bot\" style=\"color: #3333cc;\">Get Fossilbot for your server<\/a><\/span> &bull; <span style=\"white-space: nowrap;\"><a href=\"mailto:coleh@coleh.net\" style=\"color: #3333cc;\">Contact me<\/a><\/span> <\/i>\r\n<\/div>\r\n<\/body></html>`,
		attachments: [{
			filename: 'fossilbotlogo.png',
			path: './icon.png',
			cid: 'fossilbotlogo' 
		}]
	};
	
	transporter.sendMail(mailOptions, function(error, info){
		  cb({err: error, status: info.response});
	});
}

var incrementXpFunc = (m) => {
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
	  
	  for( ; cS >= s.discord.data[evt.d.guild_id].totalNeededXp ; ) {
		s.discord.data[evt.d.guild_id].level = s.discord.data[evt.d.guild_id].level + 1
	    s.discord.data[evt.d.guild_id].neededXp = Math.floor(5 / 6 * (s.discord.data[evt.d.guild_id].level+1) * (2 * (s.discord.data[evt.d.guild_id].level+1) * (s.discord.data[evt.d.guild_id].level+1) + 27 * (s.discord.data[evt.d.guild_id].level+1) + 91))
	    s.discord.data[evt.d.guild_id].totalNeededXp = ( s.discord.data[evt.d.guild_id].neededXp + ( 5 / 6 * (s.discord.data[evt.d.guild_id].level) * (2 * (s.discord.data[evt.d.guild_id].level) * (s.discord.data[evt.d.guild_id].level) + 27 * (s.discord.data[evt.d.guild_id].level) + 91) ) )
		lvUped = true;
	  }
	  
	  var tI = cC.findIndex(x => { return x.discord.id.id == evt.d.author.id });
	  cC[tI] = s
	  
	  c.cache = cC;
	  cache.JSON(c);
		cache.sync();
		if(callbacks.onLevelUp) callbacks.onLevelUp({e:evt,d:s});
    } 
};

var server = app.listen(5555, function() {
  console.log('Your app is listening on port ' + server.address().port);
});
process.on('SIGTERM', function() {  server.close(); cache.sync(); process.exit(); });
