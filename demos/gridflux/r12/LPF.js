(function (WX) {

  function LPF (params) {

    WX.UnitTemplate.call(this, params);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nInput = WX.context.createGain();
    this._nFilter1 = WX.context.createBiquadFilter();
    this._nFilter2 = WX.context.createBiquadFilter();
    this._nOutput = WX.context.createGain();

    this._nFilter1.type = this._nFilter2.type = "lowpass";

    this.inlet.connect(this._nInput);
    this._nInput.connect(this._nFilter1);
    this._nFilter1.connect(this._nOutput);
    this._nFilter2.connect(this._nOutput);
    this._nOutput.connect(this._nActive);

    this.setParams(this.params);

  }

  LPF.prototype = {

    defaultParams: {
      pCutoff: 250,
      pResonance: 0.0, //
      pEnhanced: false, // chaining two biquad filters
    },

    _setCutoff: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nFilter1.frequency, value, transType, time1, time2);
      WX.setAudioParam(this._nFilter2.frequency, value, transType, time1, time2);
    },
    _setResonance: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nFilter1.Q, value, transType, time1, time2);
      WX.setAudioParam(this._nFilter2.Q, value, transType, time1, time2);
    },
    _setEnhanced: function (bool) {
      this._nFilter1.disconnect();
      if (bool) {
        this._nFilter1.connect(this._nFilter2);
      } else {
        this._nFilter1.connect(this._nOutput);
      }
    }

  };

  WX.extend(LPF.prototype, WX.UnitTemplate.prototype);

  WX.LPF = function (params) {
    return new LPF(params);
  };

})(WX);