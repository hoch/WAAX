
[![Build Status](https://secure.travis-ci.org/soldair/node-gitconfiglocal.png)](http://travis-ci.org/soldair/node-gitconfiglocal)

gitconfiglocal
==============

parse the .git/config file into a useful data structure


example
=======

```js
var gitconfig = require('gitconfiglocal');

gitconfig('./',function(err,config){
  console.log(config);
  /* prints:
  { core: 
     { repositoryformatversion: '0',
       filemode: true,
       bare: false,
       logallrefupdates: true },
    remote: 
     { origin: 
        { url: 'git@github.com:soldair/node-gitconfiglocal.git',
          fetch: '+refs/heads/*:refs/remotes/origin/*' } } }
  */
});


```



