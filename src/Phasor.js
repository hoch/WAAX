(function (WX) {

  var kMaxNotches = 12;

  /**
   * WX.Phasor
   */

  function Phasor(params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    // phasor audio graph
    this._nDry = WX.nGain();
    this._nWet = WX.nGain();
    var _nSplitter = WX.nSplitter();
    var _nMerger = WX.nMerger();
    this._nNotches = [];
    for (var i = 0; i < kMaxNotches; i++) {
      this._nNotches[i] = WX.nFilter();
      this._nNotches[i].type = "notch";
    }
    this._inputGain.connect(this._nDry);
    this._inputGain.connect(_nSplitter);
    _nSplitter.connect(this._nNotches[0], 0, 0);
    _nSplitter.connect(this._nNotches[1], 1, 0);
    for (var j = 0; j < kMaxNotches - 2; j += 2) {
      this._nNotches[j].connect(this._nNotches[j+2]);
      this._nNotches[j+1].connect(this._nNotches[j+3]);
    }
    this._nNotches[kMaxNotches-2].connect(_nMerger, 0, 0);
    this._nNotches[kMaxNotches-1].connect(_nMerger, 0, 1);
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
    for (var k = 0; k < kMaxNotches; k++) {
      if (k % 2) {
        this._nRDepth.connect(this._nNotches[k].frequency);
      } else {
        this._nLDepth.connect(this._nNotches[k].frequency);
      }
    }

    this._nLFO.type = "triangle";
    // this._nLFO.frequency.value = 4.0;
    // this._nLDepth.gain.value = 200.0;
    // this._nRDepth.gain.value = -200.0;

    this.setParams(this.params);
  }

  Phasor.prototype = {

    defaultParams: {
      pLabel: 'Phasor',
      pRate: 0.5,
      pDepth: 1.0,
      pBaseFrequency: 1.0,
      pSpacing: 0.1,
      pMix: 0.6
    },

    _setNotchFrequency: function () {
      for (var i = 0; i < kMaxNotches; i++) {
        var freq = this.params.pBaseFrequency + Math.pow(this.params.pSpacing, i);
        WX.$(this._nNotches[i].frequency, freq, transType, time1, time2);
      }
    },

    _Rate: function (transType, time1, time2) {
      WX.$(this._nLFO.frequency, (WX.clamp(this.params.pRate, 0.0, 1.0) * 4 + 2), transType, time1, time2);
    },

    _Depth: function (transType, time1, time2) {
      var value = WX.clamp(this.params.pDepth, 0.0, 1.0) * 200.0;
      WX.$(this._nLDepth.gain, value, transType, time1, time2);
      WX.$(this._nRDepth.gain, -value, transType, time1, time2);
    },

    _BaseFrequency: function (transType, time1, time2) {
      this._setNotchFrequency();
    },

    _Spacing: function (transType, time1, time2) {
      this._setNotchFrequency();
    },

    _Mix: function (transType, time1, time2) {
      WX.$(this._nDry.gain, 1.0 - this.params.pMix, transType, time1, time2);
      WX.$(this._nWet.gain, this.params.pMix, transType, time1, time2);
    }
  };

  WX.extend(Phasor.prototype, WX.UnitBase.prototype);
  WX.extend(Phasor.prototype, WX.UnitInput.prototype);
  WX.extend(Phasor.prototype, WX.UnitOutput.prototype);

  WX.Phasor = function (params) {
    return new Phasor(params);
  };

})(WX);