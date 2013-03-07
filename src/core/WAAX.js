/**
 * WAAX: Web Audio API eXtension
 * @author hoch
 *         hongchan@ccrma.stanford.edu
 *         hongchan@google.com
 */

/**
 * checking browser compatibility
 */
if(window.navigator.appVersion.match(/Chrome\/(.*?) /)[1] === null) {
  alert("Your browser is not compatible with WAAX. Use Chrome 24+ to use WAAX.");
} else {
  var version = parseInt(window.navigator.appVersion.match(/Chrome\/(.*?) /)[1], 10);
  if (version < 24) {
    alert("Chrome 24+ is required to use WAAX.");
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
console.log("WAAX (r" + WX._revision + ")");