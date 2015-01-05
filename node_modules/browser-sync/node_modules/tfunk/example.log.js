var tfunk  = require("./index").Logger({
    prefix: "{blue:[}{magenta:tFunk}{cyan:] }",
    prefixes: {
        debug: "{yellow:[debug]} ",
        info:  "{cyan:[info]} ",
        warn:  "{magenta:[warn]} ",
        error: "{red:[error]} "
    }
}).setLevelPrefixes(true).setLevel("debug");

tfunk.log("debug", "Debugging thing");
tfunk.log("info",  "Info statement");
tfunk.log("warn",  "A little Warning");
tfunk.log("error", "there was an error!");

