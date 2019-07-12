
var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
//app = http.createServer(app);
var request = require('request');
var fs = require('fs');
var nodemailer = require('nodemailer');
var jsonDb = require('simple-json-db');
var cache = new jsonDb(__dirname + '/modules/webserver/db/webcache.json');
var botAuth = require(__dirname + '/.data/auth.json');

var callbacks = {};

var db;


module.exports = function (_db) {
	if (!_db) return false;
	db = _db
	return exportFunctions;
}


var exportFunctions = {
	onLevelUp: (cb) => { callbacks.onLevelUp = cb; },
	onEmailAuth: (cb) => { callbacks.onEmailAuth = cb; },
	onSnowDayAnnounced: (cb) => { callbacks.onSnowDayAnnounced = cb; },
	incrementXp: m => { incrementXpFunc(m) },
	email: (m, cb) => { emailCodeGenerateAndSend(m, cb) }
}


Date.prototype.getWeek = function () {
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

if (cache.JSON().cache === undefined) {
	cache.JSON({ "cache": [], "stats": {} });
	cache.sync();
	//console.log('cache initialized: ' + cache.JSON().cache);
}
//console.log(cache.JSON().cache);

app.use(express.json());


app.get('/discordoauthresponse', function (req, resp) {
	resp.sendFile(__dirname + '/modules/webserver/assets/discordoauthredirect.html');
});
// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, resp) {
	resp.send('');
});// http://expressjs.com/en/starter/basic-routing.html
app.get('/lb/:serverId', function (req, resp) {
	resp.sendFile(__dirname + '/modules/webserver/pages/lb.html');
});
app.get('/cp/:serverId', function (req, resp) {
	resp.sendFile(__dirname + '/modules/webserver/pages/cp.html');
});
app.get('/sd/:serverId/:fileName', function (req, resp) {
	try {
		resp.sendFile(__dirname + '/modules/webserver/pages/sd/' + req.params.serverId + req.params.fileName + '.html');
	} catch (e) { }
});


app.post('/gutekanstTweet', function(req,resp) {
	if(!req.body) { return resp.sendStatus(400) }
	if(!req.body.text || !req.body.at) { return resp.sendStatus(400) }

	resp.sendStatus(204);

	var arrayOfPhrasesWhichIndicateASnowDay = [
		"will be closed",
		"no school today",
		"no school tomorrow",
		"no classes tomorrow"
	];
	for(var i = 0; i < arrayOfPhrasesWhichIndicateASnowDay.length; i++) {
		if(~req.body.text.toLowerCase().indexOf(arrayOfPhrasesWhichIndicateASnowDay[i])) { callbacks.onSnowDayAnnounced(req.body); break;}
	}
});

