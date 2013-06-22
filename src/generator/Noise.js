/**
 * WX.noise
 */
WX._unit.noise = function (options) {
  // initiate generator wrapper : pre-build
  WX._unit.generator.call(this);
  // build unit
  this._noise = WX.context.createBufferSource();
  this._noise.connect(this._outputGain);
  this._noise.buffer = WX._builtin.whitenoise;
  this._noise.loop = 1;
  this._noise.loopStart = Math.random() * this._noise.buffer.duration;
  this._noise.start(0);
  WX._unit.bindAudioParam.call(this, "rate", this._noise.playbackRate);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.noise.prototype = {
  label: "noise",
  _default: {
    type: "white",
    gain: 1.0
  },
  type: function (noisetype) {
    // TODO: pink/brown noise
  },
  stop: function (moment) {
    this._noise.stop(moment);
  }
};
WX._unit.extend(WX._unit.noise.prototype, WX._unit.generator.prototype);