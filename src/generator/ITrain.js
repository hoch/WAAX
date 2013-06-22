/**
 * WX.itrain
 * note: it is using buffersouce, but it can be replaced with the new wavetable node
 */
WX._unit.itrain = function (options) {
  // pre-building: initiate generator wrapper
  WX._unit.generator.call(this);
  // building: phase
  this._impulse = WX.context.createBufferSource();
  this._impulse.connect(this._outputGain);
  this._impulse.buffer = WX._builtin.impulse;
  this._impulse.loop = 1;
  this._impulse.loopEnd = 1.0;
  this._frequency = 1; // 1Hz
  this._impulse.start(0);
  // post-building: handling initial parameter
  this._initializeParams(options, this._default);
};

WX._unit.itrain.prototype = {
  label: "itrain",
  _default: {
    gain: 1.0
  },
  freq: function (frequency) {
    if (frequency) {
      this._frequency = (frequency < 0.1) ? 0.1 : frequency;
      this._impulse.loopEnd = 1.0 / this._frequency;
      return this;
    } else {
      return this._frequency;
    }
  },
  stop: function (moment) {
    this._impulse.stop(moment || WX.now);
  }
};

WX._unit.extend(WX._unit.itrain.prototype, WX._unit.generator.prototype);