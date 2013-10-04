(function (WX) {

  /**
   * class-specific static variables
   */

  // alto formant preset: Synthesis of the Singing Voice, pp.36
  var _formants = {
    a: {
      freq: [800, 1150, 2800, 3500, 4950],
      bw: [80, 90, 120, 130, 140],
      amp: [1, 0.6309573444801932, 0.1, 0.015848931924611134, 0.001]
    },
    e: {
      freq: [400, 1600, 2700, 3300, 4950],
      bw: [60, 80, 120, 150, 200],
      amp: [1, 0.06309573444801933, 0.03162277660168379, 0.01778279410038923, 0.001]
    },
    i: {
      freq: [350, 1700, 2700, 3700, 4950],
      bw: [50, 100, 120, 150, 200],
      amp: [1, 0.1, 0.03162277660168379, 0.015848931924611134, 0.001]
    },
    o: {
      freq: [450, 800, 2830, 3500, 4950],
      bw: [70, 80, 100, 130, 135],
      amp: [1, 0.35481338923357547, 0.15848931924611134, 0.039810717055349734, 0.0017782794100389228]
    },
    u: {
      freq: [325, 700, 2530, 3500, 4950],
      bw: [50, 60, 170, 180, 200],
      amp: [1, 0.251188643150958, 0.03162277660168379, 0.01, 0.000630957344480193]
    }
  };

  // points on unit circle
  var _points = [
    [0.0, 1],
    [-0.9510565162951535, 0.3090169943749475],
    [-0.5877852522924732, -0.8090169943749473],
    [0.5877852522924729, -0.8090169943749476],
    [0.9510565162951536, 0.3090169943749472]
  ];


  /**
   * WX.FormantV
   */

  function FormantV (params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nFilters = [];
    this._nGains = [];
    for (var i = 0; i < 5; ++i) {
      this._nFilters[i] = WX.nFilter();
      this._nGains[i] = WX.nGain();
      this._nFilters[i].type = "bandpass";
      this._nInput.connect(this._nFilters[i]);
      this._nFilters[i].connect(this._nGains[i]);
      this._nGains[i].connect(this._nOutput);
    }

    this._tFreq = [];
    this._tQ = [];
    this._tAmp = [];

    this.setParams(this.params);
  }

  FormantV.prototype = {

    defaultParams: {
      pPositionX: 0.0,
      pPositionY: 0.1
    },

    _calculateFormant: function (x, y) {
      var w = [];
      var norm = 0.0;
      for (var i = 0; i < 5; i++) {
        var dx = x - _points[i][0],
            dy = y - _points[i][1];
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d === 0) {
          d = 0.0001;
        } else {
          w[i] = 1 / d;
          norm += w[i];
        }
      }
      norm = 1 / norm;
      //interpolateFormants(weight, norm, formant);
      for (var j = 0; j < 5; j++) {
        this._tFreq[j] =
          w[0] * _formants.a.freq[j] +
          w[1] * _formants.e.freq[j] +
          w[2] * _formants.i.freq[j] +
          w[3] * _formants.o.freq[j] +
          w[4] * _formants.u.freq[j];
        this._tFreq[j] *= norm;
        this._tQ[j] =
          w[0] * _formants.a.freq[j] / _formants.a.bw[j] +
          w[1] * _formants.e.freq[j] / _formants.e.bw[j] +
          w[2] * _formants.i.freq[j] / _formants.i.bw[j] +
          w[3] * _formants.o.freq[j] / _formants.o.bw[j] +
          w[4] * _formants.u.freq[j] / _formants.u.bw[j];
        this._tQ[j] *= norm;
        this._tAmp[j] =
          w[0] * _formants.a.amp[j] +
          w[1] * _formants.e.amp[j] +
          w[2] * _formants.i.amp[j] +
          w[3] * _formants.o.amp[j] +
          w[4] * _formants.u.amp[j];
        this._tAmp[j] *= norm;
      }
    },

    _PositionX: function () {},

    _PositionY: function () {},

    setPosition: function (x, y, transType, time1, time2) {
      // this._PositionX(x, transType, time1, time2);
      // this._PositionY(y, transType, time1, time2);
      this._calculateFormant(x, y);
      for (var i = 0; i < 5; i++) {
        WX.$(this._nFilters[i].frequency, this._tFreq[i], transType, time1, time2);
        WX.$(this._nFilters[i].Q, this._tQ[i], transType, time1, time2);
        WX.$(this._nGains[i].gain, this._tAmp[i], transType, time1, time2);
      }
    },

  };

  WX.extend(FormantV.prototype, WX.UnitBase.prototype);
  WX.extend(FormantV.prototype, WX.UnitInput.prototype);
  WX.extend(FormantV.prototype, WX.UnitOutput.prototype);

  WX.FormantV = function (params) {
    return new FormantV(params);
  };

})(WX);