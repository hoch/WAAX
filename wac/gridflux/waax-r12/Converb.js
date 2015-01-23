(function (WX) {

  function Converb(params) {

    WX.UnitTemplate.call(this, params);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._buffermap = null;

    this._nInput = WX.nGain();
    this._nOutput = WX.nGain();
    this._nDry = WX.nGain();
    this._nWet = WX.nGain();
    this._nConvolver = WX.nConvolver();

    this.inlet.connect(this._nInput);
    this._nInput.connect(this._nDry);
    this._nInput.connect(this._nConvolver);
    this._nConvolver.connect(this._nWet);
    this._nDry.connect(this._nOutput);
    this._nWet.connect(this._nOutput);
    this._nOutput.connect(this._nActive);

    this.setParams(this.params);

  }

  Converb.prototype = {

    defaultParams: {
      pImpulseResponse: '',
      pLabel: 'converb',
      pMix: 0.1
    },

    setBuffermap: function (buffermap) {
      this._buffermap = buffermap;
    },

    _setImpulseResponse: function (irname) {
      if (this._buffermap) {
        this._nConvolver.buffer = this._buffermap.getBufferByName(irname);
      }
    },
    _setMix: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nDry.gain, 1.0 - value, transType, time1, time2);
      WX.setAudioParam(this._nWet.gain, value, transType, time1, time2);
    }

  };

  WX.extend(Converb.prototype, WX.UnitTemplate.prototype);

  WX.Converb = function (params) {
    return new Converb(params);
  };

})(WX);