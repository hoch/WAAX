/**
 * wx.oscil
 */
wx._unit.oscil = function (options) {
  // initiate generator wrapper : pre-build
  wx._unit.generator.call(this);
  // build unit
  this._osc = wx.context.createOscillator();
  this._osc.connect(this._outputGain);
  this._osc.start(0);
  wx._unit.bindParameter.call(this, "freq", this._osc.frequency);
  wx._unit.bindParameter.call(this, "detune", this._osc.detune);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

wx._unit.oscil.prototype = {
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
  }
};
wx._unit.extend(wx._unit.oscil.prototype, wx._unit.generator.prototype);