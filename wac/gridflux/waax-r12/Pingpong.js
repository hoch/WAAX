(function (WX) {

  function Pingpong(params) {

    WX.UnitTemplate.call(this, params);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    // node building
    this._nInput = WX.nGain();
    this._nOutput = WX.nGain();
    this._nLDelay = WX.nDelay();
    this._nRDelay = WX.nDelay();
    this._nLFeedback = WX.nGain();
    this._nRFeedback = WX.nGain();
    this._nLCrosstalk = WX.nGain();
    this._nRCrosstalk = WX.nGain();
    this._nDry = WX.nGain();
    this._nWet = WX.nGain();
    var nSplitter = WX.nSplitter(2);
    var nMerger = WX.nMerger(2);

    // source distribution
    this.inlet.connect(this._nInput);
    this._nInput.connect(nSplitter);
    this._nInput.connect(this._nDry);

    // interconnection: delay, fb, crosstalk
    nSplitter.connect(this._nLDelay, 0, 0);
    this._nLDelay.connect(this._nLFeedback);
    this._nLFeedback.connect(this._nLDelay);
    this._nLFeedback.connect(this._nRCrosstalk);
    this._nRCrosstalk.connect(this._nRDelay);
    this._nLDelay.connect(nMerger, 0, 0);

    nSplitter.connect(this._nRDelay, 1, 0);
    this._nRDelay.connect(this._nRFeedback);
    this._nRFeedback.connect(this._nRDelay);
    this._nRFeedback.connect(this._nLCrosstalk);
    this._nLCrosstalk.connect(this._nLDelay);
    this._nRDelay.connect(nMerger, 0, 1);

    // summing
    nMerger.connect(this._nWet);
    this._nDry.connect(this._nOutput);
    this._nWet.connect(this._nOutput);
    this._nOutput.connect(this._nActive);

    // initialization
    this.setParams(this.params);
  }

  Pingpong.prototype = {

    defaultParams: {
      pLabel: 'Pingpong',
      pDelayTime: 0.250,
      pDelayTimeLeft: 0.125,
      pDelayTimeRight: 0.250,
      pFeedback: 0.250,
      pFeedbackLeft: 0.250,
      pFeedbackRight: 0.125,
      pCrosstalk: 0.1,
      pMix: 1.0
    },

    _setDelayTime: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nLDelay.delayTime, value * 0.5, transType, time1, time2);
      WX.setAudioParam(this._nRDelay.delayTime, value, transType, time1, time2);
    },

    _setDelayTimeLeft: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nLDelay.delayTime, value, transType, time1, time2);
    },

    _setDelayTimeRight: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nRDelay.delayTime, value, transType, time1, time2);
    },

    _setFeedback: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nLFeedback.gain, value, transType, time1, time2);
      WX.setAudioParam(this._nRFeedback.gain, value * 0.5, transType, time1, time2);
    },

    _setFeedbackLeft: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nLFeedback.gain, value, transType, time1, time2);
    },

    _setFeedbackRight: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nRFeedback.gain, value, transType, time1, time2);
    },

    _setCrosstalk: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nLCrosstalk.gain, value, transType, time1, time2);
      WX.setAudioParam(this._nRCrosstalk.gain, value, transType, time1, time2);
    },

    _setMix: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nDry.gain, 1.0 - value, transType, time1, time2);
      WX.setAudioParam(this._nWet.gain, value, transType, time1, time2);
    }

  };

  WX.extend(Pingpong.prototype, WX.UnitTemplate.prototype);

  WX.Pingpong = function (params) {
    return new Pingpong(params);
  };

})(WX);