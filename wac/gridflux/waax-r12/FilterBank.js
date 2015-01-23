(function (WX) {

  // pre-defined pitch sets: ionian, lydian, aeolian, mixolydian
  var _chords = {
    'ionian': [0, 7, 14, 21, 28, 35, 43, 48],
    'lydian': [0, 6, 16, 21, 26, 35, 42, 48],
    'aeolian': [0, 7, 15, 22, 26, 34, 39, 48],
    'mixolydian': [0, 5, 16, 23, 26, 33, 41, 48]
  };

  // number of filters
  var _numFilters = 8;

  function FilterBank (params) {

    WX.UnitTemplate.call(this, params);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nInput = WX.context.createGain();
    this._nOutput = WX.context.createGain();
    // building audio graph
    this._nFilters1 = [];
    this._nFilters2 = [];
    this._nGains = [];
    this._nSumming = WX.context.createGain();
    for (var i = 0; i < _numFilters; ++i) {
      this._nFilters1[i] = WX.context.createBiquadFilter();
      this._nFilters2[i] = WX.context.createBiquadFilter();
      this._nGains[i] = WX.context.createGain();
      this._nFilters1[i].type = "bandpass";
      this._nFilters2[i].type = "bandpass";
      this._nInput.connect(this._nFilters1[i]);
      this._nFilters1[i].connect(this._nFilters2[i]);
      this._nFilters2[i].connect(this._nGains[i]);
      this._nGains[i].connect(this._nSumming);
    }
    this._nSumming.connect(this._nOutput);
    this.inlet.connect(this._nInput);
    this._nOutput.connect(this._nActive);

    this._nSumming.gain.value = 50.0;

    this.setParams(this.params);
  }

  FilterBank.prototype = {

    defaultParams: {
      pLabel: 'filterbank',
      pPitch: 41,
      pChord: 'lydian',
      pSlope: 0.08,
      pWidth: 0.2,
      pDetune: 0.0
    },

    _setFilterFrequency: function (fund, chord, transType, time1, time2) {
      for (var i = 0; i < _numFilters; ++i) {
        var f = fund * Math.pow(2, chord[i % 8] / 12);
        WX.setAudioParam(this._nFilters1[i].frequency, f, transType, time1, time2);
        WX.setAudioParam(this._nFilters2[i].frequency, f, transType, time1, time2);
      }
    },

    _setPitch: function (value, transType, time1, time2) {
      var fund = WX.pitch2freq(this.params.pPitch);
      var chord = _chords[this.params.pChord];
      this._setFilterFrequency(fund, chord, transType, time1, time2);
    },

    _setChord: function (value, transType, time1, time2) {
      this._setPitch(value, transType, time1, time2);
    },

    _setSlope: function (value, transType, time1, time2) {
      var slope = WX.clamp(value, 0.12, 0.5);
      for (var i = 0; i < _numFilters; ++i) {
        // balancing formula (lowpass, highpass, or concave)
        var gain = 1.0 + Math.sin(Math.PI + (Math.PI/2 * (slope + i / _numFilters)));
        WX.setAudioParam(this._nGains[i].gain, gain, transType, time1, time2);
      }
    },

    _setWidth: function (value, transType, time1, time2) {
      for (var i = 0; i < _numFilters; ++i) {
        // inverse cubed curve for width
        var q = 6 + 60 * Math.pow((1 - i / _numFilters), value);
        WX.setAudioParam(this._nFilters1[i].Q, q, transType, time1, time2);
        WX.setAudioParam(this._nFilters2[i].Q, q, transType, time1, time2);
      }
    }

  };

  WX.extend(FilterBank.prototype, WX.UnitTemplate.prototype);

  WX.FilterBank = function (params) {
    return new FilterBank(params);
  };

})(WX);