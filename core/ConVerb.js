/**
 * @class ConVerb
 * @description convolution reverberation with convolve node
 * @param {object} json parameters in JSON notation
 *                      { source: url, mix: wet }
 */
WX.ConVerb = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
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
      value: "core/ir/1644-ambiencehall.wav"
    },
    _label: {
      enumerable: false,
      writable: false,
      value: WX._Dictionary.ConVerb
    }
  });
  // performing unit-specific actions
  this._inlet.connect(this._convolver);
  this._convolver.connect(this._wet);
  this._inlet.connect(this._dry);
  this._dry.connect(this._outlet);
  this._wet.connect(this._outlet);
  // assign (default) parameters
  this.params = json;
};

WX.ConVerb.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set source location URL of IR sample
   * @param {string} url location of IR sample
   */
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

  /**
   * get/set mix between wet/dry (1.0 means 100% wet)
   * @param {float} mix wet mix amount
   */
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