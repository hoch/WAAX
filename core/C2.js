WX._customUnitInternals = {};

/**
 * @class DualLevelDetector
 * @description program-dependent envelope following for custom compressors
 */
WX._customUnitInternals.DualLevelDetector = function() {
  Object.defineProperties(this, {
    _fs: {
      enumerable: false,
      writable: false,
      value: WX._context.sampleRate
    },
    _attackFast: {
      enumerable: false,
      writable: true,
      value: 1.0 - Math.exp(-1.0 / (0.125 * this._fs))
    },
    _releaseFast: {
      enumerable: false,
      writable: true,
      value: 1.0 - Math.exp(-1.0 / (0.5 * this._fs))
    },
    _levelFast: {
      enumerable: false,
      writable: true,
      value: 0
    },
    _attackSlow: {
      enumerable: false,
      writable: true,
      value: 1.0 - Math.exp(-1.0 / (0.25 * this._fs))
    },
    _releaseSlow: {
      enumerable: false,
      writable: true,
      value: 1.0 - Math.exp(-1.0 / this._fs)
    },
    _levelSlow: {
      enumerable: false,
      writable: true,
      value: 0
    }
  });
};

WX._customUnitInternals.DualLevelDetector.prototype = Object.create(null, {

  /**
   * get/set attack
   * @param {float} value attack in seconds
   */
  attack: {
    enumerable: true,
    get: function() {
      return this._attackFast;
    },
    set: function(value) {
      this._attackFast = 1 - Math.exp(-1.0 / (value * this._fs));
    }
  },

  /**
   * get/set release
   * @param {float} value release in seconds
   */
  release: {
    enumerable: true,
    get: function() {
      return this._releaseFast;
    },
    set: function(value) {
      this._releaseFast = 1 - Math.exp(-1.0 / (value * this._fs));
    }
  },

  /**
   * reset
   * @description resetting previous tracked level
   */
  reset: {
    enumerable: false,
    value: function() {
      this._levelFast = 0.0;
      this._levelSlow = 0.0;
    }
  },

  /**
   * process and return tracked level
   * @type {float} input value
   * @return {float} output value
   */
  processLevel: {
      value: function(input) {
        // slow detector first
        var s = Math.abs(input);
        if (s > this._levelSlow) {
          this._levelSlow += this._attackSlow * (s - this._levelSlow);
        } else {
          this._levelSlow += this._releaseSlow * (s - this._levelSlow);
        }
        // fast detector
        if (s > this._levelFast) {
          this._levelFast += this._attackFast * (s - this._levelFast);
        } else {
          this._levelFast += this._releaseFast * (this._levelSlow - this._levelFast);
        }
        // write level_fast
        return this._levelFast;
      }
    }
});


/**
 * @class C2 (module)
 * @description compressor with scriptProcessorNode + sidechain
 * @param {object} json parameters in JSON notation
 *                      { threshold, ratio, knee, attack, release }
 */
WX.C2 = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _threshold: {
      enumerable: false,
      writable: true,
      value: -12.0
    },
    _ratio: {
      enumerable: false,
      writable: true,
      value: 4.0
    },
    _makeup: {
      enumerable: false,
      writable: true,
      value: 0.0
    },
    _detector: {
      enumerable: false,
      writable: false,
      value: new WX._customUnitInternals.DualLevelDetector()
    },
    _processor: {
      enumerable: false,
      writable: false,
      value: WX._context.createScriptProcessorNode(
          WX._customUnitBufferSize, 2, 2
        )
    },
    _callback: {
      value: function(event) {
        // temp vars
        var level, gaindB, gain;
        // input and output array buffer
        var inputL = event.inputBuffer.getChannelData(0);
        var inputR = event.inputBuffer.getChannelData(1);
        var outputL = event.outputBuffer.getChannelData(0);
        var outputR = event.outputBuffer.getChannelData(1);
        // callback loop
        for (var i = 0, b = WX._customUnitBufferSize; i < b; ++i) {
          // peak detection
          level = this._detector.process(Math.max(Math.abs(inputL[i]), Math.abs(inputR[i])));
          // gain computer: limiting
          gaindB = Math.min(0.0, WX.lin2db(this._threshold / level));
          // get linear gain
          gain = WX.db2lin(gainDB);
          // compute output
          outputL[i] = inputL[i] * gain * this._makeup;
          outputR[i] = inputR[i] * gain * this._makeup;
        }
      }
    }
  });
  var me = this;
  this._processor.onaudioprocess = function(event) {
    me._callback(event);
  };
  // performing unit-specific actions
  this._inlet.connect(this._processor);
  this._processor.connect(this._outlet);
  // assign (default) parameters
  this.params = json;
};


WX.C2.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set threshold
   * @param {float} value threshold: default -24, nominal range of -100 to 0.
   */
  threshold: {
    enumerable: true,
    get: function() {
      return this._threshold;
    },
    set: function(value) {
      this._threshold = value;
    }
  },

  /**
   * get/set ratio
   * @param {float} value arbitrary ratio
   */
  ratio: {
    enumerable: true,
    get: function() {
      return this._ratio;
    },
    set: function(value) {
      this._ratio = value;
    }
  },

  /**
   * get/set attack
   * @param {float} value attack in seconds
   */
  attack: {
    enumerable: true,
    get: function() {
      return this._detector.attack;
    },
    set: function(value) {
      this._detector.attack = value;
    }
  },

  /**
   * get/set release
   * @param {float} value release in seconds
   */
  release: {
    enumerable: true,
    get: function() {
      return this._detector.release;
    },
    set: function(value) {
      this._detector.release = value;
    }
  }
});