app.post('/adminAction', function (req, resp) {

	var notAuth = function () {
		console.log('notAuth executed');
		resp.status(401);
		resp.send('"Not Authorized"');
	}

	//console.log(req.headers['authorization']);
	if (!req.headers['authorization']) { notAuth(); return }
	var authHead = req.headers['authorization'];
	var authHeadSplit = authHead.split('|');
	if (authHeadSplit.length != 2) { notAuth(); return }

	var _usUser = cache.JSON().cache.find(x => { return (x.discord.id.id == authHeadSplit[1]) });
	console.log(_usUser.discord.auth);
	if (!_usUser) { notAuth(); return }
	if (!_usUser.discord) { notAuth(); return }
	if (_usUser.discord.auth != authHead) { notAuth(); return }

	console.log(req.body);

	if (!req.body.guild_id) { resp.sendStatus(400); return }

	request({
		url: 'http://discordapp.com/api/v6/guilds/' + req.body.guild_id + '/members/' + authHeadSplit[1],
		method: 'GET',
		headers: {
			'Authorization': 'Bot ' + botAuth
		}
	}, function (e, r, b) {
		if (e) { console.log('e: ' + e); notAuth(); return }
		var rolesArr;
		try { rolesArr = JSON.parse(b).roles } catch (e) { if (e) { notAuth(); return } }
		//console.log(rolesArr);
		request({
			url: 'http://discordapp.com/api/v6/guilds/' + req.body.guild_id,
			method: 'GET',
			headers: {
				'Authorization': 'Bot ' + botAuth
			}
		}, function (e, r, b) {
			if (e) { notAuth(); return }
			var serverRolesArr;
			//console.log(b);
			try { serverRolesArr = JSON.parse(b).roles } catch (e) { if (e) { notAuth(); return } }
			serverRolesArr = serverRolesArr.filter(x => {
				return (0x8 & x.permissions)
			});
			if (JSON.parse(b).owner_id != authHeadSplit[1] && !serverRolesArr.find(x => { return ~rolesArr.indexOf(x.id) })) { notAuth(); return }
			//now that all that validation's aside, let's get down to bid-ness.

			if (!req.body.enabledFeatures) { return resp.sendStatus(400) }

			console.log('yeah seems legit');

				
				try {
					db.prepare('INSERT OR REPLACE INTO serverconfig (id, cooldown_g, cooldown_e, cooldown_e_t, cooldown_s, cooldown_s_t, cooldown_m, colldown_m_t, spam_time_mins, autoorder_category_name, game_emoji, name_color_roles, msgs, enabled_getme, enabled_autoorder, enabled_notify, enabled_addmeto, enabled_voicechannelgameemojis, enabled_experience, enabled_antispam, enabled_autoresponse, enabled_namecolor, enabled_namecolorhex, auto_resp, notifybudget) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run([
						req.body.guild_id, req.body.cooldown_g, req.body.cooldown_e, req.body.cooldown_e_t, req.body.cooldown_s, req.body.cooldown_s_t, req.body.cooldown_m, req.body.cooldown_m_t, req.body.spam_time_mins, req.body.autoorder_category_name, JSON.stringify(req.body.gameEmoji), JSON.stringify(req.body.nameColorRoles), JSON.stringify(req.body.msgs), +req.body.enabledFeatures.getme, +req.body.enabledFeatures.autoorder, +req.body.enabledFeatures.notify, +req.body.enabledFeatures.addmeto, +req.body.enabledFeatures.voicechannelgameemojis, +req.body.enabledFeatures.experience, +req.body.enabledFeatures.antispam, +req.body.enabledFeatures.autoresponse, +req.body.enabledFeatures.namecolor, +req.body.enabledFeatures.namecolor_hex, JSON.stringify(req.body.autoResp), req.body.notifyBudget
					]);
					resp.sendStatus(200);
				} catch (e) { console.log(e); resp.sendStatus(500) }
			
		});
	});
});

app.get('/connectCode', function (req, resp) {
	// console.log(req.headers);
	if (!req.headers['authorization']) { return }

	request({
		url: 'https://discordapp.com/api/v6/users/@me',
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + req.headers['authorization']
		}
	}, function (e, r, b) {
		console.log(b);
		if (r.statusCode == 200) {
			resp.status = 200;
			var sendDat = (function () {
				try { b = JSON.parse(b); } catch (e) { console.log(e) }
				var udb = cache.JSON();
				var uimI = udb.cache.findIndex(x => { return (x.discord.id.id == b.id) });
				if (uimI == -1) { return }
				if (!udb.cache[uimI].discord.auth) {
					udb.cache[uimI].discord.auth = (function (m, n, i, c, f) {
						c = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890_-!";
						for (i = 0; i < 30; i++) {
							f = (f || '') + c.charAt(m.floor(m.random() * c.length));
						}
						return f
					})(Math) + '|' + b.id
					cache.JSON(udb);
					cache.sync();
				}

				return { code: udb.cache[uimI].discord.auth, user: udb.cache[uimI].discord.id }
			})();
			console.log(sendDat);
			resp.send(sendDat);
		} else {
			resp.status = 403;
			resp.send('"Not Authorized"');
		}
	});


});

