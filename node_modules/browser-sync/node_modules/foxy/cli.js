#!/usr/bin/env node
var meow   = require("meow");
var devip  = require("dev-ip").getIp();
var logger = require("./lib/logger");
var foxy   = require("./");
var help   = require("fs").readFileSync(__dirname + "/help.txt", "utf8");

var cli = meow({
    help: help
});

if (cli.input.length) {
    var server = foxy(cli.input[0], cli.flags);
    server.listen(cli.flags.port);
    var urls = ["http://localhost:" + server.address().port];
    if (devip.length) {
        urls.push("http://" + devip[0] + ":" + server.address().port);
    }
    urls.forEach(function (url) {
        logger.info("Server running at: {magenta:%s", url);
    });
} else {
    logger.info("At least 1 argument is required {yellow:(url)}");
    logger.info("For help, run {cyan:foxy --help");
}


