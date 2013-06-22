/**
 * WX.Step
 * note: it is using buffersouce, but it can be replaced with the new wavetable node
 */
WX._unit.step = function (options) {
  // pre-building: initiate generator wrapper
  WX._unit.generator.call(this);
  // building: phase
  this._step = WX.context.createBufferSource();
  this._step.buffer = WX._builtin.step;
  this._step.loop = 1;
  this._step.loopEnd = 1.0;
  this._step.connect(this._outputGain);
  this._step.start(0);
  // post-building: handling initial parameter
  this._initializeParams(options, this._default);
};

WX._unit.step.prototype = {
  label: "step",
  _default: {
    gain: 1.0
  },
  stop: function (moment) {
    this._step.stop(moment || WX.now);
  }
};

WX._unit.extend(WX._unit.step.prototype, WX._unit.generator.prototype);