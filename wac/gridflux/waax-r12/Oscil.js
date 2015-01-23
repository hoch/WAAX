(function (WX) {

  var _waveforms = [
    'sine',
    'square',
    'triangle',
    'sawtooth'
  ];

  function Oscil(params) {

    WX.UnitTemplate.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);
    this._removeInlet();

    this._nOsc = WX.context.createOscillator();
    this._nOutput = WX.context.createGain();

    this._nOsc.connect(this._nOutput);
    this._nOutput.connect(this._nActive);
    if (!this.params.pDynamic) {
      this.start();
    }

    this.setParams(this.params);

  }

  Oscil.prototype = {

    defaultParams: {
      pType: 'sine',
      pFreq: 440.0,
      pGain: 0.25,
      pDynamic: false
    },

    _setType: function (value) {
      this._nOsc.type = value;
    },
    _setFreq: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nOsc.frequency, value, transType, time1, time2);
    },

    start: function (time) {
      if (this.params.pDynamic) {
        this._nOsc = WX.context.createOscillator();
        this._nOsc.connect(this._nOutput);
        this.setParams(this.params);
      }
      this._nOsc.start(time || WX.now);
    },
    stop: function (time) {
      this._nOsc.stop(time || WX.now);
    },

    getWaveforms: function () {
      return _waveforms;
    }

  };

  WX.extend(Oscil.prototype, WX.UnitTemplate.prototype);

  WX.Oscil = function (params) {
    return new Oscil(params);
  };

})(WX);