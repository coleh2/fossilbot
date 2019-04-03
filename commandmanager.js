var fs = require('fs');
var filenamearray = fs.readdirSync(__dirname + '/commands'),
    requiredfileobject = {};
var aliases = require('./aliases.json');

for(var i = 0; i < filenamearray.length; i++) {
    var fileNameWithoutExtension = filenamearray[i].split('\.')[0];
    requiredfileobject[fileNameWithoutExtension] = require('./commands/' + filenamearray[i]);
    if(aliases[fileNameWithoutExtension]) {
        var aliasedEntry = aliases[fileNameWithoutExtension];
        for(var aliasI = 0; aliasI < aliasedEntry.length; aliasI++) {
            requiredfileobject[aliasedEntry[aliasI]] = requiredfileobject[fileNameWithoutExtension];
        }
    }
}


module.exports = requiredfileobject;