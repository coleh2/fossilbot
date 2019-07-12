
	var serverIdMode = '',cfgLocal = {},_cfgLocal = {}, sObj;
	function init() {
	if(localStorage.getItem('connectCode')) {
	document.getElementById('main').style.display = 'initial';
	document.getElementById('logindude').style.display = 'none';
	
	  serverIdMode = ''
	  if(window.location.pathname.length > 5) serverIdMode = window.location.pathname.substring(4)
	  else { return }
	  
  //request server config
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

       //console.log(this.responseText);
	       cfgLocal = JSON.parse(this.responseText);
           _cfgLocal = JSON.parse(this.responseText);
		   reloadDisplay();
           cfgLocal.guild_id = cfgLocal.guild_id || serverIdMode;
    } else if (this.status == 403) {
       // localStorage.removeItem('connectCode');
       // window.location.reload();
	} else /*if (req.status == 404)*/ {
    console.log('updated!');
    cfgLocal = {
	cooldown_g: 30,
	cooldown_e: 2,
	cooldown_e_t: 3600000,
	cooldown_s: 5,
	cooldown_s_t: 180000,
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

	},
	msgs: {
		joinPublic: "",
		joinPrivate: ""
	},
	"enabledFeatures": {
		"getme": true,
		"notify": true,
		"addmeto": true,
		"voicechannelgameemojis": false,
		"experience": false,
		"antispam": false,
		"autoresponse": false,
		"joinmessages": false,
		"namecolor": true,
		"namecolor_hex": false,
		"autoorder": false
	}
};
_cfgLocal = {
	cooldown_g: 30,
	cooldown_e: 2,
	cooldown_e_t: 3600000,
	cooldown_s: 5,
	cooldown_s_t: 180000,
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

	},
	msgs: {
		joinPublic: "",
		joinPrivate: ""
	},
	"enabledFeatures": {
		"getme": true,
		"notify": true,
		"addmeto": true,
		"voicechannelgameemojis": false,
		"experience": false,
		"antispam": false,
		"autoresponse": false,
		"joinmessages": false,
		"namecolor": true,
		"namecolor_hex": false,
		"autoorder": false
	}
};
  }
  };
    req.open("GET", "/data?src=discord&mode="+ serverIdMode +"&type=cfg", true);
    req.setRequestHeader('Authorization',localStorage.getItem('connectCode'));
    
    req.send();
//get guild object
/*req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

       localStorage.setItem('sObj-'+serverIdMode,this.responseText);
       sObj = JSON.parse(this.responseText);
	   
    } else if (this.status == 403) {
        localStorage.removeItem('connectCode');
        window.location.reload();
	}
  };
    req.open("GET", "https://discordapp.com/api/v6/guilds/"+ serverIdMode, true);
    req.setRequestHeader('Authorization',localStorage.getItem('discordToken'));
    req.send(); */
    
     for(var i = 0, e = document.querySelectorAll("input.enableCommandsCheck"); i < e.length; i++) {
	e[i].onchange = function(e) {
	  e.target.parentElement.querySelector('.noteditablecover').style.zIndex = e.target.checked?'-1':'2'
      if(!cfgLocal.enabledFeatures) { cfgLocal.enabledFeatures = {} }
      cfgLocal.enabledFeatures[e.target.parentElement.querySelector('code').innerHTML.replace(/ |(\&gt\;)|-/g,'')] = e.target.checked;
      
	
	}
	e[i].onchange({target: e[i]});
	}
  
	}
	}

window.onbeforeunload = function () {
    if(JSON.stringify(cfgLocal) != JSON.stringify(_cfgLocal)) {
    
    return 'You have unsaved changes. Remember to go back to the main page and save!'
    
    }
}
    
function setTimer() {
    setInterval(function () {
        try {
        if(JSON.stringify(cfgLocal) == JSON.stringify(_cfgLocal)) {
        
        document.getElementById('saveDiv').style.height = '0em'
        
        } else {
        
         document.getElementById('saveDiv').style.height = '3em'
        
        }
        } catch (e) { } 
    },100);
}

function reloadDisplay() {
if(!cfgLocal) { return }
if(!cfgLocal.enabledFeatures) { cfgLocal.enabledFeatures = {} }

    for(var i = 0, e = document.querySelectorAll("input.enableCommandsCheck"); i < e.length; i++) {
        e[i].checked = cfgLocal.enabledFeatures[e[i].parentElement.querySelector('code').innerHTML.replace(/ |(\&gt\;)|-/g,'')];
        e[i].onchange({target: e[i]});
	}
}	
	
