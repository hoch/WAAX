/**
 * WX.Fmop: FM Operator unit (oscil=>oscil)
 */
WX._unit.fmop = function (options) {
  // initiate generator wrapper : pre-build
  WX._unit.generator.call(this);
  // build unit
  this._mod = WX.context.createOscillator();
  this._car = WX.context.createOscillator();
  this._modGain = WX.context.createGain();
  this._mod.connect(this._modGain);
  this._modGain.connect(this._car.frequency);
  this._car.connect(this._outputGain);
  this._carFreq = 220;
  this._harmRatio = 1.0;
  this._modIndex = 1.0;
  this._mod.start(0);
  this._car.start(0);
  // bind AudioParam
  WX._unit.bindAudioParam.call(this, "modFreq", this._mod.frequency);
  WX._unit.bindAudioParam.call(this, "carFreq", this._car.frequency);
  WX._unit.bindAudioParam.call(this, "modDetune", this._mod.detune);
  WX._unit.bindAudioParam.call(this, "carDetune", this._car.detune);
  WX._unit.bindAudioParam.call(this, "modGain", this._modGain.gain);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.fmop.prototype = {
  label: "fmop",
  _default: {
    freq: 220,
    harmRatio: 4,
    modIndex: 0.1
  },
  freq: function(value, moment, type) {
    if (value !== undefined) {
      this._carFreq = value;
      return this.carFreq(value, moment, type);
    } else {
      return this._carFreq;
    }
  },
  harmRatio: function(value, moment, type) {
    if (value !== undefined) {
      this._harmRatio = value;
      var v = this._carFreq * this._harmRatio;
      return this.modFreq(v, moment, type);
    } else {
      return this._harmRatio;
    }
  },
  modIndex: function(value, moment, type) {
    if (value !== undefined) {
      this._modIndex = value;
      var v = this._carFreq * this._harmRatio * this._modIndex;
      return this.modGain(v, moment, type);
    } else {
      return this._modIndex;
    }
  },
  stop: function(moment) {
    this._mod.stop(moment);
    this._car.stop(moment);
  }
};

WX._unit.extend(WX._unit.fmop.prototype, WX._unit.generator.prototype);