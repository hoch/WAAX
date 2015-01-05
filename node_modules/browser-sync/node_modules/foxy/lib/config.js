var Immutable = require("immutable");
var url       = require("url");

var utils     = require("./utils");
var errors    = require("./errors");

var defaults = Immutable.fromJS({
    /**
     * Error handler for proxy server.
     */
    errHandler: errors,
    /**
     * Cookie options
     */
    cookies: {
        /**
         * Strip the domain attribute from cookies
         * This is `true` by default to help with logins etc
         */
        stripDomain: true
    }
});

/**
 * @param {String} target - a url such as http://www.bbc.co.uk or http://localhost:8181
 * @param {Object} [userConfig]
 * @returns {Immutable.Map}
 */
module.exports = function (target, userConfig) {

    // Merge defaults
    var config = defaults.mergeDeep(Immutable.fromJS(userConfig || {}));

    // Set url obj
    config = config.set("urlObj", url.parse(target));

    // set target (accounting for port/no-port)
    config = config.set("target", config.get("urlObj").protocol + "//" + config.get("urlObj").hostname);

    // set host header
    config = config.set("hostHeader", utils.getProxyHost(config.get("urlObj")));

    // make sure target has port if set
    if (config.get("urlObj").port) {
        config = config.set("target", config.get("target") + ":" + config.get("urlObj").port);
    }

    return config;
};