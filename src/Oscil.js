(function (WX) {

  /**
   * WX.Oscil
   */

  function Oscil(params) {
    WX.UnitBase.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nOSC = WX.nOSC();
    this._nOSC.connect(this._nOutput);

    this._modulationTargets = {
      'pFreq': [this._nOSC.frequency],
      'pGain': [this._nOutput.gain]
    };

    this.setParams(this.params);

    // this unit supports dynamic lifetime
    // if this is non-dynamic, start osc immediately
    if (!this.params.pDynamic) {
      this.start();
    }
  }

  Oscil.prototype = {

    defaultParams: {
      pLabel: 'Oscil',
      pType: 'sine',
      pFreq: 440.0,
      pGain: 0.25,
      pDynamic: false
    },

    _Type: function () {
      if (WX.System.LEGACY_SUPPORT) {
        this._nOSC.type = WX.OscilType[this.params.pType];
      } else {
        this._nOSC.type = this.params.pType;
      }
    },

    _Freq: function (transType, time1, time2) {
      WX.$(this._nOSC.frequency, this.params.pFreq, transType, time1, time2);
    },

    start: function (time) {
      if (this.params.pDynamic) {
        this._nOSC = WX.nOSC();
        this._nOSC.connect(this._nOutput);
        this.setParams(this.params);
      }
      this._nOSC.start(time || WX.now);
    },

    stop: function (time) {
      this._nOSC.stop(time || WX.now);
    }

  };

  WX.extend(Oscil.prototype, WX.UnitBase.prototype);
  WX.extend(Oscil.prototype, WX.UnitOutput.prototype);

  WX.Oscil = function (params) {
    return new Oscil(params);
  };

})(WX);