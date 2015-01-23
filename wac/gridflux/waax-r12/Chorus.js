(function (WX) {

  function Chorus (params) {

    WX.UnitTemplate.call(this, params);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    // main
    this._nInput = WX.nGain();
    this._nOutput = WX.nGain();
    this._nDry = WX.nGain();
    this._nWet = WX.nGain();
    var _nSplitter = WX.context.createChannelSplitter();
    var _nMerger = WX.context.createChannelMerger();
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
    this.inlet.connect(this._nInput);
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
    this._nOutput.connect(this._nActive);

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
      pLabel: 'chorus',
      pRate: 0.1,
      pDepth: 1.0,
      pIntensity: 0.1,
      pBlend: 1.0,
      pMix: 0.6
    },

    _setRate: function (value, transType, time1, time2) {
      value = (WX.clamp(value, 0.0, 1.0) * 29 + 1) * 0.01;
      WX.setAudioParam(this._nLFO.frequency, value, transType, time1, time2);
    },
    _setDepth: function (value, transType, time1, time2) {
      value *= 0.05;
      WX.setAudioParam(this._nLDepth.gain, value, transType, time1, time2);
      WX.setAudioParam(this._nRDepth.gain, -value, transType, time1, time2);
    },
    _setIntensity: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nLFeedback.gain, -value, transType, time1, time2);
      WX.setAudioParam(this._nRFeedback.gain, -value, transType, time1, time2);
    },
    _setBlend: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nLBlend.gain, value, transType, time1, time2);
      WX.setAudioParam(this._nRBlend.gain, value, transType, time1, time2);
    },
    _setMix: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nDry.gain, 1.0 - value, transType, time1, time2);
      WX.setAudioParam(this._nWet.gain, value, transType, time1, time2);
    }
  };

  WX.extend(Chorus.prototype, WX.UnitTemplate.prototype);

  WX.Chorus = function (params) {
    return new Chorus(params);
  };

})(WX);