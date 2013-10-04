(function (WX) {

  // pre-defined pitch sets: ionian, lydian, aeolian, mixolydian
  // TODO: this is not ideal. this should be managed in the app level.
  var _chords = {
    'ionian': [0, 7, 14, 21, 28, 35, 43, 48],
    'lydian': [0, 6, 16, 21, 26, 35, 42, 48],
    'aeolian': [0, 7, 15, 22, 26, 34, 39, 48],
    'mixolydian': [0, 5, 16, 23, 26, 33, 41, 48]
  };

  // number of filters
  var _numFilters = 8;


  /**
   * WX.FilterBank
   */

  function FilterBank (params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nFilters1 = [];
    this._nFilters2 = [];
    this._nGains = [];
    this._nSumming = WX.nGain();
    for (var i = 0; i < _numFilters; ++i) {
      this._nFilters1[i] = WX.nFilter();
      this._nFilters2[i] = WX.nFilter();
      this._nGains[i] = WX.nGain();
      this._nFilters1[i].type = "bandpass";
      this._nFilters2[i].type = "bandpass";
      this._nInput.connect(this._nFilters1[i]);
      this._nFilters1[i].connect(this._nFilters2[i]);
      this._nFilters2[i].connect(this._nGains[i]);
      this._nGains[i].connect(this._nSumming);
    }
    this._nSumming.connect(this._nOutput);

    this._nSumming.gain.value = 50.0;

    this.setParams(this.params);
  }

  FilterBank.prototype = {

    defaultParams: {
      pLabel: 'FilterBank',
      pPitch: 41,
      pChord: 'lydian',
      pSlope: 0.26,
      pWidth: 0.49,
      pDetune: 0.0
    },

    // helper
    _setFilterFrequency: function (transType, time1, time2) {
      var fund = WX.pitch2freq(this.params.pPitch);
      var chord = _chords[this.params.pChord];
      for (var i = 0; i < _numFilters; ++i) {
        var freq = fund * Math.pow(2, chord[i] / 12);
        WX.$(this._nFilters1[i].frequency, freq, transType, time1, time2);
        WX.$(this._nFilters2[i].frequency, freq, transType, time1, time2);
      }
    },

    // handler
    _Pitch: function (transType, time1, time2) {
      this._setFilterFrequency(transType, time1, time2);
    },

    _Chord: function (transType, time1, time2) {
      this._setFilterFrequency(transType, time1, time2);
    },

    _Slope: function (transType, time1, time2) {
      this.params.pSlope = WX.clamp(this.params.pSlope, 0.1, 0.75);
      for (var i = 0; i < _numFilters; ++i) {
        // balancing formula (lowpass, highpass, or concave)
        var gain = 1.0 + Math.sin(Math.PI + (Math.PI/2 * (this.params.pSlope + i / _numFilters)));
        WX.$(this._nGains[i].gain, gain, transType, time1, time2);
      }
    },

    _Width: function (transType, time1, time2) {
      for (var i = 0; i < _numFilters; ++i) {
        // inverse cubed curve for width
        var q = 2 + 90 * Math.pow((1 - i / _numFilters), this.params.pWidth);
        WX.$(this._nFilters1[i].Q, q, transType, time1, time2);
        WX.$(this._nFilters2[i].Q, q, transType, time1, time2);
      }
    },

    _Detune: function (transType, time1, time2) {
      for (var i = 0; i < _numFilters; ++i) {
        WX.$(this._nFilters1[i].detune, this.params.pDetune, transType, time1, time2);
        WX.$(this._nFilters2[i].detune, -this.params.pDetune, transType, time1, time2);
      }
    }

  };

  WX.extend(FilterBank.prototype, WX.UnitBase.prototype);
  WX.extend(FilterBank.prototype, WX.UnitInput.prototype);
  WX.extend(FilterBank.prototype, WX.UnitOutput.prototype);

  WX.FilterBank = function (params) {
    return new FilterBank(params);
  };

})(WX);