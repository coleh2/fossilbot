var https = require("https");

module.exports = function(evt) {

evt = JSON.parse(JSON.stringify(evt));

if(evt.d.member) delete evt.d.member.roles;

evt.time = (new Date()).toISOString();


    const options = {
        hostname: "script.google.com",
        path: "/macros/s/AKfycbxJdHe9BJPvXFuiZipaV4ZRS7pif-PJu_IFHI7HzaQxXs9AbtWT9fkW/exec?" + queryString(flatObj(evt)),
        method: 'GET',
        headers: { },
    }

    var req = https.request(options, function (res) {
        res.setEncoding("utf8");

        var body = "";

        res.on("data", function (chunk) {
            body += chunk;
        });
        res.on("close", function () {
            //console.error(body);
        });
    });

    req.end();

}

function queryString(obj) {
  var qs = "";

  var keys = Object.keys(obj);
  for(var i = 0; i < keys.length; i++) qs += "&" + encodeURIComponent(keys[i]) + "=" + encodeURIComponent(obj[keys[i]]);

  return qs.substring(1);
}


function flatObj(obj, parent, name) { 
  var result = {};
  obj = Object.assign({}, obj);

  if(!parent) parent = result, name = "";
  Object.keys(obj).forEach(k=>{
  if(typeof obj[k] == "function") return;
  else if(typeof obj[k] == "object") flatObj(obj[k], parent, name + "." + k);
  else parent[name + "." + k] = obj[k];
});
return result; }
