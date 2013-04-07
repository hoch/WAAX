/**
 * @class Fader
 */
WX.Fader = function(json) {
  WX.Unit.Processor.call(this);
  this.label += "Fader";
  Object.defineProperties(this, {
    _muted: {
      enumerable: false,
      writable: true,
      value: false
    },
    _defaults: {
      value: {
        db: 0.0
      }
    }
  });
  this._inputGain.connect(this._outputGain);
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
};

WX.Fader.prototype = Object.create(WX.Unit.Processor.prototype, {
  mute: {
    enumerable: true,
    get: function() {
      return this._muted;
    },
    set: function(status) {
      if (status === true) {
        this._muted = true;
        this._inputGain.gain.value = 0.0;
      } else {
        this._muted = false;
        this._inputGain.gain.value = 1.0;
      }
    }
  },
  db: {
    enumerable: true,
    get: function() {
      return WX.lin2db(this._outputGain.gain.value);
    },
    set: function(value) {
      this._outputGain.gain.value = WX.db2lin(value);
    }
  }
});

/**
 * creating default master output: WX.DAC
 */
WX.DAC = new WX.Fader();
WX.DAC.connect(WX._context.destination);