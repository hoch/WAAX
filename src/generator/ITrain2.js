/**
 * WX.Itrain2
 * note: wavetable version, going to be replaced with "PeriodicWave" mode
 */
WX._unit.itrain2 = function (options) {
  // pre-building: initiate generator wrapper
  WX._unit.generator.call(this);
  // building: phase
  this._impulse = WX.context.createOscillator();
  this._impulse.connect(this._outputGain);
  this._impulse.setWaveTable(WX._builtin.impulseWavelet);
  this._impulse.start(0);
  WX._unit.bindAudioParam.call(this, "freq", this._impulse.frequency);
  WX._unit.bindAudioParam.call(this, "detune", this._impulse.detune);
  // post-building: handling initial parameter
  this._initializeParams(options, this._default);
};

WX._unit.itrain2.prototype = {
  label: "itrain2",
  _default: {
    freq: 1,
    gain: 1.0
  },
  stop: function (moment) {
    this._impulse.stop(moment || WX.now);
  }
};

WX._unit.extend(WX._unit.itrain2.prototype, WX._unit.generator.prototype);

/*
  NOTE: between frequency 0.1 ~ 10, the harmonics can be found...
 */