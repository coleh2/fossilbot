var cooldowns = {
	everyone: {},
	specific: {},
	mass: {},
	warned: {},
	muted: {},
	tomute: {},
	towarn: {},
	last_everyone_reset_time: {}
};
module.exports = {
	update: updateRecords,
	getUserState: getUserState,
	unmuted: unmuted
};
function cooldownNullChecks (evt) {
	if (!cooldowns.specific[evt.d.guild_id]) cooldowns.specific[evt.d.guild_id] = {}
	if (!cooldowns.specific[evt.d.guild_id][evt.d.author.id]) cooldowns.specific[evt.d.guild_id][evt.d.author.id] = {}
	for(var i = 0; i < evt.d.mentions.length; i++) {
		if(!cooldowns.specific[evt.d.guild_id][evt.d.author.id][evt.d.mentions[i].id]) cooldowns.specific[evt.d.guild_id][evt.d.author.id][evt.d.mentions[i].id] = [];
	}
	
	if (!cooldowns.mass[evt.d.guild_id]) cooldowns.mass[evt.d.guild_id] = {}
	if (!cooldowns.mass[evt.d.guild_id][evt.d.author.id]) cooldowns.mass[evt.d.guild_id][evt.d.author.id] = []
	
	if(!cooldowns.everyone[evt.d.guild_id]) cooldowns.everyone[evt.d.guild_id] = {}
	if(!cooldowns.everyone[evt.d.guild_id][evt.d.author.id] || isNaN(cooldowns.everyone[evt.d.guild_id][evt.d.author.id])) cooldowns.everyone[evt.d.guild_id][evt.d.author.id] = 0
	
	if(!cooldowns.warned[evt.d.guild_id]) cooldowns.warned[evt.d.guild_id] = {}
	if(!cooldowns.warned[evt.d.guild_id][evt.d.author.id]) cooldowns.warned[evt.d.guild_id][evt.d.author.id] = false
	
	if(!cooldowns.muted[evt.d.guild_id]) cooldowns.muted[evt.d.guild_id] = {}
	if(!cooldowns.muted[evt.d.guild_id][evt.d.author.id]) cooldowns.muted[evt.d.guild_id][evt.d.author.id] = false
	
	if(!cooldowns.tomute[evt.d.guild_id]) cooldowns.tomute[evt.d.guild_id] = {}
	if(!cooldowns.tomute[evt.d.guild_id][evt.d.author.id]) cooldowns.tomute[evt.d.guild_id][evt.d.author.id] = false
	
	if(!cooldowns.towarn[evt.d.guild_id]) cooldowns.towarn[evt.d.guild_id] = {}
	if(!cooldowns.towarn[evt.d.guild_id][evt.d.author.id]) cooldowns.towarn[evt.d.guild_id][evt.d.author.id] = false
	
	if(!cooldowns.last_everyone_reset_time[evt.d.guild_id]) cooldowns.last_everyone_reset_time[evt.d.guild_id] = 0;

}
function updateRecords(evt, server_config) {

	  //a ton of null checks
	  cooldownNullChecks(evt);
	  var currentTime = Date.now();
	  
	  //loop through and delete expired entries...
	  var listOfSpecificEntryKeys = Object.keys(cooldowns.specific[evt.d.guild_id][evt.d.author.id]);
	  
	  //...for specific
	  for(var i = 0, x; i < listOfSpecificEntryKeys.length; i++) {
		x = listOfSpecificEntryKeys[i];
		for(var iz = 0, y; iz < cooldowns.specific[evt.d.guild_id][evt.d.author.id][x].length; iz++) {
			y = cooldowns.specific[evt.d.guild_id][evt.d.author.id][x][iz];
			if(y.t < currentTime - server_config.cooldown_s_t) {
				cooldowns.specific[evt.d.guild_id][evt.d.author.id][x].splice(i, 1);
			}
		}
	  }
	  
	  //...for mass
	  for(var i = 0, x; i < cooldowns.mass[evt.d.guild_id][evt.d.author.id].length; i++) {
		x = cooldowns.mass[evt.d.guild_id][evt.d.author.id][i];
		
		if(x.t < currentTime - server_config.cooldown_m_t) {
			cooldowns.mass[evt.d.guild_id][evt.d.author.id].splice(i, 1);
		}
	  }
	  
	  //... for everyone
	  if(cooldowns.last_everyone_reset_time[evt.d.guild_id] < currentTime - server_config.cooldown_e_t) {
		  cooldowns.last_everyone_reset_time[evt.d.guild_id] = currentTime;
		  var keysOfEveryoneCooldown = Object.keys(cooldowns.everyone[evt.d.guild_id]);
		  for (var i = 0, e; i <= keysOfEveryoneCooldown.length; i++){
			  cooldowns.everyone[evt.d.guild_id][keysOfEveryoneCooldown[i]] = 0
		  }
	  }
	  
	  //add records of pinging to respective categories
	  if(evt.d.mentions.length > 0) {
			//for specific people:
			for(var i = 0; i < evt.d.mentions.length; i++) {
				cooldowns.specific[evt.d.guild_id][evt.d.author.id][evt.d.mentions[i].id].push({t: currentTime, m: evt.d.id});
			}
	  
			//for mass @ing:
			for(var i = 0; i < 1; i++) {
				cooldowns.mass[evt.d.guild_id][evt.d.author.id].push({t: currentTime, m: evt.d.id});
		    }
        
			//determine whether this message qualifies as single-message spam
			if(listOfSpecificEntryKeys.length >= server_config.cooldown_g) { single_message_spam = true }
			else { var single_message_spam = false; }
	  }
	  if (evt.d.mention_everyone) {
		cooldowns.everyone[evt.d.guild_id][evt.d.author.id]++;
	  }
		
		//mark as to be warned/muted if such
	  if(
			cooldowns.mass[evt.d.guild_id][evt.d.author.id].length >= server_config.cooldown_m || 
			Object.keys(cooldowns.specific[evt.d.guild_id][evt.d.author.id]).filter(itm => cooldowns.specific[evt.d.guild_id][evt.d.author.id][itm].length >= server_config.cooldown_s).length > 0 || 
			single_message_spam
		) {
			if(!cooldowns.muted[evt.d.guild_id][evt.d.author.id]) cooldowns.tomute[evt.d.guild_id][evt.d.author.id] = true
		}
	  
	   if(
			(
				cooldowns.mass[evt.d.guild_id][evt.d.author.id].length >= server_config.cooldown_m - 1 || 
				Object.keys(cooldowns.specific[evt.d.guild_id][evt.d.author.id]).filter(itm => cooldowns.specific[evt.d.guild_id][evt.d.author.id][itm].length >= server_config.cooldown_s - 1).length > 0
			) && 
		    cooldowns.warned[evt.d.guild_id][evt.d.author.id] == false
		  ) {
		  cooldowns.towarn[evt.d.guild_id][evt.d.author.id] = true
	   }
}
function getUserState(evt) {
	cooldownNullChecks(evt);

	var flattenedObject = {
		everyone: cooldowns.everyone[evt.d.guild_id][evt.d.author.id],
		specific: cooldowns.specific[evt.d.guild_id][evt.d.author.id],
		mass: cooldowns.mass[evt.d.guild_id][evt.d.author.id],
		warned: cooldowns.warned[evt.d.guild_id][evt.d.author.id],
		muted: cooldowns.muted[evt.d.guild_id][evt.d.author.id],
		tomute: cooldowns.tomute[evt.d.guild_id][evt.d.author.id],
		towarn: cooldowns.towarn[evt.d.guild_id][evt.d.author.id],
		last_everyone_reset_time: cooldowns.last_everyone_reset_time[evt.guild_id]
	};

	return flattenedObject;
}

function unmuted(serverId, userId) {
	cooldowns.warned[serverId][userId] = false
  cooldowns.muted[serverId][userId] = false
}
function muted(serverId, userId) {
  cooldowns.tomute[serverId][userId] = false
}
function warned(serverId, userId) {
  cooldowns.towarn[serverId][userId] = false
}