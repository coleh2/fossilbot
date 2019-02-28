var bot, db;
var botToken = require('./auth.json');
var request = require('request');

var lastOrderingTimestamp = {};

module.exports = function(discord_bot_instance, js_db_instance) {
	bot = discord_bot_instance;
	db = js_db_instance;
	
	return exportfunctions;
}

var exportfunctions = {
	deleteOld: deleteOldActivities,
	orderChannels: updateChannelOrderFromActivity,
	updateData: updateActivity
	getLastReorderTime: getlastOrderingTimestamp
};

function getlastOrderingTimestamp (id) {
	return lastOrderingTimestamp[id];
}

function makeActivityObj(server_id)  {
	var data = db.JSON().activity;
	if(!data) return
	
	var keys = Object.keys(data), workingobject = {};
	for(var i = 0; i < keys.length; i++) {
		var _keys = Object.keys(data[keys[i]][server_id]||{});
		for(var _i = 0; _i < _keys.length; _i++) {
			if(!workingobject[_keys[_i]]) workingobject[_keys[_i]] = 0;
			workingobject[_keys[_i]] += data[keys[i]][server_id][_keys[_i]];
		}
	}
	return workingobject;
}
function deleteOldActivities(dbc) {
	for(var i = 0, keys = Object.keys(dbc.activity); i < keys.length; i++) {
		//if the entry is older than a week, delete it
		if(keys[i] < ( new Date() ).setHours(0,0,0,0) - 604800000) delete keys[keys[i]]
	}
}
function updateActivity(evt) {
	var dbc = db.JSON();
	
	//null checks 
	if(!dbc.activity) { dbc.activity = {} }
	if(!dbc.activity[today]) { dbc.activity[today] = {} }
	
	deleteOldActivities(dbc);
	
	if(evt.t == 'MESSAGE_CREATE') {
		var today = ( new Date() ).setHours(0,0,0,0);
		
		if(!dbc.activity[today]) { dbc.activity[today] = {} }
		if(!dbc.activity[today][evt.d.guild_id]) { dbc.activity[today][evt.d.guild_id] = {} }
		if(!dbc.activity[today][evt.d.guild_id][evt.d.channel_id]) dbc.activity[today][evt.d.guild_id][evt.d.channel_id] = 0;
		
		dbc.activity[today][evt.d.guild_id][evt.d.channel_id]++
		
	} else if (evt.t == 'PRESENCE_UPDATE') {
		
	}
	
	
	db.JSON(dbc);
	db.sync();
}
function updateChannelOrderFromActivity(serverId,categoryToUpdateId,topCallback) {
	
	lastOrderingTimestamp[serverId] = Date.now();
	
	
	var activitiesOfChannels = makeActivityObj(serverId);
	if(!categoryToUpdateId) return false;
	
	Object.keys(activitiesOfChannels).forEach((x,i) => {
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
				activitiesOfChannels[thisChannel.id] = Object.values(channelsThatAreInTheSpecifiedCategory).length - numberOfDefaultSortedChannelsSoFar;
				numberOfDefaultSortedChannelsSoFar++
			}
			channelPossForDiscord.push({
				id: thisChannel.id,
				position: activitiesOfChannels[thisChannel.id] + basePosition
			});
		}
		request({ 
			url: 'https://discordapp.com/api/v6/guilds/' + serverId + '/channels',
			headers: {
				'Authorization': 'Bot ' + botToken,
				'Content-Type': 'application/json'
			},
			method: 'PATCH',
			body: JSON.stringify(channelPossForDiscord)
		},topCallback||defaultCallback);
		function defaultCallback() {
			
		}
	});
}