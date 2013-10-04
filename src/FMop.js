(function (WX) {

  /**
   * WX.FMop
   */
  function FMop(params) {
    WX.UnitBase.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nMod = WX.nOSC();
    this._nModGain = WX.nGain();
    this._nCar = WX.nOSC();
    this._nMod.connect(this._nModGain);
    this._nModGain.connect(this._nCar.frequency);
    this._nCar.connect(this._nOutput);

    this.setParams(this.params);

    if (!this.params.pDynamic) {
      this.start();
    }
  }

  FMop.prototype = {

    defaultParams: {
      pLable: 'FMop',
      pFreq: 440.0,
      pHarmonicRatio: 4,
      pModulationIndex: 0.1,
      pDynamic: false
    },

    _Freq: function (transType, time1, time2) {
      WX.$(this._nCar.frequency, this.params.pFreq, transType, time1, time2);
    },

    _HarmonicRatio: function (transType, time1, time2) {
      WX.$(this._nMod.frequency, this.params.pFreq * this.params.pHarmonicRatio, transType, time1, time2);
    },

    _ModulationIndex: function (transType, time1, time2) {
      WX.$(this._nModGain.gain, this.params.pFreq * this.params.pHarmonicRatio * this.params.pModulationIndex, transType, time1, time2);
    },

    start: function (time) {
      if (this.params.pDynamic) {
        this._nMod = WX.nOSC();
        this._nModGain = WX.nGain();
        this._nCar = WX.nOSC();
        this._nMod.connect(this._nModGain);
        this._nModGain.connect(this._nCar.frequency);
        this._nCar.connect(this._nOutput);
      }
      this._nMod.start(time || WX.now);
      this._nCar.start(time || WX.now);
    },

    stop: function (time) {
      this._nMod.stop(time || WX.now);
      this._nCar.stop(time || WX.now);
    }

  };

  WX.extend(FMop.prototype, WX.UnitBase.prototype);
  WX.extend(FMop.prototype, WX.UnitOutput.prototype);

  WX.FMop = function (params) {
    return new FMop(params);
  };

})(WX);