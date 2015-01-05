var respMod = require("resp-modifier");
var utils   = require("./utils");

/**
 * HTTP proxy server with resp modding
 * @param proxyServer
 * @param config
 * @returns {Function}
 */
module.exports = function (proxyServer, config) {

    return function (req, res) {

        /**
         * Create middleware on the fly to match the host
         */
        var middleware = respMod({
            rules:       utils.getRules(config, req.headers.host),
            ignorePaths: config.get("ignorePaths")
        });

        var next = function () {
            proxyServer.web(req, res, {
                target:      config.get("target"),
                hostRewrite: req.headers.host,
                headers:     {
                    "host":            config.get("hostHeader"),
                    "accept-encoding": "identity",
                    "agent":           false
                }
            });
        };

        if (config.has("middleware")) {
            config.get("middleware")(req, res, function (skip) {
                if (skip) {
                    return;
                }
                utils.handleIe(req);
                middleware(req, res, next);
            });
        } else {
            utils.handleIe(req);
            middleware(req, res, next);
        }
    };
};