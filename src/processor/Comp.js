/**
 * WX.Comp
 */
WX._unit.comp = function (options) {
  // pre-building
  WX._unit.processor.call(this);
  // building  
  this._comp = WX.context.createDynamicsCompressor();
  this._inputGain.connect(this._comp);
  this._comp.connect(this._outputGain);
  // bind parameter
  WX._unit.bindAudioParam.call(this, "inputGain", this._inputGain.gain);
  WX._unit.bindAudioParam.call(this, "threshold", this._comp.threshold);
  WX._unit.bindAudioParam.call(this, "knee", this._comp.knee);
  WX._unit.bindAudioParam.call(this, "ratio", this._comp.ratio);
  WX._unit.bindAudioParam.call(this, "attack", this._comp.attack);
  WX._unit.bindAudioParam.call(this, "release", this._comp.release);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.comp.prototype = {
  // label
  label: "comp",
  // default
  _default: {
    threshold: -24,
    knee: 0.0,
    ratio: 4.0,
    attack: 0.003,
    release: 0.250,
    gain: 1.0
  },
  makeup: function(value, moment, type) {
    var a = WX.db2lin(value);
    this.gain(a, moment, type);
  }
};

WX._unit.extend(WX._unit.comp.prototype, WX._unit.processor.prototype);