(function (WX) {

  function Fader(params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nInput.connect(this._nOutput);

    this._modulationTargets = {
      'pGain': [this._nOutput.gain]
    };

    this.setParams(this.params);
  }

  Fader.prototype = {

    defaultParams: {
      pLabel: 'Fader',
      pMute: false,
      pdB: 0.0,
      // pPanning: 0.5
    },

    _Mute: function () {
      WX.$(this._nInput.gain, this.params.pMute ? 0.0 : 1.0);
    },

    // overide default _Gain helper
    _Gain: function (transType, time1, time2) {
      this.params.pdB = WX.lin2db(this.params.pGain);
      WX.$(this._nOutput.gain, this.params.pGain, transType, time1, time2);
    },

    _dB: function (transType, time1, time2) {
      this.params.pGain = WX.db2lin(this.params.pdB);
      WX.$(this._nOutput.gain, this.params.pGain, transType, time1, time2);
    }

    // _Panning: function () {
    //   // TODO
    // }
  };

  WX.extend(Fader.prototype, WX.UnitBase.prototype);
  WX.extend(Fader.prototype, WX.UnitInput.prototype);
  WX.extend(Fader.prototype, WX.UnitOutput.prototype);

  WX.Fader = function (params) {
    return new Fader(params);
  };

  // hardcoded master channel
  WX.DAC = WX.Fader({ pLabel: "DAC" });
  WX.DAC.connect(WX.context.destination);

})(WX);
