/**
 * @class Noise
 * @description noise generator based on buffer source sample
 * @param {object} json noise type
 *                      { type: "white/pink/brown" }
 */

// TODO: implement pink noise as well...

WX.Noise = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _node: {
      enumerable: false,
      writable: false,
      value: WX._context.createBufferSource()
    },
    _type: {
      enumerable: false,
      writable: true,
      value: "white"
    },
    _label: {
      enumerable: false,
      writable: false,
      value: WX._Dictionary.Noise
    }
  });
  // performing unit-specific actions
  // delete this._inlet; // this won't work
  this._node.connect(this._outlet);
  this._node.buffer = WX._Templates.whitenoise;
  this._node.loop = 1;
  this._node.noteOn(0); // or start(0)
  // NOTE: interesting effect, bit crushed
  // this.noise.playbackRate.value = 0.1;
  // assign (default) parameters
  this.params = json;
};

WX.Noise.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set oscillator type
   * @param {float} freq frequency of oscillator
   */
  type: {
    enumerable: true,
    get: function() {
      return this._type;
    },
    set: function(value) {
      // TODO: sanity check for type
      this._type = value;
      // TODO: change buffer
    }
  }
});