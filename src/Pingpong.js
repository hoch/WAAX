(function (WX) {

  /**
   * WX.Pingpong
   */

  function Pingpong(params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    // node building
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

    // initialization
    this.setParams(this.params);
  }

  Pingpong.prototype = {

    defaultParams: {
      pLabel: 'Pingpong',
      pDelayTimeLeft: 0.125,
      pDelayTimeRight: 0.250,
      pFeedbackLeft: 0.250,
      pFeedbackRight: 0.125,
      pCrosstalk: 0.1,
      pMix: 1.0
    },

    _DelayTimeLeft: function (transType, time1, time2) {
      WX.$(this._nLDelay.delayTime, this.params.pDelayTimeLeft, transType, time1, time2);
    },

    _DelayTimeRight: function (transType, time1, time2) {
      WX.$(this._nRDelay.delayTime, this.params.pDelayTimeRight, transType, time1, time2);
    },

    _FeedbackLeft: function (transType, time1, time2) {
      WX.$(this._nLFeedback.gain, this.params.pFeedbackLeft, transType, time1, time2);
    },

    _FeedbackRight: function (transType, time1, time2) {
      WX.$(this._nRFeedback.gain, this.params.pFeedbackRight, transType, time1, time2);
    },

    _Crosstalk: function (transType, time1, time2) {
      WX.$(this._nLCrosstalk.gain, this.params.pCrosstalk, transType, time1, time2);
      WX.$(this._nRCrosstalk.gain, this.params.pCrosstalk, transType, time1, time2);
    },

    _Mix: function (transType, time1, time2) {
      WX.$(this._nDry.gain, 1.0 - this.params.pMix, transType, time1, time2);
      WX.$(this._nWet.gain, this.params.pMix, transType, time1, time2);
    },

    setDelayTime: function (dtLeft, dtRight, transType, time1, time2) {
      this.set('pDelayTimeLeft', dtLeft, transType, time1, time2);
      this.set('pDelayTimeLeft', dtRight, transType, time1, time2);
    },

    setFeedback: function (fbLeft, fbRight, transType, time1, time2) {
      this.set('pFeedbackLeft', fbLeft, transType, time1, time2);
      this.set('pFeedbackRight', fbRight, transType, time1, time2);
    }

  };

  WX.extend(Pingpong.prototype, WX.UnitBase.prototype);
  WX.extend(Pingpong.prototype, WX.UnitInput.prototype);
  WX.extend(Pingpong.prototype, WX.UnitOutput.prototype);

  WX.Pingpong = function (params) {
    return new Pingpong(params);
  };

})(WX);