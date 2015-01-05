# git-remote-origin-url [![Build Status](https://travis-ci.org/sindresorhus/git-remote-origin-url.svg?branch=master)](https://travis-ci.org/sindresorhus/git-remote-origin-url)

> Get the remote origin url of a git repository


## Install

```sh
$ npm install --save git-remote-origin-url
```


## Usage

```js
var originUrl = require('git-remote-origin-url');

originUrl('path/to/repository', function (err, url) {
	console.log(url);
	//=> git@github.com:sindresorhus/git-remote-origin-url.git
});
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