app.get('/data', function (req, resp) {
	console.log('request for data!');
	var c = cache.JSON().cache;
	var q = req.query;
	if (q.src == 'steam') {
		if (q.type == 'lb') {
			try {
				var uS = c.filter(x => { return x[q.src].data[q.mode] });
				//uS = uS.slice(q.start, q.start + 100)
				for (var i = 0; i < uS.length; i++) {

					uS[i] = {
						r:
						{
							stats: uS[i][q.src].data[q.mode].playerstats.stats.filter(x => {
								return x.name == 'total_kills' || x.name == 'total_deaths' || x.name == 'total_contribution_score' || x.name == 'total_matches_won' || x.name == 'total_matches_played' || x.name == 'total_shots_fired' || x.name == 'total_shots_hit'
							})
						}, discord: uS[i].discord.id
					}

				}
				uS[0].s = cache.JSON().stats
			} catch (e) { console.log(e) }
			if (!uS) {
				resp.status = 404
				resp.send('404 Not Found');
				return null

			}

			//console.log(uS);
			resp.status = 200
			resp.send(uS);

		} else if (q.type == 'spec') {
			try {
				var uS = c.filter(x => { return x[q.src].data[q.mode] });
				uS = uS.find(x => { return x.discord.id.id == q.did })


			} catch (e) { console.log(e) }
			if (!uS) {
				resp.status = 404
				resp.send('404');
				return null

			}

			uS = uS[q.src].data[q.mode]
			resp.status = 200
			resp.send(uS);

		}
	} else if (q.src == 'discord') {

		if (q.type == 'lb') {
			try {
				var uS = c.filter(x => { try { return x[q.src].data[q.mode] } catch (e) { } });
				if (!uS) console.log('uS isn"t a thing!!');
				var _uSLength = uS.length;
				uS = uS.slice(q.start, q.start + 100)
				for (var i = 0; i < uS.length; i++) {
					uS[i] = { r: uS[i][q.src].data[q.mode], discord: uS[i].discord.id }
				}
				uS[0].s = cache.JSON().stats;
				uS[0].s.aL = _uSLength;
			} catch (e) { console.log('Caught Error ' + e) }

			if (!uS) {
				resp.status = 404
				resp.send('404');
				return null
			}

			//console.log(uS);
			resp.status = 200
			resp.send(uS);
		} else if (q.type == 'cfg') {
			if (!q.mode) { resp.sendStatus(400); return }

			//~~just some authentication-- nothing drastic needed here~~ cHANGE OF PLANS AUTHORIZATION REEQQQUUUIIIREDDD
			var notAuth = function () {
				console.log('notAuth executed');
				resp.status(401);
				resp.send('"Not Authorized"');
			}

			//console.log(req.headers['authorization']);
			if (!req.headers['authorization']) { notAuth(); return }
			var authHead = req.headers['authorization'];
			var authHeadSplit = authHead.split('|');
			if (authHeadSplit.length != 2) { notAuth(); return }

			var _usUser = cache.JSON().cache.find(x => { return (x.discord.id.id == authHeadSplit[1]) });
			console.log(_usUser.discord.auth);
			if (!_usUser) { notAuth(); return }
			if (!_usUser.discord) { notAuth(); return }
			if (_usUser.discord.auth != authHead) { notAuth(); return }

			console.log(req.body);


			request({
				url: 'http://discordapp.com/api/v6/guilds/' + q.mode + '/members/' + authHeadSplit[1],
				method: 'GET',
				headers: {
					'Authorization': 'Bot ' + botAuth
				}
			}, function (e, r, b) {
				if (e) { console.log('e: ' + e); notAuth(); return }
				var rolesArr;
				try { rolesArr = JSON.parse(b).roles } catch (e) { if (e) { notAuth(); return } }
				//console.log(rolesArr);
				request({
					url: 'http://discordapp.com/api/v6/guilds/' + q.mode,
					method: 'GET',
					headers: {
						'Authorization': 'Bot ' + botAuth
					}
				}, function (e, r, b) {
					if (e) { notAuth(); return }
					var serverRolesArr;
					//console.log(b);
					try { serverRolesArr = JSON.parse(b).roles } catch (e) { if (e) { notAuth(); return } }
					serverRolesArr = serverRolesArr.filter(x => {
						return (0x8 & x.permissions)
					});
					if (JSON.parse(b).owner_id != authHeadSplit[1] && !serverRolesArr.find(x => { return ~rolesArr.indexOf(x.id) })) { notAuth(); return }
					//now that all that validation's aside, let's get down to bid-ness.
					console.log('yeah seems legit');
					var data = db.prepare('SELECT * FROM serverconfig WHERE id = ?').get([q.mode])

					if (!data) { resp.sendStatus(404); return }
					resp.send(toLegacyConfigSchema(data));
				});
			});

		} else if (q.type == 'votes') {
			if (!q.mode) { resp.sendStatus(400); return }
			if (!cache.JSON().discordvotes[q.mode]) { cache.JSON().discordvotes[q.mode] = [] }
			resp.send({ d: cache.JSON().discordvotes[q.mode].slice(q.start, q.start + 100) })
		} else {
			resp.sendStatus(400); return
		}
	} else {
		resp.sendStatus(400); return
	}
});

