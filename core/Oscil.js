/**
 * @class Oscil
 * @description fader abstraction based on gain node
 * @param {object} json parameters in JSON notation
 */
WX.Oscil = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _oscil: {
      enumerable: false,
      writable: false,
      value: WX._context.createOscillator()
    },
    _label: {
      enumerable: false,
      writable: false,
      value: WX._Dictionary.Oscil
    }
  });
  // performing unit-specific actions
  this._inlet.connect(this._oscil.frequency); // to enable FM
  this._oscil.connect(this._outlet);
  // NOTE: stop() will disable this node permanently
  // noteOn() is deprecated but it's still there in Safari and Chrome stable
  // this.oscil.start(0);
  this._oscil.noteOn(0);
  // assign (default) parameters
  this.params = json || { frequency: 440, type: 'sine', gain: 1.0 };
};

WX.Oscil.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set frequency of oscillator
   * @param {float} value frequency of oscillator
   */
  frequency: {
    enumerable: true,
    get: function() {
      return this._oscil.frequency.value;
    },
    set: function(value) {
      this._oscil.frequency.value = value;
    }
  },

  /**
   * get/set oscillator type
   * @param {float} value type of waveform
   */
  type: {
    enumerable: true,
    get: function() {
      return this._oscil.type;
    },
    set: function(value) {
      // TODO: sanity check for type
      this._oscil.type = value;
    }
  }
});