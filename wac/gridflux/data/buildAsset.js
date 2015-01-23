var path = require('path');
var fs = require('fs');

var workingPath = process.argv[2];
process.chdir(workingPath);

function getExtension(filename) {
  var ext = path.extname(filename||'').split('.');
  return ext[ext.length - 1];
}

var asset = {
  entry: {
    name: "unnamed",
    reference: "www.google.com",
    payload: {}
  }
};

var assetPath = "data/" + workingPath + "/";

var files = fs.readdirSync(".");
for (var i = 0; i < files.length; ++i) {
  if (getExtension(files[i]) === "wav") {
    var key = files[i].slice(0, -4).toString();
    asset.entry.payload[key] = assetPath + files[i];
  }
}

console.log(asset);