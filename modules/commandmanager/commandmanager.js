var fs = require("fs");
var filenamearray = fs.readdirSync(__dirname + "/../commands"),
    requiredfileobject = {};
var aliases = require(__dirname + "/command_aliases.json");

for(var i = 0; i < filenamearray.length; i++) {
    var fileNameWithoutExtension = filenamearray[i].split(".")[0];
    requiredfileobject[fileNameWithoutExtension] = require(__dirname + "/../commands/" + filenamearray[i]);
    if(aliases[fileNameWithoutExtension]) {
        var aliasedEntry = aliases[fileNameWithoutExtension];
        for(var aliasI = 0; aliasI < aliasedEntry.length; aliasI++) {
            requiredfileobject[aliasedEntry[aliasI]] = requiredfileobject[fileNameWithoutExtension];
        }
    }
}


module.exports = {};
module.exports.commands = requiredfileobject;

module.exports.resolveAlias = function(alias) {
    //if the alias isn't in the list, go ahead and return an empty string
    if(module.exports.commands[alias]) {
        var aliaskeys = Object.keys(aliases);
        //if the alias is a command's real name, give the unmodified string back
        if(aliaskeys[alias]) {
            return alias;
        }
        //otherwise, iterate through and find the name
        for(var i = 0; i < aliaskeys.length; i++) {
            if(aliases[aliaskeys[i]].indexOf(alias) !== -1) {
                return aliases[aliaskeys[i]];
            }
        }
        //if we've made it through that `return` (meaning that the alias doesn't exist), return an empty string
        return "";
    } else return "";
};
