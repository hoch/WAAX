/**
 * @class LFO
 */

// TODO: how to make the output as "unipolar"?

WX.LFO = function(json) {
  WX.Unit.Generator.call(this);
  this.label += "LFO";
  Object.defineProperties(this, {
    _lfo: {
      enumerable: false,
      writable: false,
      value: WX._context.createOscillator()
    },
    _defaults: {
      value: {
        rate: 5.0,
        shape: "sine",
        depth: 1.0
      }
    }
  });
  this._lfo.connect(this._outputGain);
  this._lfo.noteOn(0);
  // assign (default) parameters
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
};

WX.LFO.prototype = Object.create(WX.Unit.Generator.prototype, {
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
  depth: {
    enumerable: true,
    get: function() {
      return this._outputGain.gain.value;
    },
    set: function(value) {
      this._outputGain.gain.value = value;
    }
  },
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