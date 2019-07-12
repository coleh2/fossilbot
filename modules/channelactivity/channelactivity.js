var bot, db;
var botToken = require('./auth.json');
var request = require('request');

var lastOrderingTimestamp = {};

module.exports = function(discord_bot_instance, sqlite_db_instance) {
	bot = discord_bot_instance;
	db = sqlite_db_instance;
	
	return exportfunctions;
}

var exportfunctions = {
	deleteOld: deleteOldActivities,
	orderChannels: updateChannelOrderFromActivity,
	updateData: updateActivity,
	getLastReorderTime: getlastOrderingTimestamp
};

function getlastOrderingTimestamp (id) {
	return (lastOrderingTimestamp[id]||0);
}

function makeActivityObj(guild_id)  {
	var data = db.prepare('SELECT * FROM channelactivity WHERE guild_id = ?').all([guild_id])
	
	//return an object containing the total messages for each channel, stored by the channel ids.
	var workingobject = {};
	for(var i = 0; i < data.length; i++) {
		if(!workingobject[data[i].channel_id]) workingobject[data[i].channel_id] = 0;
		workingobject[data[i].channel_id] += data[i].messages;
	}
	return workingobject;
}
function deleteOldActivities(cutOffPoint) {

	db.prepare('DELETE FROM channelactivity WHERE day < ?').run([cutOffPoint])
}
function updateActivity(evt) {
	
	var today = Math.floor(Date.now() / 86400000);
	deleteOldActivities(today - 8);

	if(evt.t == 'MESSAGE_CREATE') {
		
		db.prepare('INSERT OR IGNORE INTO channelactivity (guild_id, channel_id , day, messages) VALUES (?, ?, ?, 0)').run([evt.d.guild_id, evt.d.channel_id, today]);
		
		db.prepare('UPDATE channelactivity SET messages = messages + 1 WHERE guild_id = ? AND channel_id = ? AND day = ?').run([evt.d.guild_id, evt.d.channel_id, today]);
		
	} else if (evt.t == 'PRESENCE_UPDATE') {
		
	}
}
function updateChannelOrderFromActivity(serverId,categoryToUpdateId,topCallback) {
	
	lastOrderingTimestamp[serverId] = Date.now();
	
	
	var activitiesOfChannels = makeActivityObj(serverId);
	if(!categoryToUpdateId) return false;
	
	Object.keys(activitiesOfChannels).sort((a,b) => {return activitiesOfChannels[b] - activitiesOfChannels[a]}).forEach((x,i) => {
		activitiesOfChannels[x] = i
	});
	
	
	request({ 
		url: 'https://discordapp.com/api/v6/guilds/' + serverId + '/channels',
		headers: {
			'Authorization': 'Bot ' + botToken
		}
	}, function(err, resp, body) {
		if(err) return false;
		if(typeof body == 'string') body = JSON.parse(body);

		//check that the channel we should sort inside exists and is a category
		if(!body.find(x => {if(x.id == categoryToUpdateId && x.type == 4) {return true}})) { return false}

		var channelPossForDiscord = [];
		var channelsThatAreInTheSpecifiedCategory = [];
		var basePosition = -Infinity;
		var numberOfDefaultSortedChannelsSoFar = 0;
		for(var i = 0; i < body.length; i++) {
			if(body[i].parent_id == categoryToUpdateId && body[i].type == 0) {
				if(body[i].position > basePosition) basePosition = body[i].position
				channelsThatAreInTheSpecifiedCategory.push(body[i]);
			}
		}
		for(var i = 0; i < channelsThatAreInTheSpecifiedCategory.length; i++) {
			var thisChannel = channelsThatAreInTheSpecifiedCategory[i];
			if(activitiesOfChannels[thisChannel.id] === undefined) {
				activitiesOfChannels[thisChannel.id] = Object.values(channelsThatAreInTheSpecifiedCategory).length - numberOfDefaultSortedChannelsSoFar - 1;
				numberOfDefaultSortedChannelsSoFar++
			}
			channelPossForDiscord.push({
				id: thisChannel.id,
				position: activitiesOfChannels[thisChannel.id] + basePosition
			});
		} 

		//check that there are actually channels which we are operating on
		if(channelPossForDiscord.length == 0) { return console.warn('channelposis0length');  }
		
		request({ 
			url: 'https://discordapp.com/api/v6/guilds/' + serverId + '/channels',
			headers: {
				'Authorization': 'Bot ' + botToken,
				'Content-Type': 'application/json'
			},
			method: 'PATCH',
			body: JSON.stringify(channelPossForDiscord)
		},topCallback||defaultCallback);
		function defaultCallback(e,b,r) {
			e&&console.log(e);
		}
	});
}