app.get('/validate_email', (req, res) => {

	function notAuth(statusCode) {
		res.status(statusCode);
		res.sendFile(__dirname + '/modules/webserver/pages/email_response_failure.html');
	}

	if (!req.query.userid || !req.query.serverid || !req.query.code) return notAuth(400)

	var cacheObject = cache.JSON();
	var cacheContents = cacheObject.cache;
	var userRecord = cacheContents.find(x => { return x.discord.id.id == req.query.userid });
	if (!userRecord) return notAuth(404)
	if (userRecord.emailConnectCode != req.query.code) return notAuth(401)

	userRecord.email_address = userRecord.allegedEmail;

	cacheObject.cache = cacheContents;
	cache.JSON(cacheObject);

	callbacks.onEmailAuth({ userid: req.query.userid, guild_id: req.query.serverid, email: userRecord.email_address });

	res.sendFile(__dirname + '/modules/webserver/pages/email_response.html');
});

app.use(express.static(__dirname + '/modules/webserver/assets'));

var emailCodeGenerateAndSend = (m, cb) => {
	var evt = m.evt;
	var cacheObject = cache.JSON();
	var cacheContents = cacheObject.cache;
	var userRecord = cacheContents.find(x => { return x.discord.id.id == evt.d.author.id });

	if (!userRecord) {
		cacheContents.push({ discord: { id: evt.d.author, data: {} } });
		userRecord = cacheContents.find(x => { return x.discord.id.id == evt.d.author.id });
	}

	if (cacheContents.find(x => { return x.email_address == m.email_address })) return cb({ err: 'That email is already linked to an account.' })


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

	userRecord.emailConnectCode = code;
	userRecord.allegedEmail = m.email_address;

	cacheObject.cache = cacheContents;
	cache.JSON(cacheObject);

	var transporter = nodemailer.createTransport({
		host: 'smtp.zoho.com',
		port: 587,
		auth: {
			user: 'fossilbot-donotreply@coleh.net',
			pass: require(__dirname + '/.data/email_auth.json')
		}
	});

	var mailOptions = {
		from: 'fossilbot-donotreply@coleh.net',
		to: m.email_address,
		subject: 'Code for Verification',
		text: `Go to https://fossilbot.cf/validate_email?userid=${user_id}&serverid=${guild_id}&code=${code}&action=verify`,
		html: `<!DOCTYPE HTML><html><head></head><body style=\"padding: 3em; margin: 0px; color: #000000; background: #dedede;font-family: sans-serif;\">\r\n <div style=\"padding: 10px; background: #fefefe; \">\r\n    <h1 style=\"width: 100%; display: block; height: 2em; position: relative;\">\r\n\t    <img src=\"cid:fossilbotlogo\" style=\"width: 2em;border-radius:100%; width: 2em;\" alt=\"Fossilbot logo\">\r\n\t\t<span style=\"display: inline-block; position: absolute; top: 0px; left: 2.5em; line-height: 2em; vertical-align: middle;\">Email Verification<\/span>\r\n\t<\/h1>\r\n\t<div style=\"padding:10px;\">\r\n\t\t<p>Hey there! Someone wanted to use this email address to access the <b>NHS</b> Discord server. If it was you, click on the button below.<\/p>\r\n\t    <div style=\"background: #dedede; padding: 10px; border-radius: 4px; font-size: 2em;\">\r\n\t\t\t<button style=\"margin: auto; display:block; background: #61B774; outline: none; border: none; padding: 0.5em; padding-left: 0.75em; padding-right: 0.75em; font-size: 1.25em; color: white; border-radius: 0.25em; width: auto; cursor: pointer; overflow: hidden; transition: width 10s linear;\">\r\n\t\t\t    <a style=\"text-decoration:none;color:black;\" href="https://fossilbot.cf/validate_email?userid=${user_id}&serverid=${guild_id}&code=${code}&action=verify">Verify Email<\/a>\r\n\t\t\t<\/button>\r\n\t\t<\/div>\r\n\t\t<p>If you didn\'t request this email, please click <a href=\"mailto:coleh@coleh.net\" style=\"color: #3333cc;\">here<\/a> to notify  a human about that.<\/p>\r\n\t\t\r\n\t<\/div>\r\n\r\n <\/div>\r\n<div style=\"background: #cecece; padding: 10px; position: relative; text-align: center;\">\r\n\t<i><span style=\"white-space: nowrap;\"><a href=\"https:\/\/discordapp.com\/oauth2\/authorize?client_id=387963766798811136&permissions=335760448&scope=bot\" style=\"color: #3333cc;\">Get Fossilbot for your server<\/a><\/span> &bull; <span style=\"white-space: nowrap;\"><a href=\"mailto:coleh@coleh.net\" style=\"color: #3333cc;\">Contact me<\/a><\/span> <\/i>\r\n<\/div>\r\n<\/body></html>`,
		attachments: [{
			filename: 'fossilbotlogo.png',
			path: __dirname + '/modules/webserver/assets/emailicon.png',
			cid: 'fossilbotlogo'
		}]
	};

	transporter.sendMail(mailOptions, function (error, info) {
		cb({ err: error, email: m.email_address });
	});
}

