/**
 * WAAX bootstrap
 * @version 1
 * @author hoch (hongchan@ccrma.stanford.edu)
 */


/**
 * @namespace WX
 * @revision 1
 */
var WX = WX || { REVISION:1 };

/**
 * starting message
 */
console.log("Starting WAAX...(REVISION " + WX.REVISION + ")");


/**
 * declare internal template space
 */
WX._Templates = {};

/**
 * declare internal label dictionary
 */
WX._Dictionary = Object.freeze({
  // units
  Fader: "Fader.unit",
  Oscil: "Oscil.unit",
  Noise: "Noise.unit",
  LFO: "LFO.unit",
  Sampler: "Sampler.unit",
  LPF: "LPF.unit",
  ADSR: "ADSR.unit",
  Compressor: "Compressor.unit",
  FeedbackDelay: "FeedbackDelay.unit",
  ConVerb: "ConVerb.unit"
  // modules
});

/**
 * singleton audio context
 * @type {webkitAudioContext}
 */
WX._context = new webkitAudioContext();

/**
 * @class _Unit
 * @description internal base object for all WAAX Unit Generator
 */
WX._Unit = function() {
  // creating default nodes for all units
  Object.defineProperties(this, {
    _inlet: {
      value: WX._context.createGainNode(),
      enumerable: false,
      writable: false
    },
    _outlet: {
      value: WX._context.createGainNode(),
      enumerable: false,
      writable: false
    }
  });
};

WX._Unit.prototype = Object.create(null, {

  /**
   * connection to other unit
   * @param  {unit} unit destination unit
   * @return {unit} reference to destination for method chaining
   */
  to: {
    enumerable: false,
    value: function(unit) {
      this._outlet.connect(unit._inlet);
      return unit;
    }
  },

  /**
   * cutting connection from its destination
   */
  cut: {
    enumerable: false,
    value: function() {
      this._outlet.disconnect();
    }
  },

  /**
   * connection to Web Audio API node
   * @param {AudioNode} node Web Audio API node
   */
  toNode: {
    enumerable: false,
    value: function(node) {
      this._outlet.connect(node);
    }
  },

  /**
   * get/set unit output gain
   * @param {float} float output gain
   */
  gain: {
    enumerable: true,
    get: function() {
      return this._outlet.gain.value;
    },
    set: function(value) {
      this._outlet.gain.value = value;
    }
  },

  /**
   * get/set unit parameters
   * @param {object} unit parameters in json notation
   */
  params: {
    enumerable: false,
    // returns enumerable setter/getter (params)
    get: function() {
      var tmp = Object.create(null);
      for(var p in this) {
        tmp[p] = this[p];
      }
      return tmp;
    },
    set: function(json) {
      // sanity check
      if (typeof json !== "object") {
        WX.error(this, "invalid JSON.");
        return;
      }
      // iterate json
      for(var p in json) {
        // if json has right keys for this object
        if (this[p] !== undefined) {
          // assign parameter
          this[p] = json[p];
        } else {
          // otherwise do nothing and iterate next parameter
          WX.error(this, p + " is not available.");
        }
      }
    }
  },

  /**
   * get unit label
   */
  label: {
    enumerable: false,
    get: function() {
      return this._label;
    }
  }
});


/**
 * creating templates for noise generation
 */
(function() {
  var sr = WX._context.sampleRate,
      l = sr * 5,
      wn = new Float32Array(l);
  WX._Templates.whitenoise = WX._context.createBuffer(1, l, sr);
  for(var i = 0; i < l; ++i) {
    wn[i] = Math.random() * 2.0 - 1;
  }
  WX._Templates.whitenoise.getChannelData(0).set(wn, 0);
})();