(function (WX) {

  function Comp(params) {

    WX.UnitTemplate.call(this, params);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    // node building
    this._nInput = WX.nGain();
    this._nOutput = WX.nGain();
    this._nComp = WX.nComp();

    // source distribution
    this.inlet.connect(this._nInput);
    this._nInput.connect(this._nComp);
    this._nComp.connect(this._nOutput);
    this._nOutput.connect(this._nActive);

    // initialization
    this.setParams(this.params);
  }

  Comp.prototype = {

    defaultParams: {
      pLabel: 'Comp',
      pThreshold: -24.0,
      pKnee: 0.0,
      pRatio: 4.0,
      pAttack: 0.001,
      pRelease: 0.250,
      pGain: 4.0
    },

    _setThreshold: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nComp.threshold, value, transType, time1, time2);
    },

    _setKnee: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nComp.knee, value, transType, time1, time2);
    },

    _setRatio: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nComp.ratio, value, transType, time1, time2);
    },

    _setAttack: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nComp.attack, value, transType, time1, time2);
    },

    _setRelease: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nComp.release, value, transType, time1, time2);
    }

  };

  WX.extend(Comp.prototype, WX.UnitTemplate.prototype);

  WX.Comp = function (params) {
    return new Comp(params);
  };

})(WX);