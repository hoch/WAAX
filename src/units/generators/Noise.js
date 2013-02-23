/**
 * @class Noise
 */

// TODO: implement pink noise as well...

WX.Noise = function(json) {
  WX.Unit.Generator.call(this);
  Object.defineProperties(this, {
    _source: {
      enumerable: false,
      writable: false,
      value: WX._context.createBufferSource()
    },
    _type: {
      enumerable: false,
      writable: true,
      value: "white"
    },
    _defaults: {
      value: {
        type: "white"
      }
    }
  });
  this._source.connect(this._outputGain);
  this._source.buffer = WX.Template.WhiteNoise;
  this._source.loop = 1;
  this._source.noteOn(0); // or start(0)
  // NOTE: interesting effect, bit crushed
  // this.noise.playbackRate.value = 0.1;
  // assign (default) parameters
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
  this.label += "Noise";
};

WX.Noise.prototype = Object.create(WX.Unit.Generator.prototype, {
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