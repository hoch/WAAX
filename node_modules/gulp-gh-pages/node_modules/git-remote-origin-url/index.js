'use strict';
var gitconfig = require('gitconfiglocal');

module.exports = function (dir, cb) {
	gitconfig(dir, function (err, config) {
		if (err) {
			cb(err);
			return;
		}

		var url = config.remote && config.remote.origin && config.remote.origin.url;

		if (!url) {
			cb(new Error('Couldn\'t find origin url'));
			return;
		}

		cb(null, url);
	});
};
