/**
 * @class ADSR
 * @description abstraction of linear ADSR envelope
 * @param {object} duration for ADSR phase duration in seconds
 *                          { a, d, s, r }
 */
WX.ADSR = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _a: {
      enumerable: false,
      writable: true,
      value: 0.005
    },
    _d: {
      enumerable: false,
      writable: true,
      value: 0.015
    },
    _s: {
      enumerable: false,
      writable: true,
      value: 0.35
    },
    _r: {
      enumerable: false,
      writable: true,
      value: 0.015
    },
    _running: {
      enumerable: false,
      writable: true,
      value: false
    },
    _label: {
      enumerable: false,
      writable: false,
      value: WX._Dictionary.ADSR
    }
  });
  // performing unit-specific actions
  this._inlet.connect(this._outlet);
  this._inlet.gain.value = 0.0;
  // assign (default) parameters
  this.params = json;
};

WX.ADSR.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get: current status of envelope
   */
  running: {
    enumerable: true,
    get: function() {
      return this._running;
    }
  },

  /**
   * get/set: attack time in second
   */
  a: {
    enumerable: true,
    get: function() {
      return this._a;
    },
    set: function(value) {
      this._a = value;
    }
  },

  /**
   * get/set: decay time in second
   */
  d: {
    enumerable: true,
    get: function() {
      return this._d;
    },
    set: function(value) {
      this._d = value;
    }
  },

  /**
   * get/set: sustain level
   */
  s: {
    enumerable: true,
    get: function() {
      return this._s;
    },
    set: function(value) {
      this._s = value;
    }
  },

  /**
   * get/set: release time in second
   */
  r: {
    enumerable: true,
    get: function() {
      return this._r;
    },
    set: function(value) {
      this._r = value;
    }
  },

  /**
   * fire envelope
   */
  noteOn: {
    value: function() {
      var now = WX._context.currentTime;
      // cancel previous state
      this._inlet.gain.cancelScheduledValues(now);
      this._inlet.gain.setValueAtTime(this._inlet.gain.value, now);
      // schedule event for attack, decay and sustain
      this._inlet.gain.linearRampToValueAtTime(0.0, now);
      this._inlet.gain.linearRampToValueAtTime(1.0, now + this._a);
      this._inlet.gain.linearRampToValueAtTime(this._s, now + this._a + this._d);
      this._running = true;
    }
  },

  /**
   * release ADSR envelope from sustain phase
   */
  noteOff: {
    value: function() {
      var now = WX._context.currentTime;
      // cancel progress and force it into release phase
      this._inlet.gain.cancelScheduledValues(now);
      this._inlet.gain.setValueAtTime(this._inlet.gain.value, now);
      // start release phase
      this._inlet.gain.linearRampToValueAtTime(0.0, now + this._r);
      this._running = false;
    }
  }
});