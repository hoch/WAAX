(function (WX) {

  function Fader(params) {

    WX.UnitTemplate.call(this, params);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nInput = WX.context.createGain();
    this._nOutput = WX.context.createGain();

    this.inlet.connect(this._nInput);
    this._nInput.connect(this._nOutput);
    this._nOutput.connect(this._nActive);

    this.setParams(this.params);

  }

  Fader.prototype = {

    defaultParams: {
      pMute: false,
      pGain: 1.0,
      pdB: 0.0,
      pPanning: 0.5
    },

    _setMute: function (bool) {
      this._nInput.gain.value = bool ? 0.0 : 1.0;
    },
    _setGain: function (value, transType, time1, time2) {
      var db = WX.lin2db(value);
      this.params.pdB = db;
      WX.setAudioParam(this._nOutput.gain, value, transType, time1, time2);
    },
    _setdB: function (value, transType, time1, time2) {
      var amp = WX.db2lin(value);
      this.params.pGain = amp;
      WX.setAudioParam(this._nOutput.gain, amp, transType, time1, time2);
    },
    _setPanning: function () {
      // TODO
    }


  };

  WX.extend(Fader.prototype, WX.UnitTemplate.prototype);

  WX.Fader = function (params) {
    return new Fader(params);
  };

  WX.DAC = WX.Fader({ pLabel: "DAC" });
  WX.DAC.connect(WX.context.destination);

})(WX);