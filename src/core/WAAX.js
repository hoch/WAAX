/**
 * WAAX.js
 * @file WAAX library primer, the name space
 * @author hoch (Hongchan Choi)
 * @version R8
 */


// namespace WX 
WX = (function () {
  var _version = "r8";
  var _ctx = new AudioContext();
  var _ignore_ = function () {
    return;
  };

  return Object.create(null, {

    /**
     * returns web audio API context object.
     * @type {AudioContext}
     * @readonly
     */
    context: {
      enumerable: true,
      get: function () {
        return _ctx;
      },
      set: _ignore_
    },

    /**
     * returns sample rate of the context.
     * @type {int}
     * @readonly
     */
    sampleRate: {
      enumerable: true,
      get: function () {
        return _ctx.sampleRate;
      },
      set: _ignore_
    },

    /**
     * returns the current time in the context.
     * @type {float}
     * @readonly
     */
    now: {
      enumerable: true,
      get: function () {
        return _ctx.currentTime;
      },
      set: _ignore_
    },

    /**
     * returns the version of library.
     * @type {int}
     * @readonly
     */
    version: {
      enumerable: true,
      get: function () {
        return _version;
      },
      set: _ignore_
    }
  });
})();