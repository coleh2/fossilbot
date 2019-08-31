var { createCanvas } = require("canvas");

module.exports = function(evt,args,_cfg,bot) {
    if (!_cfg.enabledFeatures.namecolor) { bot.sendMessage({ to: evt.d.channel_id, message: "Sorry, but that feature isn't enabled on this server." }); return; }
    var c = roleName(evt, args.join(" ").toLowerCase());
    var accpt = (_cfg.nameColorRoles[(args.join(" ") || "__none").toLowerCase()]);
    if (!bot.servers[evt.d.guild_id]) {
        c = null;
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "An error occured! Try again in another server!"
        });

    }
    if (c != null) {
        var iscpt = false, nocpt = 0;
        if (accpt) {
            for (var i = 0; i < accpt.length; i++) {
                console.log(nocpt);
                var aR = roleSearchByName(evt, accpt[i]);
                console.log(aR);
                if (aR) {
                    console.log(bot.servers[evt.d.guild_id].members[evt.d.author.id].roles[aR]);
                    if (!bot.servers[evt.d.guild_id].members[evt.d.author.id].roles[aR]) {
                        nocpt++;

                    }
                }
            }
            if (nocpt > 0) { iscpt = false; } else { iscpt = true; }
            console.log(iscpt);
        } else { iscpt = true; }
        console.log({ iscpt: iscpt, accpt: accpt, nocpt: nocpt });
        if (!iscpt) {
            bot.sendMessage({
                to: evt.d.channel_id,
                message: "Sorry, but you are not permitted to have that color"
            });
        } else if (iscpt) {
            evt.d.member.roles.find(function (key) {
                var res = bot.servers[evt.d.guild_id].roles[key].name;
                if (res.substring(res.length - 8, res.length).toLowerCase() == " nametag" && key != c) { bot.removeFromRole({ serverID: evt.d.guild_id, userID: evt.d.author.id, roleID: key }); }
            });
            console.log("🖌️ Nametag Color on server " + evt.d.guild_id + " for " + evt.d.author.username + "#" + evt.d.author.discriminator + " changed to " + args.join(" ") + " (" + c + ")");
            bot.addToRole({ serverID: evt.d.guild_id, userID: evt.d.author.id, roleID: c });
            bot.sendMessage({
                to: evt.d.channel_id,
                message: "Your nametag color has been set!"

            });
        }
    } else if (!args[0]) {
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "You need to specify a color!",
        });
    } else if (args[0].toUpperCase().match(/^#([0-F]){6}$/)) {
        if (_cfg.enabledFeatures.namecolor_hex) {
            var hexCode = args[0].toUpperCase().match(/^#([0-F]){6}$/).input.substring(1);
            if (!hexCode) {
                bot.sendMessage({
                    to: evt.d.channel_id,
                    message: "Okay, if you're seeing this error, something has gone VERY WRONG. DM coleh#1346 ASAP",
                });
            } else {
                console.log("hexCode: " + hexCode);
                evt.d.member.roles.find(function (key) {
                    var res = bot.servers[evt.d.guild_id].roles[key].name;
                    if (res.substring(res.length - 8, res.length).toLowerCase() == " nametag" && key != c) { bot.removeFromRole({ serverID: evt.d.guild_id, userID: evt.d.author.id, roleID: key }); }
                });

                var hexDecNum = parseInt(hexCode, 16);
                if (hexColorDelta(hexCode, "140A02") < 0.95) {
                    bot.createRole(evt.d.guild_id, function (err, resp) {
                        if (err) {
                            if(err.statusCode == 403 && err.response) {
                                if(err.response.code == 50013) {
                                    bot.sendMessage({
                                        to: evt.d.channel_id,
                                        message: "Looks like I can't do that; I don't have the required permissions! Please ask an admin to make sure that I have the `Manage Permissions` permission. "
                                    });
                                }
                            }
                            
                            console.log(err); return; 
                        }
                        //console.log(resp);
                        var JustMadeRole = resp.id;
                        bot.editRole({ serverID: evt.d.guild_id, roleID: JustMadeRole, name: "#" + hexCode + " Nametag", color: hexDecNum });
                        if (JustMadeRole) {
                            bot.addToRole({
                                serverID: evt.d.guild_id,
                                userID: evt.d.author.id,
                                roleID: JustMadeRole
                            });
                            bot.sendMessage({
                                to: evt.d.channel_id,
                                message: "Your nametag color has been set!"

                            });
                        }
                    });
                } else {
                    bot.sendMessage({
                        to: evt.d.channel_id,
                        message: "Oh no, it looks like that color is too close to Discord Grey. Please pick a more contrasting color :smiley:",
                    });
                }

            }
        } else {
            bot.sendMessage({
                to: evt.d.channel_id,
                message: "Oops, custom hex codes for nametags aren't supported on this server.",
            });
        }
    } else if (colorRoleList(evt).length > 0) {
        var clrRoleList = colorRoleList(evt);
        if (args.length > 0 && (args[0] != "none" && args[0] != "clear")) {
            var missingColorErrorMessage;
            if(args[0] == "list") missingColorErrorMessage = "I'll DM you a list of colors right away!";
            else missingColorErrorMessage = "That's not a valid color here! I'll DM you a list of colors that work on this server.";
            bot.sendMessage({
                to: evt.d.channel_id,
                message: missingColorErrorMessage,
            });
            //Generate image of colors 

            var canvas = createCanvas(100, (clrRoleList.length * 40));
            var ctx = canvas.getContext("2d");
            var colorRObjs = colorRoleObjList(evt);
            ctx.font = "12px Arial";
            for (let i = 0; i < colorRObjs.length; i++) {
                ctx.beginPath();
                ctx.fillStyle = "#" + colorRObjs[i].color.toString(16);
                ctx.rect(0, i * 40, 100, 40);
                ctx.fill();
                ctx.beginPath();
                ctx.fillStyle = colorRObjs[i].color > 3355443 ? "#000000" : "#ffffff";
                var _name = colorRObjs[i].name.split(" Nametag")[0];
                if (_name.length > 16) {
                    _name = _name.substring(0, 16) + "...";
                }
                ctx.fillText(_name, 5, (i * 40) + 15);

            }
            //console.log(canvas.toDataURL());
            bot.uploadFile({
                to: evt.d.author.id,
                message: "Colors: \n" + clrRoleList.join("\n"),
                file: canvas.toBuffer(),
                filename: "colorRole.png"
            });

        } else if (args[0] == "none" || args[0] == "clear") {
            evt.d.member.roles.find(function (key) {
                var res = bot.servers[evt.d.guild_id].roles[key].name;
                if (res.substring(res.length - 8, res.length).toLowerCase() == " nametag") { bot.removeFromRole({ serverID: evt.d.guild_id, userID: evt.d.author.id, roleID: key }); }
            });
            bot.sendMessage({
                to: evt.d.channel_id,
                message: "Your name color has been restored to the default!",
            });
        } else {
            bot.sendMessage({
                to: evt.d.channel_id,
                message: "You need to include a color!",
            });
        }
        evt.d.member.roles.find(function (key) {
            var res = bot.servers[evt.d.guild_id].roles[key].name;
            if (res.substring(res.length - 8, res.length).toLowerCase() == " nametag") { bot.removeFromRole({ serverID: evt.d.guild_id, userID: evt.d.author.id, roleID: key }); }
        });
    } else {
        bot.sendMessage({
            to: evt.d.channel_id,
            message: "Sorry, that feature isn't enabled on this server! Use `>help namecolor` to learn more.",
        });
    }

    //utility functions to find ids from names, list colors, etc.
    function roleName(evt, q) {
        if (!bot.servers[evt.d.guild_id]) { return null; }
        var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function (key) {
            var res = bot.servers[evt.d.guild_id].roles[key].name;
            if(!res) {res = "___________________________"; }
            if (res.substring(0, res.length - 8).toLowerCase() == q.toLowerCase() && res.substring(res.length - 8, res.length).toLowerCase() == " nametag") { return true; }
        }));
        if (r != null) { return r; } else { return null; }
    }
    
    function roleSearchByName(evt, q) {
        if (!bot.servers[evt.d.guild_id]) { return null; }
        var r = (Object.keys(bot.servers[evt.d.guild_id].roles).find(function (key) {
            var res = bot.servers[evt.d.guild_id].roles[key].name;
            if (res.toLowerCase() == q.toLowerCase()) { return true; }
        }));
        if (r != null) { return r; } else { return null; }
    }
    
    function colorRoleList(evt) {
        if (!bot.servers[evt.d.guild_id]) { return null; }
        var e = [];
        Object.keys(bot.servers[evt.d.guild_id].roles).find(function (key) {
            var res = bot.servers[evt.d.guild_id].roles[key].name;
            if(!res) {res = "foo";}
            if (res.substring(res.length - 8, res.length).toLowerCase() == " nametag" && res.substring(0,1) != "#") { e.push(res.substring(0, res.length - 8)); }
        });
        return e;
    }
    function colorRoleObjList(evt) {
        if (!bot.servers[evt.d.guild_id]) { return null; }
        var e = [];
        Object.keys(bot.servers[evt.d.guild_id].roles).find(function (key) {
            var res = bot.servers[evt.d.guild_id].roles[key].name;
            if (res.substring(res.length - 8, res.length).toLowerCase() == " nametag" && res.substring(0,1) != "#") { e.push(bot.servers[evt.d.guild_id].roles[key]); }
        });
        return e;
    }
};

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