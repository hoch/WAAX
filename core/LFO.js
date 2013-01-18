/**
 * @class LFO
 * @description LFO abstraction
 * @param {object} json parameters in JSON notation
 *                      { rate, depth, shape }
 *                      shape = ["triangle", "sine", "saw", "square"]
 */

// TODO: how do we generalize modulation process?
// TODO: how to make the output as "unipolar"?

WX.LFO = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _lfo: {
      enumerable: false,
      writable: false,
      value: WX._context.createOscillator()
    },
    _label: {
      enumerable: false,
      writable: false,
      value: WX._Dictionary.LFO
    }
  });
  // performing unit-specific actions
  this._lfo.connect(this._outlet);
  this._lfo.frequency.value = 5.0;
  this._lfo.noteOn(0);
  // assign (default) parameters
  this.params = json;
};

WX.LFO.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set LFO rate (frequency)
   * @param {float} value rate of LFO (0.01~25)
   */
  rate: {
    enumerable: true,
    get: function() {
      return this._lfo.frequency.value;
    },
    set: function(value) {
      value = Math.max(0.0, Math.min(20.0, value));
      this._lfo.frequency.value = value;
    }
  },

  /**
   * get/set lfo intensity (equivalent to gain)
   * @param {float} value gain of lfo
   */
  depth: {
    enumerable: true,
    get: function() {
      return this._outlet.gain.value;
    },
    set: function(value) {
      this._outlet.gain.value = value;
    }
  },

  /**
   * get/set lfo waveform shape
   * @param {float} value frequency of oscillator
   */
  shape: {
    enumerable: true,
    get: function() {
      return this._lfo.type;
    },
    set: function(value) {
      // TODO: sanity check for type
      this._lfo.type = value;
    }
  }
});