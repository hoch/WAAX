/**
 * @class LPF
 * @description low pass filter abstraction
 * @param {object} json parameters in JSON notation
 *                      { cutoff: float, Q: float }
 */
WX.LPF = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _lpf: {
      enumerable: false,
      writable: false,
      value: WX._context.createBiquadFilter()
    }
  });
  // performing unit-specific actions
  this._inlet.connect(this._lpf);
  this._lpf.connect(this._outlet);
  this._lpf.type = 0; // low-pass
  // parse param json
  this.params = json;
};

WX.LPF.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set cutoff frequency of filter (AudioParam)
   * @param {float} cutoff frequency of filter
   */
  cutoff: {
    enumerable: true,
    get: function() {
      return this._lpf.frequency.value;
    },
    set: function(value) {
      this._lpf.frequency.value = value;
    }
  },
  
  /**
   * get/set quality factor of filter
   * @param {float} quality quality of filter
   */
  Q: {
    enumerable: true,
    get: function() {
      return this._lpf.Q.value;
    },
    set: function(value) {
      this._lpf.Q.value = value;
    }
  },
  
  /**
   * NOTE: experimental feature for R1
   * TODO: verify if this is working
   */
  modulateWith: {
    value: function(source) {
      source._outlet.connect(this._lpf.frequency);
    }
  },

  /**
   * TODO: get frequency response of filter in Float32Array
   */
  getFrequencuResponse: {
    value: function() {
      return "not implemented yet";
    }
  }
});