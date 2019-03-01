var fs = require('fs');
var filenamearray = fs.readdirSync(__dirname + '/commands'),
    requiredfileobject = {};

for(var i = 0; i < filenamearray.length; i++) {
    var fileNameWithoutExtension = filenamearray[i].split('\.')[0];
    requiredfileobject[fileNameWithoutExtension] = require('./commands/' + filenamearray[i]);
}

module.exports = requiredfileobject;