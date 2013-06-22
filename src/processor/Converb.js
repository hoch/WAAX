/**
 * WX.Converb
 */
WX._unit.converb = function (options) {
  // pre-building: processor wrapper
  WX._unit.processor.call(this);
  // building phase
  this._convolver = WX.context.createConvolver();
  this._dry = WX.context.createGain();
  this._wet = WX.context.createGain();
  this._inputGain.connect(this._convolver);
  this._inputGain.connect(this._dry);
  this._convolver.connect(this._wet);
  this._dry.connect(this._outputGain);
  this._wet.connect(this._outputGain);
  this._ready = false;
  this._url = null;
  // callback in constructor
  var me = this;
  this._oncomplete = function(obj) {
    me._url = obj.url;
    me._convolver.buffer = obj.buffer;
    me._ready = obj.status;
  };
  // post-building: parameter binding and initialization
  WX._unit.bindAudioParam.call(this, "dry", this._dry.gain);
  WX._unit.bindAudioParam.call(this, "wet", this._wet.gain);
  // initializing (final phase)
  this._initializeParams(options, this._default);
};

WX._unit.converb.prototype = {
  // this label will be appended automatically
  label: "converb",
  _default: {
    source: "../data/ir/hall.wav",
    mix: 0.1
  },
  // type
  source: function (url) {
    if (url) {
      WX._loadBuffer(url, this._oncomplete);
    } else {
      return this._url;
    }
  },
  mix: function (mix, moment, type) {
    if (mix !== undefined) {
      this.dry(1.0 - mix, moment, type);
      return this.wet(mix, moment, type);
    } else {
      return this.wet();
    }
  }
};

WX._unit.extend(WX._unit.converb.prototype, WX._unit.processor.prototype);