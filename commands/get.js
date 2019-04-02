var pokemon = require('../getme_context_data/pokemon.json');
pokemon = pokemon.pokemon;
var citiesdata = require('../getme_context_data/us_cities.json');
citiesdata = citiesdata.cities;
var gothouses = require('../getme_context_data/got_noble_houses.json');
gothouses = gothouses.Noble_Houses;
var hpchars = require('../getme_context_data/harry_potter_chars.json');

var request = require('request');

var jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = function(evt,args,_cfg,bot) {
    if (!_cfg.enabledFeatures.getme) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return }
    var query = args.join(' ');
    var indx = null;
    var _indx = /(?:(?:number)|#) *(\d+)/i.exec(query);
    if (_indx) { indx = _indx[1] } else { indx = 0 }
    if (indx) { query = query.replace(/(?:(?:number)|#) *(\d+)/i, '') }

    if (!query) { return }
    bingGetPic(query, bot, evt.d.channel_id, evt, indx);


    function bingGetPic(q, bot, channelID, evt, number) {
        var cisnsfw = bot.servers[evt.d.guild_id].channels[channelID].nsfw;

        if (number == 0) {

            var pkmnItem = pokemon.find(itm => { return q.toLowerCase().match(itm.name.toLowerCase()) });
            if (!pkmnItem) { var cityItem = citiesdata.find(itm => { return q.toLowerCase().match(itm.city.toLowerCase()) && (q.toLowerCase().match('population') || q.toLowerCase().match('city') || q.toLowerCase().match('location')) }); }
            if (!pkmnItem && !cityItem) { var houseItem = gothouses.find(itm => { return q.toLowerCase().match('house ' + itm.House.toLowerCase()) }); }
            if (!pkmnItem && !cityItem && !houseItem) { var hpcharItem = hpchars.find(itm => { return q.toLowerCase().match(itm.First.toLowerCase() + ' ' + itm.Last.toLowerCase()) || (q.toLowerCase().match(itm.First.toLowerCase()) && itm.Last == "" && number == 0) }); }
            //console.log(pkmnItem)


            if (pkmnItem) { q = pkmnItem.name + ' pokemon' }
            else if (cityItem) { q = cityItem.city + ' city' }
            else if (houseItem) { q = 'Game of Thrones House ' + houseItem.House }
            else if (hpcharItem) { q = 'Harry Potter ' + hpcharItem.First + ' ' + hpcharItem.Last }
        }

        var url = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q) + '&safe=active';
        var doLinkInstead = false, img;
        if (cisnsfw) { url = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q) + '&safe=images' }
        //if(_cfg.getmeLinkKeywords) { if((function (a,b,e,i) { for(i=0,e=a.split(' ');i<e.length;i++) { if(b.toLowerCase().match(e[i].toLowerCase())) { return }  }})(_cfg.getmeLinkKeywords,q) ) { var doLinkInstead = true; url = 'https://www.google.com/search?q=' + encodeURIComponent(q) }  } }
        if (q.toLowerCase().match('xkcd')) { url = 'https://www.google.com/search?q=' + encodeURIComponent(q); doLinkInstead = true; }
        request(url, function (err, resp, body) {
            body = (new JSDOM(body)).window.document
            if (doLinkInstead) {
                img = body.querySelectorAll('.r > a');
            } else {
                img = body.querySelectorAll('img');
            }
            if (img[0] == null) {
                bot.sendMessage({
                    to: channelID,
                    message: "That query didn't get any approved results!"
                });
                return
            }
            var color = _cfg.getmeColor || 7604687;
            if (!img[number]) number = img.length - 1
            console.log(img[number].href || img[number].src);
            var finalUrl = img[number].href ? img[number].href : img[number].src;
            if (pkmnItem) {
                var pkmnTypes = ['', 'Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark'];
                var pkmnColors = {};
                console.log((pkmnTypes[pkmnItem.type1_id]) + (pkmnItem.type2_id ? ('/' + pkmnTypes[pkmnItem.type2_id]) : ''));
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
                                "value": (pkmnTypes[pkmnItem.type1_id]) + (pkmnItem.type2_id ? ('/' + pkmnTypes[pkmnItem.type2_id]) : ''),
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
                                "value": houseItem.Words.join ? '"' + houseItem.Words.join('", "') + '"' : '"' + houseItem.Words + '"',
                                "inline": true
                            },
                            {
                                "name": "Seats:",
                                "value": houseItem.Seats.join ? houseItem.Seats.join(', ') : houseItem.Seats,
                                "inline": true
                            },
                            {
                                "name": "Founded By:",
                                "value": houseItem.Founders.join ? houseItem.Founders.join(', ') : houseItem.Founders,
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
                                "value": (hpcharItem.Prefect ? '\u2705' : '\u274c') + '/' + (hpcharItem.Head ? '\u2705' : '\u274c'),
                                "inline": true
                            },
                            {
                                "name": "Order of the Phoenix Member",
                                "value": (hpcharItem.OotP ? '\u2705' : '\u274c'),
                                "inline": true
                            }

                        ]
                    }
                };

            } else {
                if (doLinkInstead) {
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
}