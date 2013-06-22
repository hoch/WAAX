/**
 * WX.oscil
 */
WX._unit.oscil = function (options) {
  // initiate generator wrapper : pre-build
  WX._unit.generator.call(this);
  // build unit
  this._osc = WX.context.createOscillator();
  this._osc.connect(this._outputGain);
  this._osc.start(0);
  WX._unit.bindAudioParam.call(this, "freq", this._osc.frequency);
  WX._unit.bindAudioParam.call(this, "detune", this._osc.detune);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.oscil.prototype = {
  label: "oscil",
  _default: {
    type: "sine",
    freq: 440,
    gain: 1.0,
    detune: 0.0
  },
  type: function (waveform) {
    var t;
    switch (waveform) {
      case "sine":
      case "sin":
      case 0:
        t = 0;
        break;
      case "square":
      case "sqr":
      case 1:
        t = 1;
        break;
      case "sawtooth":
      case "saw":
      case 2:
        t = 2;
        break;
      case "triangle":
      case "tri":
      case 3:
        t = 3;
        break;
      case undefined:
        t = -1;
        break;
    }
    if (t == -1) {
      return this._osc.type;
    } else {
      this._osc.type = t;
    }
  },
  stop: function(moment) {
    this._osc.stop(moment);
  }
};
WX._unit.extend(WX._unit.oscil.prototype, WX._unit.generator.prototype);