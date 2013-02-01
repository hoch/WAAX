/**
 * @class FeedbackDelay
 * @description delay abstraction with feedback, dry/wet routing
 * @param {object} json parameters in JSON notation
 *                      { delaytime: second, feedback: float, mix: wet }
 */
WX.FeedbackDelay = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _delay: {
      enumerable: false,
      writable: false,
      value: WX._context.createDelay()
    },
    _fb: {
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
    _label: {
      enumerable: false,
      writable: false,
      value: WX._Dictionary.FeedbackDelay
    }
  });
  // performing unit-specific actions
  this._inlet.connect(this._delay);
  this._inlet.connect(this._dry);
  this._delay.connect(this._fb);
  this._delay.connect(this._wet);
  this._fb.connect(this._delay);
  this._dry.connect(this._outlet);
  this._wet.connect(this._outlet);
  // assign (default) parameters
  this.params = json;
};

WX.FeedbackDelay.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set delay time
   * @param {float} delayTime delay time in second
   */
  delayTime: {
    enumerable: true,
    get: function() {
      return this._delay.delayTime.value;
    },
    set: function(time) {
      this._delay.delayTime.value = time;
    }
  },

  /**
   * get/set feedback gain amount
   * @param {float} gain feedback amount
   */
  feedback: {
    enumerable: true,
    get: function() {
      return this._fb.gain.value;
    },
    set: function(gain) {
      this._fb.gain.value = gain;
    }
  },

  /**
   * get/set mix between wet/dry (1.0 means 100% wet)
   * @param {float} mix wet mix amount
   */
  mix: {
    enumerable: true,
    get: function() {
      return this._wet.gain.value;
    },
    set: function(value) {
      this._wet.gain.value = value;
      this._dry.gain.value = 1.0 - value;
    }
  },

  /**
   * NOTE: do not use it - not working
   */
  modulateWith: {
    value: function(source) {
      source._outlet.connect(this._delay.delayTime);
    }
  }
});