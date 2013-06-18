/**
 * wx.fader
 */
wx._unit.fader = function () {
  wx._unit.processor.call(this);
  this._inputGain.connect(this._outputGain);
  wx._unit.bindParameter.call(this, "inputGain", this._inputGain.gain);
};

wx._unit.fader.prototype = {
  // this label will be appended automatically
  label: "fader",
  // method definition
  db: function (decibel, moment, type) {
    var amp = Math.pow(10.0, decibel / 20.0);
    return this.gain(amp, moment, type);
  },
  mute: function (bool, moment) {
    var amp = (bool) ? 0.0 : 1.0;
    return this.inputGain(amp, moment);
  }
};
wx._unit.extend(wx._unit.fader.prototype, wx._unit.processor.prototype);