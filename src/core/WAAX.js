/**
 * waax.js: the core (r8)
 */

/**
 * namespace wx
 */
wx = (function () {
  var _version = "r8";
  var _ctx = new AudioContext();
  var _ignore_ = function () {
    return;
  };
  return Object.create(null, {
    context: {
      enumerable: true,
      get: function () {
        return _ctx;
      },
      set: _ignore_
    },
    sampleRate: {
      enumerable: true,
      get: function () {
        return _ctx.sampleRate;
      },
      set: _ignore_
    },
    now: {
      enumerable: true,
      get: function () {
        return _ctx.currentTime;
      },
      set: _ignore_
    },
    version: {
      enumerable: true,
      get: function () {
        return _version;
      },
      set: _ignore_
    }
  });
})();