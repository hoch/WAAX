/**
 * WAAX.js
 * @file WAAX library bootstrap containing WX namespace.
 * @author Hongchan Choi (hongchan@ccrma.stanford.edu)
 */

// ASSERT: checking browser version and compatibility
(function() {
  if (/chrome/.test(navigator.userAgent.toLowerCase()) === false) {
    alert("Sorry. Your browser is not compatible with WAAX. Use Chrome 24+ to use WAAX.");
    throw "[WAAX] Error: Incompatible browser.";
  } else {
    var version = parseInt(window.navigator.appVersion.match(/Chrome\/(.*?) /)[1], 10);
    if (version < 24) {
      alert("Sorry. Chrome 24+ is required to use WAAX.");
      throw "[WAAX] Error: Outdated Chrome.";
    }
  }
})();

/**
 * WAAX(Web Audio API eXtension) name space
 * @namespace WX
 * @version 0
 * @revision 5
 * @note final exploration revision
 */
var WX = WX || Object.create(null, {
  // library version/revision info
  _version: {
    value: {
      number: 0,
      revision: 5
    }
  },
  // audio context
  _context: {
    value: new webkitAudioContext()
  },

  /**
   * returns current time.
   * @memberOf WX
   * @returns {float} current time in audio context
   * @note setter disabled. returns null when called.
   */
  now: {
    get: function() {
      return this._context.currentTime;
    },
    set: function() {
      return;
    }
  },

  /**
   * returns the version of WAAX library
   * @memberOf WX
   * @returns {float} version number of WAAX library
   * @note setter disabled. returns null when called.
   */
  version: {
    get: function() {
      return this._version.revision;
    },
    set: function() {
      return;
    }
  },

  /**
   * returns current audio context
   * @memberOf WX
   * @method
   * @returns {webkitAudioContext} audio context
   */
  getContext: {
    value: function() {
      return this._context;
    }
  },

  // internal object containers: Types, Template, Internal, Unit
  Types: {
    value: Object.freeze({
      // base
      Unit: "Unit.",
      // unit types
      Generator: "Generator.",
      Processor: "Processor.",
      Analyzer: "Analyzer."
    })
  },
  Template: {
    value: Object.create(null),
    writable: true
  },
  Internal: {
    value: Object.create(null),
    writable: true
  },
  Unit: {
    value: Object.create(null),
    writable: true
  }
});

// booting up
console.log("[WAAX] Starting... (r" + WX.version +")");