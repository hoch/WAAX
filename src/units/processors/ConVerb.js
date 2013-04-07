/**
 * @class ConVerb
 * @description convolution reverberation with convolve node
 */
WX.ConVerb = function(json) {
  WX.Unit.Processor.call(this);
  this.label += "ConVerb";
  Object.defineProperties(this, {
    _convolver: {
      enumerable: false,
      writable: false,
      value: WX._context.createConvolver()
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
    _url: {
      enumerable: false,
      writable: true,
      value: "../data/ir/hall.wav"
    },
    _defaults: {
      value: {
        source: "../data/ir/hall.wav",
        mix: 0.25
      }
    }
  });
  this._inputGain.connect(this._convolver);
  this._inputGain.connect(this._dry);
  this._convolver.connect(this._wet);
  this._dry.connect(this._outputGain);
  this._wet.connect(this._outputGain);
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
};

WX.ConVerb.prototype = Object.create(WX.Unit.Processor.prototype, {
  source: {
    enumerable: true,
    get: function() {
      return this._url;
    },
    set: function(url) {
      if (url === undefined) {
        WX.error(this, "invalid IR file path.");
        return false;
      }
      var me = this;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = function() {
        try {
          me._convolver.buffer = WX._context.createBuffer(xhr.response, true);
        } catch(error) {
          WX.error(me, "file loading error: " + url + " (" + error.message + ")");
        }
      };
      xhr.send();
      this._url = url;
      return true;
    }
  },
  mix: {
    enumerable: true,
    get: function() {
      return this._wet.gain.value;
    },
    set: function(gain) {
      this._wet.gain.value = gain;
      this._dry.gain.value = 1.0 - gain;
    }
  }
});