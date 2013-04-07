/**
 * @class TwinDelay
 * @description stereo delay with feedback, crosstalk feature, mix/wet
 */

// TODO: some filtering (hi/lo-cutting)
// TODO: delay time beat matching (BPM)

WX.TwinDelay = function(json) {
  WX.Unit.Processor.call(this);
  this.label += "TwinDelay";
  Object.defineProperties(this, {
    _delayL: {
      enumerable: false,
      writable: false,
      value: WX._context.createDelay()
    },
    _delayR: {
      enumerable: false,
      writable: false,
      value: WX._context.createDelay()
    },
    _merger: {
      enumerable: false,
      writable: false,
      value: WX._context.createChannelMerger(2)
    },
    _fbL: {
      enumerable: false,
      writable: false,
      value: WX._context.createGain()
    },
    _fbR: {
      enumerable: false,
      writable: false,
      value: WX._context.createGain()
    },
    _crosstalkL: {
      enumerable: false,
      writable: false,
      value: WX._context.createGain()
    },
    _crosstalkR: {
      enumerable: false,
      writable: false,
      value: WX._context.createGain()
    },
    _dry: {
      enumerable: false,
      writable: false,
      value: WX._context.createGain()
    },
    _wet: {
      enumerable: false,
      writable: false,
      value: WX._context.createGain()
    },
    _defaults: {
      value: {
        delayTimeLeft: 0.125,
        delayTimeRight: 0.250,
        feedbackLeft: 0.25,
        feedbackRight: 0.25,
        crosstalk: 0.1,
        mix: 0.5
      }
    }
  });
  // source distribution
  this._inputGain.connect(this._delayL);
  this._inputGain.connect(this._delayR);
  this._inputGain.connect(this._dry);
  // interconnection: delay, fb, crosstalk
  this._delayL.connect(this._fbL);
  this._delayR.connect(this._fbR);
  this._fbL.connect(this._delayL);
  this._fbR.connect(this._delayR);
  this._fbL.connect(this._crosstalkR);
  this._fbR.connect(this._crosstalkL);
  this._crosstalkR.connect(this._delayR);
  this._crosstalkL.connect(this._delayL);
  // summing
  this._delayL.connect(this._merger, 0, 0);
  this._delayR.connect(this._merger, 0, 1);
  this._merger.connect(this._wet);
  this._dry.connect(this._outputGain);
  this._wet.connect(this._outputGain);
  // stuffs
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
};

WX.TwinDelay.prototype = Object.create(WX.Unit.Processor.prototype, {
  delayTimeLeft: {
    enumerable: true,
    get: function() {
      return this._delayL.delayTime.value;
    },
    set: function(time) {
      this._delayL.delayTime.value = time;
    }
  },
  delayTimeRight: {
    enumerable: true,
    get: function() {
      return this._delayR.delayTime.value;
    },
    set: function(time) {
      this._delayR.delayTime.value = time;
    }
  },
  feedbackLeft: {
    enumerable: true,
    get: function() {
      return this._fbL.gain.value;
    },
    set: function(gain) {
      this._fbL.gain.value = gain;
    }
  },
  feedbackRight: {
    enumerable: true,
    get: function() {
      return this._fbR.gain.value;
    },
    set: function(gain) {
      this._fbR.gain.value = gain;
    }
  },
  crosstalk: {
    enumerable: true,
    get: function() {
      return this._crosstalkL.gain.value;
    },
    set: function(gain) {
      this._crosstalkL.gain.value = gain;
      this._crosstalkR.gain.value = gain;
    }
  },
  mix: {
    enumerable: true,
    get: function() {
      return this._wet.gain.value;
    },
    set: function(value) {
      this._wet.gain.value = value;
      this._dry.gain.value = 1.0 - value;
    }
  }
});