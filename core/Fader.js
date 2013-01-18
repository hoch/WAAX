/**
 * @class Fader
 * @description fader abstraction based on gain node
 */
WX.Fader = function() {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _muted: {
      enumerable: false,
      writable: true,
      value: false
    },
    _label: {
      enumerable: false,
      writable: false,
      value: WX._Dictionary.Fader
    }
  });
  // performing unit-specific actions
  this._inlet.connect(this._outlet);
  // assign (default) parameters
  this.params = { gain: 1.0 };
};

WX.Fader.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set mute
   * @param {boolean} mute status
   */
  mute: {
    enumerable: true,
    get: function() {
      return this._muted;
    },
    set: function(status) {
      if (status === true) {
        this._muted = true;
        this._inlet.gain.value = 0.0;
      } else {
        this._muted = false;
        this._inlet.gain.value = 1.0;
      }
    }
  },

  /**
   * get/set loudness in dB of this fader
   * @param {float} db loudness in decibels
   */
  db: {
    enumerable: true,
    get: function() {
      return WX.rms2db(this._outlet.gain.value);
    },
    set: function(value) {
      this._outlet.gain.value = WX.db2rms(value);
    }
  },
  
  /**
   * NOTE: experimental feature for R1
   * TODO: verify if this is working
   */
  modulateWith: {
    value: function(source) {
      source._outlet.connect(this._inlet.gain);
    }
  }
});

/**
 * creating default master output: WX.Out
 */
WX.Out = new WX.Fader();
WX.Out.toNode(WX._context.destination);