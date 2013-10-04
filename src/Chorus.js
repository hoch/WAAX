(function (WX) {

  function Chorus(params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    // main
    this._nDry = WX.nGain();
    this._nWet = WX.nGain();
    var _nSplitter = WX.nSplitter(2);
    var _nMerger = WX.nMerger(2);
    // left stream
    this._nLStream = WX.nGain();
    this._nLDelayV = WX.nDelay();
    this._nLDelayF = WX.nDelay();
    this._nLFeedback = WX.nGain();
    this._nLFeedforward = WX.nGain();
    this._nLBlend = WX.nGain();
    // right stream
    this._nRStream = WX.nGain();
    this._nRDelayV = WX.nDelay();
    this._nRDelayF = WX.nDelay();
    this._nRFeedback = WX.nGain();
    this._nRFeedforward = WX.nGain();
    this._nRBlend = WX.nGain();

    // input
    this._nInput.connect(_nSplitter);
    this._nInput.connect(this._nDry);
    // left connection
    _nSplitter.connect(this._nLStream, 0, 0);
    this._nLStream.connect(this._nLDelayF);
    this._nLStream.connect(this._nLDelayV);
    this._nLDelayF.connect(this._nLFeedback);
    this._nLFeedback.connect(this._nLStream);
    this._nLDelayV.connect(this._nLFeedforward);
    this._nLDelayV.connect(_nMerger, 0, 0);
    this._nLBlend.connect(_nMerger, 0, 0);
    // right connection
    _nSplitter.connect(this._nRStream, 1, 0);
    this._nRStream.connect(this._nRDelayF);
    this._nRStream.connect(this._nRDelayV);
    this._nRDelayF.connect(this._nRFeedback);
    this._nRFeedback.connect(this._nRStream);
    this._nRDelayV.connect(this._nRFeedforward);
    this._nRDelayV.connect(_nMerger, 0, 1);
    this._nRBlend.connect(_nMerger, 0, 1);
    // output
    _nMerger.connect(this._nWet);
    this._nDry.connect(this._nOutput);
    this._nWet.connect(this._nOutput);

    // modulation
    this._nLFO = WX.nOSC();
    this._nLDepth = WX.nGain();
    this._nRDepth = WX.nGain();
    this._nLFO.start(0);
    this._nLFO.connect(this._nLDepth);
    this._nLFO.connect(this._nRDepth);
    this._nLDepth.connect(this._nLDelayV.delayTime);
    this._nRDepth.connect(this._nRDelayV.delayTime);

    // initial settings
    this._nLFO.type = "sine";
    this._nLFO.frequency.value = 0.18;
    this._nLDepth.gain.value = 0.010;
    this._nRDepth.gain.value = -0.011;
    this._nLDelayV.delayTime.value = 0.017;
    this._nLDelayF.delayTime.value = 0.011;
    this._nRDelayV.delayTime.value = 0.013;
    this._nRDelayF.delayTime.value = 0.019;
    this._nLFeedforward.gain.value = 0.70701;
    this._nRFeedforward.gain.value = 0.70701;

    this.setParams(this.params);
  }

  Chorus.prototype = {

    defaultParams: {
      pLabel: 'Chorus',
      pRate: 0.1,
      pDepth: 1.0,
      pIntensity: 0.1,
      pBlend: 1.0,
      pMix: 0.6
    },

    _Rate: function (transType, time1, time2) {
      var value = (WX.clamp(this.params.pRate, 0.0, 1.0) * 29 + 1) * 0.01;
      WX.$(this._nLFO.frequency, value, transType, time1, time2);
    },

    _Depth: function (transType, time1, time2) {
      var value = this.params.pDepth * 0.05;
      WX.$(this._nLDepth.gain, value, transType, time1, time2);
      WX.$(this._nRDepth.gain, -value, transType, time1, time2);
    },

    _Intensity: function (transType, time1, time2) {
      var value = -this.params.pIntensity;
      WX.$(this._nLFeedback.gain, value, transType, time1, time2);
      WX.$(this._nRFeedback.gain, value, transType, time1, time2);
    },

    _Blend: function (transType, time1, time2) {
      WX.$(this._nLBlend.gain, this.params.pBlend, transType, time1, time2);
      WX.$(this._nRBlend.gain, this.params.pBlend, transType, time1, time2);
    },

    _Mix: function (transType, time1, time2) {
      WX.$(this._nDry.gain, 1.0 - this.params.pMix, transType, time1, time2);
      WX.$(this._nWet.gain, this.params.pMix, transType, time1, time2);
    }
  };

  WX.extend(Chorus.prototype, WX.UnitBase.prototype);
  WX.extend(Chorus.prototype, WX.UnitInput.prototype);
  WX.extend(Chorus.prototype, WX.UnitOutput.prototype);

  WX.Chorus = function (params) {
    return new Chorus(params);
  };

})(WX);