var incrementXpFunc = (m) => {
	if (m.cmd) {
		var evt = m.cmd;
		var c = cache.JSON();
		var cC = c.cache;
		var s = cC.find(x => { return x.discord.id.id == evt.d.author.id });


		if (!s) {

			cC.push({ discord: { id: evt.d.author, data: {} } })
			s = { discord: { id: evt.d.author, data: {} } }

		}



		if (!s.discord) s.discord = {}
		if (!s.discord.data) s.discord.data = {}
		if (!s.discord.data[evt.d.guild_id]) s.discord.data[evt.d.guild_id] = {}

		if (!s.discord.data[evt.d.guild_id].lastGain) s.discord.data[evt.d.guild_id].lastGain = 0

		s.discord.id = evt.d.author;

		var cS = s.discord.data[evt.d.guild_id].score;
		var cM = s.discord.data[evt.d.guild_id].sms;
		var cL = s.discord.data[evt.d.guild_id].level;
		var lvUped = false;

		if (!cS) cS = 0;
		if (!cM) cM = 0;
		if (!cL) cL = 0;

		if (s.discord.data[evt.d.guild_id].lastGain < Date.now() - (1000 * 60)) {
			cS = cS + Math.floor((Math.random() * 15) + 10)
			s.discord.data[evt.d.guild_id].lastGain = Date.now()
		}

		cM++

		s.discord.data[evt.d.guild_id].score = cS
		s.discord.data[evt.d.guild_id].sms = cM
		s.discord.data[evt.d.guild_id].neededXp = Math.floor(5 / 6 * (cL + 1) * (2 * (cL + 1) * (cL + 1) + 27 * (cL + 1) + 91))
		s.discord.data[evt.d.guild_id].level = cL
		s.discord.data[evt.d.guild_id].totalNeededXp = (s.discord.data[evt.d.guild_id].neededXp + (5 / 6 * (cL) * (2 * (cL) * (cL) + 27 * (cL) + 91)))

		s.discord.data[evt.d.guild_id].sName = m.serverDat.name
		s.discord.data[evt.d.guild_id].sId = m.serverDat.id
		s.discord.data[evt.d.guild_id].sIcon = m.serverDat.icon

		for (; cS >= s.discord.data[evt.d.guild_id].totalNeededXp;) {
			s.discord.data[evt.d.guild_id].level = s.discord.data[evt.d.guild_id].level + 1
			s.discord.data[evt.d.guild_id].neededXp = Math.floor(5 / 6 * (s.discord.data[evt.d.guild_id].level + 1) * (2 * (s.discord.data[evt.d.guild_id].level + 1) * (s.discord.data[evt.d.guild_id].level + 1) + 27 * (s.discord.data[evt.d.guild_id].level + 1) + 91))
			s.discord.data[evt.d.guild_id].totalNeededXp = (s.discord.data[evt.d.guild_id].neededXp + (5 / 6 * (s.discord.data[evt.d.guild_id].level) * (2 * (s.discord.data[evt.d.guild_id].level) * (s.discord.data[evt.d.guild_id].level) + 27 * (s.discord.data[evt.d.guild_id].level) + 91)))
			lvUped = true;
		}

		var tI = cC.findIndex(x => { return x.discord.id.id == evt.d.author.id });
		cC[tI] = s

		c.cache = cC;
		cache.JSON(c);
		cache.sync();
		if (callbacks.onLevelUp) callbacks.onLevelUp({ e: evt, d: s });
	}
};
function toLegacyConfigSchema(data) {
	return {
		"cooldown_g": data.cooldown_g,
		"cooldown_e": data.cooldown_e,
		"cooldown_e_t": data.cooldown_e_t,
		"cooldown_s": data.cooldown_s,
		"cooldown_s_t": data.cooldown_s_t,
		"cooldown_m": data.cooldown_m,
		"cooldown_m_t": data.cooldown_m_t,
		"spam_time_mins": data.spam_time_mins,
		"gameEmoji": JSON.parse(data.game_emoji),
		"nameColorRoles": JSON.parse(data.name_color_roles),
		"msgs": JSON.parse(data.msgs),
		"enabledFeatures": {
			"getme": data.enabled_getme,
			"notify": data.enabled_notify,
			"addmeto": data.enabled_addmeto,
			"voicechannelgameemojis": data.enabled_voicechannelgameemojis,
			"experience": data.enabled_experience,
			"antispam": data.enabled_antispam,
			"autoresponse": data.enabled_autoresponse,
			"joinmessages": data.enabled_joinmessages,
			"namecolor": data.enabled_namecolor,
			"namecolor_hex": data.enabled_namecolorhex,
			"autoorder": data.enabled_autoorder
		},
		"autoResp": JSON.parse(data.auto_resp),
		"guild_id": data.id,
		"autoorder_category_name": data.autoorder_category_name,
		"notifyBudget": data.notifybudget
	};
}
var server = app.listen(5555, function () {
	console.log('Your app is listening on port ' + server.address().port);
});
process.on('SIGTERM', function () { server.close(); cache.sync(); process.exit(); });
