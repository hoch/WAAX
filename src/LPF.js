(function (WX) {

  /**
   * WX.LPF
   */

  function LPF (params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nFilter1 = WX.nFilter();
    this._nFilter2 = WX.nFilter();
    this._nFilter1.type = this._nFilter2.type = "lowpass";
    this._nInput.connect(this._nFilter1);
    this._nFilter1.connect(this._nOutput);
    this._nFilter2.connect(this._nOutput);

    this._modulationTargets = {
      'pCutoff': [this._nFilter1.frequency, this._nFilter2.frequency],
      'pQ': [this._nFilter1.Q, this._nFilter2.Q]
    };

    this.setParams(this.params);
  }

  LPF.prototype = {

    defaultParams: {
      pCutoff: 250,
      pQ: 0.0,
      pEnhanced: false, // chaining two biquad filters
    },

    _Cutoff: function (transType, time1, time2) {
      WX.$(this._nFilter1.frequency, this.params.pCutoff, transType, time1, time2);
      WX.$(this._nFilter2.frequency, this.params.pCutoff, transType, time1, time2);
    },
    _Q: function (transType, time1, time2) {
      WX.$(this._nFilter1.Q, this.params.pQ, transType, time1, time2);
      WX.$(this._nFilter2.Q, this.params.pQ, transType, time1, time2);
    },
    _Enhanced: function (bool) {
      this._nFilter1.disconnect();
      if (bool) {
        this._nFilter1.connect(this._nFilter2);
      } else {
        this._nFilter1.connect(this._nOutput);
      }
    }

  };

  WX.extend(LPF.prototype, WX.UnitBase.prototype);
  WX.extend(LPF.prototype, WX.UnitInput.prototype);
  WX.extend(LPF.prototype, WX.UnitOutput.prototype);

  WX.LPF = function (params) {
    return new LPF(params);
  };

})(WX);