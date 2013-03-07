/**
 * WAAX: Web Audio API eXtension
 * @author Hongchan Choi (hoch)
 *         hongchan@ccrma.stanford.edu
 */

/**
 * checking browser version and compatibility
 */
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

/**
 * @namespace WX
 * @revision 3
 */
var WX = WX || Object.create(null, {
  _revision: {
    value: 3
  },
  _context: {
    value: new webkitAudioContext()
  },
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

/**
 * booting up
 */
console.log("[WAAX] Starting... (" + WX._revision + ")");