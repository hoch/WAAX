(function (WX) {

  /**
   * WX.Converb
   */
  function Converb(params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nDry = WX.nGain();
    this._nWet = WX.nGain();
    this._nConvolver = WX.nConvolver();

    this._nInput.connect(this._nDry);
    this._nInput.connect(this._nConvolver);
    this._nConvolver.connect(this._nWet);
    this._nDry.connect(this._nOutput);
    this._nWet.connect(this._nOutput);

    this.setParams(this.params);
  }

  Converb.prototype = {

    defaultParams: {
      pLabel: 'Converb',
      pMix: 0.2
    },

    _Mix: function (transType, time1, time2) {
      WX.$(this._nDry.gain, 1.0 - this.params.pMix, transType, time1, time2);
      WX.$(this._nWet.gain, this.params.pMix, transType, time1, time2);
    },

    setImpulseResponse: function (ir) {
      this._nConvolver.buffer = ir;
    }

  };

  WX.extend(Converb.prototype, WX.UnitBase.prototype);
  WX.extend(Converb.prototype, WX.UnitInput.prototype);
  WX.extend(Converb.prototype, WX.UnitOutput.prototype);

  WX.Converb = function (params) {
    return new Converb(params);
  };

})(WX);