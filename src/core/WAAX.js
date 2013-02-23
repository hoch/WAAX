/**
 * WAAX: Web Audio API eXtension
 * @author hoch
 *         hongchan@ccrma.stanford.edu
 *         hongchan@google.com
 */

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