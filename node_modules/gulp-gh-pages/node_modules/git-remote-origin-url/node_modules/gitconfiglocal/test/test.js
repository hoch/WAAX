var test = require('tape');
var gitconfig = require('../index');
var path = require('path');

test("can get gitconfig",function(t) {
  gitconfig(path.resolve(__dirname,'..'),function(err,data){
    t.ok(!err,'should not have error getting gitconfig');
    t.ok(data,'should have config data');
    t.end();
  });
});

test("can get gitconfig from subfolder",function(t) {
  gitconfig(__dirname,function(err,data){
    t.ok(!err,'should not have error getting gitconfig');
    t.ok(data,'should have config data');
    t.end();
  });
});

