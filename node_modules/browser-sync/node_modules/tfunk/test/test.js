//var compiler         = require("./../index").Compiler();
var tfunk       = require("./../index");
var assert           = require("chai").assert;
var stripColor       = require("chalk").stripColor;

describe("Adding Colors", function(){

    it("should strip all templating", function(){

        var string   = "{red: Shane {green: Alan }{red: Osbourne {blue: is MY Name }{red: sir }";
        var expected = " Shane  Alan  Osbourne  is MY Name  sir ";
        var actual = stripColor(tfunk(string));

        assert.equal(actual, expected);
    });
    it("should strip all templating (2)", function(){

        var string   = "{red:This has two non-nested} {cyan:colours}";
        var expected = "This has two non-nested colours";
        var actual = stripColor(tfunk(string));

        assert.equal(actual, expected);
    });
    it("should strip all templating (3)", function(){

        var string   = "OH yeah {red:This has two non-nested} {cyan:colours}";
        var expected = "OH yeah This has two non-nested colours";
        var actual = stripColor(tfunk(string));

        assert.equal(actual, expected);
    });
});

describe("Paths for chained CHALK methods", function(){
    it("", function(){
        var out = tfunk("{blue.bgRed.bold:This has two non-nested");
        assert.equal(out, "\u001b[1m\u001b[41m\u001b[34mThis has two non-nested\u001b[39m\u001b[49m\u001b[22m");
    });
});

describe("Custom functions", function(){
    it("can use custom functions", function(){
        var out = tfunk("{shane:This has two non-nested", {
            "shane": function () {
                return "\u001b[31mshane is awesome\u001b[39m";
            }
        });
        assert.equal(out, "\u001b[31mshane is awesome\u001b[39m");
    });
    it("can use the compiler internally", function(){
        var out = tfunk("{shane:This has two non-nested", {
            "shane": function () {
                return this.compile("{red:shane is awesome");
            }
        });
        assert.equal(out, "\u001b[31mshane is awesome\u001b[39m");
    });
});

describe("Compiler instance", function(){
    it("Can create an instance", function(){
        var compiler = new tfunk.Compiler();
        var out = compiler.compile("shane");
        assert.equal(out, "shane");
    });
    it("Can use custom methods", function(){
        var compiler = new tfunk.Compiler({
            warn: function (string) {
                return string + " + JS";
            }
        });
        var out = compiler.compile("{warn:HTML");
        assert.equal(out, "HTML + JS");
    });
    it("Can use string for prefix", function(){
        var compiler = new tfunk.Compiler({}, {
            prefix: "SHANE "
        });
        var out = compiler.compile("HTML");
        assert.equal(out, "SHANE HTML");
    });
    it("Can use function for prefix", function(){
        var compiler = new tfunk.Compiler({}, {
            prefix: function () {
                return this.compile("SHANE ");
            }
        });
        var out = compiler.compile("HTML");
        assert.equal(out, "SHANE HTML");
    });
    it("can output escaped { & }", function(){
        var out = tfunk("\\{shane\\}");
        assert.equal(out, "{shane}");
    });
    it("can output multiple escaped { & }", function(){
        var out = tfunk("{green:\\{\\{shane\\}\\}} Some other");
        assert.equal(stripColor(out), "{{shane}} Some other");
    });
    it("can use color inside escaped curlies", function(){
        var out = tfunk("Escaping is supported {green:\\{\\{double {blue:curlies}\\}\\}}");
        assert.equal(stripColor(out), "Escaping is supported {{double curlies}}");
    });
});