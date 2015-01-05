var peg  = require("pegjs");
var fs   = require("fs");
var path = require("path");
var root = path.join(path.dirname(__filename), "..");

var options = {
    cache: false,
    trackLineAndColumn: true,
    output: 'source',
    optimize: "speed"
};

var header = "// Do not edit the parser directly. This is a generated file created using a build script and the PEG grammar.";
var umd    = "module.exports = ";

var parser = peg.buildParser(fs.readFileSync(path.join(root, "src", "tfunk.pegjs"), "utf8"), options);
fs.writeFileSync(path.join(root, "lib", "parser.js"), [header, umd].join("\n") + parser);