function openLogin() {
    var dLW = window.open("https://discordapp.com/oauth2/authorize?client_id=387963766798811136&redirect_uri=http%3A%2F%2Ffossilbot.cf%2Fdiscordoauthresponse&response_type=token&scope=identify%20guilds%20connections&state=" + encodeURIComponent(window.location.pathname), 'DiscordAuthWindow','toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=400,height=600'); 
    window.addEventListener("message", function(e) {
    console.log(e);
        localStorage.setItem('discordToken',e.data);
        e.source.close();
        (function(w,d,x) {
             x = ((w.XMLHttpRequest)?(new XMLHttpRequest()):(new ActiveXObject("Microsoft.XMLHTTP")));

          x.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              localStorage.setItem('connectCode',JSON.parse(this.responseText).code);
              localStorage.setItem('connectCode',JSON.parse(this.responseText).code);
              localStorage.setItem('discordMyAccount',JSON.stringify(JSON.parse(this.responseText).user));
			  if(localStorage.getItem('connectCode')) { init() }
                }
              };
              x.open("GET", "/connectCode", true);
              x.setRequestHeader('Authorization',e.data);
              x.send();
            })(window,document);
        
    }, false);
    
}

function editProps(prop,type) {
var pE = document.getElementById('popup');
pE.style.display = 'block'
document.getElementById('pu-editing-elem').innerHTML = (function() {
    switch(prop) {
        case 'getme':
        return '&gt;getme'
        break
        case 'notify':
        return '&gt;notify'
        break
        case 'addmeto':
        return '&gt;addmeto'
        break
            case 'emojis':
        return 'voice emojis'
        break
            case 'xp':
        return 'XP points'
        break
            case 'spam':
        return 'anti-spam'
        break
            case 'resp':
        return 'auto-response'
        break
            case 'joinm':
        return 'join messages'
        break
            case 'namecolor':
        return '&gt;namecolor'
        break
            case 'sort':
        return 'auto-sort'
        break
    }
})();
document.getElementById('pu-props-list').innerHTML = (function() {
    try {
    switch(prop+type) {
        case 'getmeedit':
        return '&gt;getme'
        break
        case 'notifyedit':
        return '<li><div><h2>Notify Role Creation Budget</h2><br><p>Fossilbot will limit people to making <input type="number" value="' + (cfgLocal.notifyBudget||'') + '" onkeyup="cfgLocal.notifyBudget = event.target.value"> new notification roles.'
        break
        case 'addmetoedit':
        return '&gt;addmeto'
        break
            case 'emojisedit':
            if(!cfgLocal.gameEmoji) { cfgLocal.gameEmoji = {} }
            return '<li style="background:#292B2D;width:100%;box-sizing:content-box;"><div style=padding:0.5em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;">Game: <input pattern=".+" id="addGame" style="margin-right: 1em;"> Emoji: <input pattern="..?" id="addEmoji"> <button onclick="if(!cfgLocal.gameEmoji[document.getElementById(\'addGame\').value]) { cfgLocal.gameEmoji[document.getElementById(\'addGame\').value] = document.getElementById(\'addEmoji\').value.length <= 5?document.getElementById(\'addEmoji\').value.substring(0,5):(window.alert(\'Please limit your emoji to less than 5 combined characters.\')); document.getElementById(\'pu-props-list\').appendChild(document.createElement(\'li\')).outerHTML = \'<li style=&quot;background:#323538;width:100%;box-sizing:content-box;&quot;><div style=&quot;padding:0.5em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;&quot;><span style=&quot;margin-right:1em;&quot;>\'+ document.getElementById(\'addGame\').value +\': </span><input style=&quot;width:1.5em;text-align:center;margin-left:1em;&quot; value=&quot;\' + document.getElementById(\'addEmoji\').value +\'&quot; pattern=&quot;..?&quot; onkeyup=&quot;if(event.target.value.length <= 5) { cfgLocal.gameEmoji[\\\'\'+ document.getElementById(\'addGame\').value.replace(/\'|\&quot;|\\\\/g,\'\\\\&1\') + \'\\\'] = event.target.value }&quot;><a class=&quot;deletebutton&quot; onclick=&quot;delete cfgLocal.gameEmoji[\\\'\'+ document.getElementById(\'addGame\').value.replace(/\'|\&quot;|\\\\/g,\'\\\\&1\') + \'\\\']; document.getElementById(\\\'pu-props-list\\\').removeChild(event.target.parentElement.parentElement)&quot; href=&quot;javascript:void(0)&quot;></a></div></li>\'; document.getElementById(\'addGame\').value = \'\'; document.getElementById(\'addEmoji\').value = \'\'}" style="margin-left:1em;">Add</button></div></li>\n' +
            (function(f,i,x,l) {
            x=x||''
            l=Object.keys(f);
            for(i=0;i<l.length;i++) {
            x = x + '<li style="background:#323538;width:100%;box-sizing:content-box;"><div style="padding:0.5em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;"><span style="margin-right:1em;">' + l[i].replace(/(\'|\"|\\)/g,'\\$1') +': </span><input style="width:1.5em;text-align:center;margin-left:1em;" value="' + cfgLocal.gameEmoji[l[i]].replace(/(\'|\"|\\)/g,'\\$1') +'" pattern="..?" onkeyup="cfgLocal.gameEmoji[\''+ l[i].replace(/(\'|\"|\\)/g,'\\$1') + '\'] = event.target.value||\'\'"><a class="deletebutton" onclick="delete cfgLocal.gameEmoji[\''+l[i].replace(/(\'|\"|\\)/g,'\\$1') + '\']; document.getElementById(\'pu-props-list\').removeChild(event.target.parentElement.parentElement)" href="javascript:void(0)"></a></div></li>'
            }
            return x
            })(cfgLocal.gameEmoji);
        break
            case 'xpedit':
        return 'XP points'
        break
            case 'spamedit':
        return '<li><div><h2>@everyone Cooldown</h2><br><p>People can use @everyone <input value="' + (cfgLocal.cooldown_e||0) + '" onkeyup="cfgLocal.cooldown_e = !isNaN(event.target.value)?event.target.value*1:0" type="number" min="0"> times, which resets every <input value="' + ((cfgLocal.cooldown_e_t / 60000)||0) +  '" onkeyup="cfgLocal.cooldown_e_t = !isNaN(event.target.value)?event.target.value*60000:0" type="number" min="0"> minutes</p></div><div><h2>Single-Message Pings</h2><br><p>When someone sends a message with <input value="' + (cfgLocal.cooldown_g||0) + '" onkeyup="cfgLocal.cooldown_g = !isNaN(event.target.value)?event.target.value*1:0" type="number" min="0">or more pings, punish them.</p></div><div><h2>Specific Ping</h2><br><p>If someone pings someone else <input value="' + (cfgLocal.cooldown_s||0) + '" onkeyup="cfgLocal.cooldown_s = !isNaN(event.target.value)?event.target.value*1:0" type="number" min="0"> times in <input value="' + (cfgLocal.cooldown_s_t/60000||0) + '" onkeyup="cfgLocal.cooldown_s_t = !isNaN(event.target.value)?event.target.value*60000:0" type="number" min="0"> minutes, they will be muted.</p></div><div><h2>Mass Pinging</h2><br><p>If someone pings <input value="' + (cfgLocal.cooldown_m||0) + '" onkeyup="cfgLocal.cooldown_m = !isNaN(event.target.value)?event.target.value*1:0" type="number" min="0"> or more people in <input value="' + (cfgLocal.cooldown_m_t/60000||0) + '" onkeyup="cfgLocal.cooldown_m_t = !isNaN(event.target.value)?event.target.value*60000:0" type="number" min="0"> minutes, they will be muted.</p></div><div><h2>Punishment</h2><br><p>When someone is muted, this lasts <input type="number" value="'+ (cfgLocal.spam_time_mins||0)+'" onkeyup="cfgLocal.spam_time_mins = !isNaN(event.target.value)?event.target.value*1:0"> minutes.</p></div></li>'
        break
            case 'respedit':
            if(!cfgLocal.autoResp) { cfgLocal.autoResp = {} }
            return '<li><h3>Note: You may use a regular expression for the prompt.</h3></li><li style="background:#292B2D;width:100%;box-sizing:content-box;"><div style=padding:0.5em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;">Prompt: <input id="addGame" style="margin-right: 1em;"> Response: <input id="addEmoji"> <button onclick="if(!cfgLocal.autoResp[document.getElementById(\'addGame\').value]) { cfgLocal.autoResp[document.getElementById(\'addGame\').value] = document.getElementById(\'addEmoji\').value; document.getElementById(\'pu-props-list\').appendChild(document.createElement(\'li\')).outerHTML = \'<li style=&quot;background:#323538;width:100%;box-sizing:content-box;&quot;><div style=&quot;padding:0.5em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;&quot;><span style=&quot;margin-right:1em;&quot;>When someone says a message with &quot;\'+ document.getElementById(\'addGame\').value +\'&quot; in it, respond with: </span><input style=&quot;text-align:center;margin-left:1em;&quot; value=&quot;\' + document.getElementById(\'addEmoji\').value +\'&quot; onkeyup=&quot;cfgLocal.autoResp[\\\'\'+ document.getElementById(\'addGame\').value.replace(/\'|\&quot;|\\\\/g,\'\\\\&1\') + \'\\\'] = event.target.value&quot;><a class=&quot;deletebutton&quot; onclick=&quot;delete cfgLocal.autoResp[\\\'\'+ document.getElementById(\'addGame\').value.replace(/\'|\&quot;|\\\\/g,\'\\\\&1\') + \'\\\']; document.getElementById(\\\'pu-props-list\\\').removeChild(event.target.parentElement.parentElement)&quot; href=&quot;javascript:void(0)&quot;></a></div></li>\'; document.getElementById(\'addGame\').value = \'\'; document.getElementById(\'addEmoji\').value = \'\'}" style="margin-left:1em;">Add</button></div></li>\n' +
            (function(f,i,x,l) {
            x=x||''
            l=Object.keys(f);
            for(i=0;i<l.length;i++) {
            x = x + '<li style="background:#323538;width:100%;box-sizing:content-box;"><div style="padding:0.5em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;"><span style="margin-right:1em;">When someone says a message with &quot;'+ l[i].replace(/(\'|\"|\\)/g,'\\$1') +'&quot; in it, respond with: </span><input style="text-align:center;margin-left:1em;" value="' + cfgLocal.autoResp[l[i]].replace(/(\'|\"|\\)/g,'\\$1') +'" onkeyup=" cfgLocal.autoResp[\''+ l[i].replace(/(\'|\"|\\)/g,'\\$1') + '\'] = event.target.value "><a class="deletebutton" onclick="delete cfgLocal.autoResp[\''+l[i].replace(/(\'|\"|\\)/g,'\\$1') + '\']; document.getElementById(\'pu-props-list\').removeChild(event.target.parentElement.parentElement)" href="javascript:void(0)"></a></div></li>'
            }
            return x
            })(cfgLocal.autoResp);
        break
            case 'joinmedit':
            if(!cfgLocal.msgs) { cfgLocal.msgs = {} }
            return '<li><div>When someone joins, send &quot; <input value="' + (cfgLocal.msgs.joinPublic||'') + '" onkeyup="cfgLocal.msgs.joinPublic = event.target.value||\'\'"> &quot; in the default channel, and send &quot; <input value="' + (cfgLocal.msgs.joinPrivate||'') + '" onkeyup="cfgLocal.msgs.joinPrivate = event.target.value||\'\'"> &quot; in a DM to them. (use <code>&lt;@{USER}&gt;</code> to ping the user)</li>'
        break
            case 'namecoloredit':
            if(!cfgLocal.nameColorRoles) { cfgLocal.nameColorRoles = {} }
            return '<li><h3>Note: Nametag roles not on this list will be accessible to all users.</h3></li><li><p>Allow custom namecolors with hex codes? <input type="checkbox" checked="' + cfgLocal.enabledFeatures.namecolor_hex + '" onclick="cfgLocal.enabledFeatures.namecolor_hex = event.target.checked"></p></li><li style="background:#292B2D;width:100%;box-sizing:content-box;"><div style=padding:0.5em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;">Color: <input id="addGame" style="margin-right: 1em;">Allowed Roles (comma-seperated): <input id="addEmoji"> <button onclick="if(!cfgLocal.nameColorRoles[(document.getElementById(\'addGame\').value || \'none\').toLowerCase()]) { cfgLocal.nameColorRoles[(document.getElementById(\'addGame\').value || \'none\').toLowerCase()] = document.getElementById(\'addEmoji\').value.split(\',\'); document.getElementById(\'pu-props-list\').appendChild(document.createElement(\'li\')).outerHTML = \'<li style=&quot;background:#323538;width:100%;box-sizing:content-box;&quot;><div style=&quot;padding:0.5em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;&quot;><span style=&quot;margin-right:1em;&quot;>The following roles have access to the  <code>>namecolor \'+ document.getElementById(\'addGame\').value +\'</code> command: </span><input style=&quot;text-align:center;margin-left:1em;&quot; value=&quot;\' + document.getElementById(\'addEmoji\').value +\'&quot; onkeyup=&quot;cfgLocal.nameColorRoles[\\\'\'+ document.getElementById(\'addGame\').value.replace(/\'|\&quot;|\\\\/g,\'\\\\&1\') + \'\\\'] = event.target.value.split(\\\',\\\')&quot;><a class=&quot;deletebutton&quot; onclick=&quot;delete cfgLocal.nameColorRoles[\\\'\'+ document.getElementById(\'addGame\').value.replace(/\'|\&quot;|\\\\/g,\'\\\\&1\') + \'\\\']; document.getElementById(\\\'pu-props-list\\\').removeChild(event.target.parentElement.parentElement)&quot; href=&quot;javascript:void(0)&quot;></a></div></li>\'; document.getElementById(\'addGame\').value = \'\'; document.getElementById(\'addEmoji\').value = \'\'}" style="margin-left:1em;">Add</button></div></li>\n' +
            (function(f,i,x,l) {
            x=x||''
            l=Object.keys(f);
            for(i=0;i<l.length;i++) {
            x = x + '<li style="background:#323538;width:100%;box-sizing:content-box;"><div style="padding:0.5em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;"><span style="margin-right:1em;">The following roles have access to the <code>&gt;namecolor '+ l[i].replace(/(\'|\"|\\)/g,'\\$1') +'</code> command: </span><input style="text-align:center;margin-left:1em;" value="' + cfgLocal.nameColorRoles[l[i]].join(',') +'" onkeyup=" cfgLocal.nameColorRoles[\''+ l[i].replace(/(\'|\"|\\)/g,'\\$1') + '\'] = event.target.value.split(\',\') "><a class="deletebutton" onclick="delete cfgLocal.nameColorRoles[\''+l[i].replace(/(\'|\"|\\)/g,'\\$1') + '\']; document.getElementById(\'pu-props-list\').removeChild(event.target.parentElement.parentElement)" href="javascript:void(0)"></a></div></li>'
            }
            return x
            })(cfgLocal.nameColorRoles);
        break
            case 'sortedit':
            return '<li><div><h2>Category to Sort</h2><br><p>Fossilbot will automatically sort channels in the <input value="' + (cfgLocal.autoorder_category_name||'') + '" onkeyup="cfgLocal.autoorder_category_name = event.target.value"> category by their activity.'
        break
    }
    } catch (e) { if(e) { console.log(e); return '<span style="color:#B37373">Error</span>' }}
})();
}

function sendEdits() {
        document.getElementById('hgebjkhgrkujeab').classList.add('expandHor');
        document.getElementById('saveDiv').style.background = '#364447';
        document.getElementById('sendButton').style.background = '#9AB7A0';
        document.getElementById('sendButton').style.cursor = 'default';
        document.getElementById('sendButton').onclick = '';
        document.getElementById('sendButton').innerHTML = '. . .';
        (function(w,d,x) {
             x = ((w.XMLHttpRequest)?(new XMLHttpRequest()):(new ActiveXObject("Microsoft.XMLHTTP")));

          x.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              _cfgLocal = JSON.parse(JSON.stringify(cfgLocal));
              document.getElementById('saveDiv').style.background = '#37473B';
              document.getElementById('hgebjkhgrkujeab').classList.remove('expandHor');
              document.getElementById('sendButton').style.background = '#61B774';
              document.getElementById('sendButton').style.cursor = 'pointer';
              document.getElementById('sendButton').innerHTML = 'Save Edits';
              document.getElementById('sendButton').onclick = function() { sendEdits() };
                }
              };
              x.open("POST", "/adminAction", true);
              x.setRequestHeader('Authorization',localStorage.getItem('connectCode'));
              x.setRequestHeader('Content-Type','application/json');
              x.send(JSON.stringify(cfgLocal));
            })(window,document);
            setTimeout(function() {
            if(JSON.stringify(cfgLocal) != JSON.stringify(_cfgLocal)) {
            document.getElementById('hgebjkhgrkujeab').classList.remove('expandHor');
            document.getElementById('saveDiv').style.background = '#473636'
            document.getElementById('sendButton').style.background = '#61B774';
            document.getElementById('sendButton').style.cursor = 'pointer';
            document.getElementById('sendButton').onclick = function() { sendEdits() };
            document.getElementById('sendButton').innerHTML = 'Fatal Error. Retry?';
            }
            },24000)

}