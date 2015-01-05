var url = require("url");
var path = require("path");
var cookie = require("cookie");
var excludeList = require("./exclude");

/**
 * Remove Headers from a response, this allow
 * @param {Object} headers
 * @param {Array} items
 */
function removeHeaders(headers, items) {
    items.forEach(function (item) {
        if (headers.hasOwnProperty(item)) {
            delete headers[item];
        }
    });
}

/**
 * Get the proxy host with optional port
 */
function getProxyHost(opts) {
    if (opts.port && opts.port !== 80) {
        return opts.hostname + ":" + opts.port;
    }
    return opts.hostname;
}

/**
 * Remove the domain from any cookies.
 * @param rawCookie
 * @returns {string}
 */
function rewriteCookies(rawCookie) {

    var parsed = cookie.parse(rawCookie);

    var pairs =
            Object.keys(parsed)
                .filter(function (item) {
                    return item !== "domain";
                })
                .map(function (key) {
                    return key + "=" + parsed[key];
                });

    if (rawCookie.match(/httponly/i)) {
        pairs.push("HttpOnly");
    }

    return pairs.join("; ");
}

/**
 * @param userServer
 * @param proxyUrl
 * @returns {{match: RegExp, fn: Function}}
 */
function rewriteLinks(userServer, proxyUrl) {

    var host   = userServer.hostname;
    var string = host;
    var port = userServer.port;

    if (host && port) {
        if (parseInt(port, 10) !== 80) {
            string = host + ":" + port;
        }
    }

    return {
        match: new RegExp("(https?://|/)?" + string + "(.*?)(?=[ ,'\"\\s])", "g"),
        fn:    function (match) {
            var pre = "//";
            var out = url.parse(match);
            if (!out.host) {
                string = string.replace(/^(\/)/, "");
                return match.replace(string, proxyUrl);
            }

            return [
                pre,
                proxyUrl,
                out.path || "",
                out.hash || ""
            ].join("");
        }
    };
}

/**
 * @param {Object} req
 * @returns {Object}
 */
function handleIe(req) {

    var ua = req.headers["user-agent"];
    var match = /MSIE (\d)\.\d/.exec(ua);

    if (match) {

        if (parseInt(match[1], 10) < 9) {

            var parsed = url.parse(req.url);
            var ext = path.extname(parsed.pathname);
            var excluded = excludeList.some(function (item) {
                return item === ext;
            });

            if (!excluded) {
                req.headers["accept"] = "text/html";
            }
        }
    }
    return req;
}

/**
 * @param config
 * @param host
 * @returns {*[]}
 */
function getRules(config, host) {
    var rules = [rewriteLinks(config.get("urlObj"), host)];
    if (config.has("rules")) {
        var conf = config.get("rules").toJS();
        if (!Array.isArray(conf)) {
            conf = [conf];
        }
        conf.forEach(function (item) {
            rules.push(item);
        });
    }
    return rules;
}

/**
 * Remove 'domain' from any cookies
 * @param {Object} res
 * @param {Immutable.Map} config
 */
function checkCookies(res, config) {
    if (typeof(res.headers["set-cookie"]) !== "undefined") {
        if (config.get("cookies").get("stripDomain")) {
            res.headers["set-cookie"] = res.headers["set-cookie"].map(function (item) {
                return rewriteCookies(item);
            });
        }
    }
}

/**
 * Perform any required transformations on the `res` object before it gets back to
 * the browser
 * @param config
 */
function proxyRes(config) {

    return function (res) {
        checkCookies(res, config);
        removeHeaders(res.headers, ["content-length", "content-encoding"]);
    };
}

module.exports = {
    rewriteLinks:   rewriteLinks,
    rewriteCookies: rewriteCookies,
    getProxyHost:   getProxyHost,
    removeHeaders:  removeHeaders,
    handleIe:       handleIe,
    getRules:       getRules,
    proxyRes:       proxyRes
};
