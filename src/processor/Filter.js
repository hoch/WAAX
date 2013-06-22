/**
 * WX.Filter
 */
WX._unit.filter = function (options) {
  // pre-building: processor wrapper
  WX._unit.processor.call(this);
  // building phase
  this._filter = WX.context.createBiquadFilter();
  this._inputGain.connect(this._filter);
  this._filter.connect(this._outputGain);
  this._filter.type = "lowpass";
  // post-building: parameter binding
  WX._unit.bindAudioParam.call(this, "cutoff", this._filter.frequency);
  WX._unit.bindAudioParam.call(this, "Q", this._filter.Q);
  WX._unit.bindAudioParam.call(this, "detune", this._filter.detune);
  // NOTE: this overriding processor-default gain method with filter's
  // which uses "dB" metric
  // NOTE: this is not working
  WX._unit.bindAudioParam.call(this, "gain", this._filter.gain);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.filter.prototype = {
  // this label will be appended automatically
  label: "filter",
  _default: {
    cutoff: 1000,
    Q: 1
  },
  // type
  type: function (type) {
    if (type !== undefined) {
      // TODO: need a switch for shortcuts
      this._filter.type = type;
      return this;
    } else {
      return this._filter.type;
    }
  }
};

WX._unit.extend(WX._unit.filter.prototype, WX._unit.processor.prototype);