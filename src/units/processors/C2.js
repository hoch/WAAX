/**
 * @class C2
 * @description custom unit compressor with program-dependent action
 */

// TODO: gain-reduction from compression
// TODO: auto-makeup
// TODO: convert all parameters into k-param

WX.C2 = function(json) {
  WX.Unit.Processor.call(this);
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
      value: new WX.Internal.DualLevelDetector()
    },
    _processor: {
      enumerable: false,
      writable: false,
      value: WX._context.createScriptProcessor(256, 2, 2)
    },
    _defaults: {
      value: {
        threshold: -12,
        ratio: 4,
        attack: 0.01,
        release: 0.25,
        makeup: 8
      }
    }
  });
  // attaching callback function for onaudioprocess event
  var me = this;
  this._processor.onaudioprocess = function(event) {
    me._callback(event);
  };
  // performing unit-specific actions
  this._inputGain.connect(this._processor);
  this._processor.connect(this._outputGain);
  // assign (default) parameters
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
  this.label += "C2";
};

WX.C2.prototype = Object.create(WX.Unit.Processor.prototype, {
  // custom callback
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
      for (var i = 0; i < 256; ++i) {
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
  threshold: {
    enumerable: true,
    get: function() {
      return WX.lin2db(this._threshold);
    },
    set: function(value) {
      this._threshold = WX.db2lin(value);
    }
  },
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
  attack: {
    enumerable: true,
    get: function() {
      return this._detector.attack;
    },
    set: function(value) {
      this._detector.attack = value;
    }
  },
  release: {
    enumerable: true,
    get: function() {
      return this._detector.release;
    },
    set: function(value) {
      this._detector.release = value;
    }
  },
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