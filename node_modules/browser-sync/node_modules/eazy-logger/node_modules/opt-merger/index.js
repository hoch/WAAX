"use strict";

var _    = require("lodash");
var args = require("minimist")(process.argv.slice(2));

module.exports.getArgs = function () {
    return args;
};

module.exports.merge = function merge(defaults, config, simple, callbacks) {

    simple = simple || false;

    var toMerge;
    var commandLineArgs = exports.getArgs();

    if (Object.keys(config).length || simple) {
        toMerge = config;
    } else {
        toMerge = commandLineArgs;
    }

    var simpleMerged = _.merge(_.cloneDeep(defaults), toMerge, function (a, b) {
        return _.isArray(a) ? _.union(a, b) : undefined;
    });

    if (callbacks && Object.keys(callbacks).length) {

        return exports.mergeOptions(simpleMerged, config, callbacks);

    } else {

        return simple
            ? simpleMerged
            : _.merge(simpleMerged, commandLineArgs);

    }
};

/**
 * @returns {Object}
 */
module.exports.mergeOptions = function (defaults, config, callbacks) {

    var args = exports.getArgs();

    Object.keys(callbacks).forEach(function (item) {

        // item == "files" etc
        var newValue;

        if (args && typeof args[item] !== "undefined") {
            newValue = args[item];
        } else {
            newValue = config[item];
        }

        if (callbacks[item] && typeof defaults[item] !== "undefined") {
            // there's a callback, a default ARG & a newValue
            defaults[item] = callbacks[item](defaults[item], newValue, args, config);
        }
    });

    return defaults;
};