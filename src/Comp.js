(function (WX) {

  /**
   * WX.Comp
   */
  function Comp(params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nComp = WX.nComp();
    this._nInput.connect(this._nComp);
    this._nComp.connect(this._nOutput);

    this.setParams(this.params);
  }

  Comp.prototype = {

    defaultParams: {
      pLabel: 'Comp',
      pThreshold: -8.0,
      pKnee: 0.0,
      pRatio: 2.0,
      pAttack: 0.010,
      pRelease: 0.250,
      pGain: 1.0
    },

    _Threshold: function (transType, time1, time2) {
      WX.$(this._nComp.threshold, this.params.pThreshold, transType, time1, time2);
    },

    _Knee: function (transType, time1, time2) {
      WX.$(this._nComp.knee, this.params.pKnee, transType, time1, time2);
    },

    _Ratio: function (transType, time1, time2) {
      WX.$(this._nComp.ratio, this.params.pRatio, transType, time1, time2);
    },

    _Attack: function (transType, time1, time2) {
      WX.$(this._nComp.attack, this.params.pAttack, transType, time1, time2);
    },

    _Release: function (transType, time1, time2) {
      WX.$(this._nComp.release, this.params.pRelease, transType, time1, time2);
    }

  };

  WX.extend(Comp.prototype, WX.UnitBase.prototype);
  WX.extend(Comp.prototype, WX.UnitInput.prototype);
  WX.extend(Comp.prototype, WX.UnitOutput.prototype);

  WX.Comp = function (params) {
    return new Comp(params);
  };

})(WX);