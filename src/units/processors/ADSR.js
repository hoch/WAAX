/**
 * @class ADSR
 */
WX.ADSR = function(json) {
  WX.Unit.Processor.call(this);
  Object.defineProperties(this, {
    _a: {
      writable: true,
      value: 0.005
    },
    _d: {
      writable: true,
      value: 0.015
    },
    _s: {
      writable: true,
      value: 0.35
    },
    _r: {
      writable: true,
      value: 0.015
    },
    _running: {
      writable: true,
      value: false
    },
    _defaults: {
      value: {
        a: 0.015,
        d: 0.015,
        s: 0.3,
        r: 0.05
      }
    }
  });
  this._inputGain.connect(this._outputGain);
  this._inputGain.gain.value = 0.0;
  this.params = json || this._defaults;
  this.label += "ADSR";
};

WX.ADSR.prototype = Object.create(WX.Unit.Processor.prototype, {
  a: {
    enumerable: true,
    get: function() {
      return this._a;
    },
    set: function(value) {
      this._a = value;
    }
  },
  d: {
    enumerable: true,
    get: function() {
      return this._d;
    },
    set: function(value) {
      this._d = value;
    }
  },
  s: {
    enumerable: true,
    get: function() {
      return this._s;
    },
    set: function(value) {
      this._s = value;
    }
  },
  r: {
    enumerable: true,
    get: function() {
      return this._r;
    },
    set: function(value) {
      this._r = value;
    }
  },
  running: {
    enumerable: true,
    get: function() {
      return this._running;
    }
  },
  noteOn: {
    value: function() {
      var now = WX._context.currentTime,
          g = this._inputGain.gain;
      // cancel previous state
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      // schedule event for attack, decay and sustain
      g.linearRampToValueAtTime(0.0, now);
      g.linearRampToValueAtTime(1.0, now + this._a);
      g.linearRampToValueAtTime(this._s, now + this._a + this._d);
      this._running = true;
    }
  },
  noteOff: {
    value: function(interval) {
      var now = WX._context.currentTime,
          later = now + (interval || 0),
          g = this._inputGain.gain;
      // cancel progress and force it into release phase
      g.cancelScheduledValues(later);
      g.setValueAtTime(g.value, now);
      // start release phase
      g.linearRampToValueAtTime(0.0, later + this._r);
      this._running = false;
    }
  }
});