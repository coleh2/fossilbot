const { Client } = require('discord.js');
const yt = require('ytdl-core');
const tokens = {
	"adminID" : "297151429087592449",
    "prefix" : "++",
	"passes" : 5
};
const client = new Client();
const ytsl = require('youtube-search-list').search;
var queue = {};
//debugging values
process.env.TOKEN = 'NTE1NTA4NDI1OTc5OTg1OTIw.DtrfFA.ENgMhRSe-cMFGBx1kF-NOnAlwAw'
process.env.JOIN_VC = '427197003458543616'
process.env.VC_GUILD = '427197003035049985'
process.env.INIT_PLAY = 'https://www.youtube.com/watch?v=ajjj4pLnjz8'
var processHandle = function(m) {
   queue[m.g] = queue[m.g]||{songs:[]}
   if(m.f == 'setSongToUrl') {
        queue[m.g].songs = queue[m.g].songs||[]
        if(!client.guilds.get(m.g).voiceConnection) {
            joinChannel(client.channels.get(m.c)).then(function(c) {
                queue[m.g].dispatcher = client.guilds.get(m.g).voiceConnection.playStream(yt(m.u, { filter: 'audioonly', quality: 'lowest'}), { passes : tokens.passes });
            
			    queue[m.g].dispatcher.on('end', () => {
			        if(queue[m.g].songs[1]) {
                        queue[m.g].dispatcher = client.guilds.get(m.g).voiceConnection.playStream(yt((queue[m.g].songs.shift()).url, { filter: 'audioonly', quality: 'lowest' }), { passes : tokens.passes });
                    }
		    	});
                
            });


        } else {
            queue[m.g].songs.splice(0,0,{url:m.u});
            queue[m.g].dispatcher = client.guilds.get(m.g).voiceConnection.playStream(yt(m.u, { filter: 'audioonly', quality: 'lowest'}), { passes : tokens.passes });
            queue[m.g].dispatcher.on('end', () => {
                queue[m.g].dispatcher = client.guilds.get(m.g).voiceConnection.playStream(yt((queue[m.g].songs.shift()).url, { filter: 'audioonly', quality: 'lowest' }), { passes : tokens.passes });
            });  
        }
      } else if (m.f == 'addSongToQueue') {
      queue[m.g].songs.push({url:m.u});
      } else if (m.f == 'volSet') {
          queue[m.g].dispatcher.setVolume(m.u);
      } else if (m.f == 'pauseSong') {
          queue[m.g].pause();
      } else if (m.f == 'resumeSong') {
          queue[m.g].resume();
      } else if (m.f == 'skipSong') {
          queue[m.g].end();
      }

      
}

process.on('message', processHandle);
client.on('ready', function() {
    console.log(client.user.username + ' ready!');
   // client.user.setStatus('invisible');
    processHandle({f:'setSongToUrl',u:'https://www.youtube.com/watch?v=DPgE7PNzXag',g:'392830469500043266',c:'447484453061656587'});
});

client.login(process.env.TOKEN||require('./auth.json'));

function joinChannel (channel) {
		return new Promise((resolve, reject) => {
			channel.join().then(connection => resolve(connection)).catch(err => reject(err));
		});
	}

function handleClose(e) {
    if(e) { console.error(e) }
    console.log('closing');
    client.destroy();
    //process.send({f:'freeRaptor',c:m.c,g:m.g})
    process.exit();
}
process.on('exit', handleClose);
process.on('uncaughtException', (e) => { handleClose(e) });
process.on('SIGINT', handleClose);
process.on('SIGUSR1', handleClose);
process.on('SIGUSR2', handleClose);