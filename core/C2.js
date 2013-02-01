/**
 * @class C2
 * @description custom unit compressor with program-dependent action
 * @param {object} json parameters in JSON notation
 *                      { threshold, ratio, attack, release }
 */
WX.C2 = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _threshold: {
      enumerable: false,
      writable: true,
      value: WX.db2lin(-12.0)
    },
    _ratio: {
      enumerable: false,
      writable: true,
      value: 4.0
    },
    _iratio: {
      enumerable: false,
      writable: true,
      value: 1.0 / (this._ratio - 1.0)
    },
    _makeup: {
      enumerable: false,
      writable: true,
      value: WX.db2lin(0.0)
    },
    _detector: {
      enumerable: false,
      writable: false,
      value: new WX._Internals.DualLevelDetector()
    },
    _processor: {
      enumerable: false,
      writable: false,
      value: WX._context.createScriptProcessor(
          WX._customUnitBufferSize, 2, 2
        )
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
   * callback for onaudioprocess
   * @param {object} event
   */
  _callback: {
    value: function(event) {
      // temp vars
      var level, leveldB, gain, gaindB, delta;
      // input and output array buffer
      var inputL = event.inputBuffer.getChannelData(0);
      var inputR = event.inputBuffer.getChannelData(1);
      var outputL = event.outputBuffer.getChannelData(0);
      var outputR = event.outputBuffer.getChannelData(1);
      // callback loop
      for (var i = 0, b = WX._customUnitBufferSize; i < b; ++i) {
        // get abs-max from stereo
        var s = Math.max(Math.abs(inputL[i]), Math.abs(inputR[i]));
        // peak detection
        level = this._detector.process(s);
        // gain computer: compression with ratio
        delta = WX.lin2db(level / this._threshold);
        gaindB = (delta <= 0.0) ? 0.0 : delta * this._iratio;
        // gain computer: limiting
        // gaindB = Math.min(0.0, WX.lin2db(this._threshold / level));
        // get linear gain
        gain = WX.db2lin(gaindB);
        // compute output
        outputL[i] = inputL[i] * gain * this._makeup;
        outputR[i] = inputR[i] * gain * this._makeup;
      }
    }
  },

  /**
   * get/set threshold
   * @param {float} dB for user, linear for internal processing
   */
  threshold: {
    enumerable: true,
    get: function() {
      return WX.lin2db(this._threshold);
    },
    set: function(value) {
      this._threshold = WX.db2lin(value);
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
      this._iratio = 1.0 / (this._ratio - 1.0);
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
  },

  /**
   * get/set makeup
   * @param {float} makeup gain in decibel
   */
  makeup: {
    enumerable: true,
    get: function() {
      return WX.lin2db(this._makeup);
    },
    set: function(value) {
      this._makeup = WX.db2lin(value);
    }
  }
});