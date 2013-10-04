(function (WX) {

  // generating impulse periodic wave
  var binSize = 4096;
  var mag = new Float32Array(binSize);
  var phase = new Float32Array(binSize);
  for (i = 0; i < binSize; ++i) {
    mag[i] = 1.0;
    phase[i] = 0.0;
  }
  var impulse;
  // TODO: shim
  if (typeof WX.context.createWaveTable === 'function') {
    impulse = WX.context.createWaveTable(mag, phase);
  } else {
    impulse = WX.context.createPeriodicWave(mag, phase);
  }


  /**
   * WX.ImpulseTrain
   */

  function ImpulseTrain(params) {
    WX.UnitBase.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nImpulseTrain = WX.nOSC();
    this._nImpulseTrain.connect(this._nOutput);

    this._modulationTargets = {
      'pFreq': [this._nImpulseTrain.frequency],
      'pGain': [this._nOutput.gain]
    };

    // shim
    if (typeof this._nImpulseTrain.setWaveTable === 'undefined') {
      this._nImpulseTrain.setPeriodicWave(impulse);
    } else {
      this._nImpulseTrain.setWaveTable(impulse);
    }

    this.setParams(this.params);

    if (!this.params.pDynamic) {
      this.start();
    }
  }

  ImpulseTrain.prototype = {

    defaultParams: {
      pLabel: 'ImpulseTrain',
      pFreq: 1.0,
      pGain: 0.25,
      pDynamic: false
    },

    _Freq: function (transType, time1, time2) {
      WX.$(this._nImpulseTrain.frequency, this.params.pFreq, transType, time1, time2);
    },

    start: function (time) {
      if (this.params.pDynamic) {
        this._nImpulseTrain = WX.nOSC();
        this._nImpulseTrain.connect(this._nOutput);
        if (typeof this._nImpulseTrain.setWaveTable === 'undefined') {
          this._nImpulseTrain.setPeriodicWave(impulse);
        } else {
          this._nImpulseTrain.setWaveTable(impulse);
        }
        this.setParams(this.params);
      }
      this._nImpulseTrain.start(time || WX.now);
    },

    stop: function (time) {
      this._nImpulseTrain.stop(time || WX.now);
    },

  };

  WX.extend(ImpulseTrain.prototype, WX.UnitBase.prototype);
  WX.extend(ImpulseTrain.prototype, WX.UnitOutput.prototype);

  WX.ImpulseTrain = function (params) {
    return new ImpulseTrain(params);
  };

})(WX);