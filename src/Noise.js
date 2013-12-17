(function (WX) {

  // getNoiseBUffer_Gaussian
  function getNoiseBuffer_Gaussian(duration, sampleRate) {
    var L = Math.floor(WX.sampleRate * duration);
    var noiseFloat32 = new Float32Array(L);
    for (var i = 0; i < L; i++) {
      var r1 = Math.random(), r2 = Math.random();
      noiseFloat32[i] = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2) * 0.5;
    }
    var noiseBuffer = WX.context.createBuffer(2, L, sampleRate);
    noiseBuffer.getChannelData(0).set(noiseFloat32, 0);
    noiseBuffer.getChannelData(1).set(noiseFloat32, 0);
    return noiseBuffer;
  }

  // creating white noise (gaussian distribution) buffer (10s)
  var duration = 10.0;
  var baseNoiseBuffer;

  WX.add_init_callback(function () {
    baseNoiseBuffer = getNoiseBuffer_Gaussian(duration, WX.sampleRate);
  });

  // var whiteNoise1 = new Float32Array(bufferLength);
  // var whiteNoise2 = new Float32Array(bufferLength);
  // var noiseBuffer1 = WX.context.createBuffer(2, bufferLength, WX.sampleRate);
  // var noiseBuffer2 = WX.context.createBuffer(2, bufferLength, WX.sampleRate);
  // // gaussian white noise
  // // http://www.musicdsp.org/showone.php?id=113
  // for (var i = 0; i < bufferLength; i++) {
  //   var r1 = Math.random(), r2 = Math.random();
  //   r1 = (r1 === 0.0) ? Number.MIN_VALUE : r1;
  //   whiteNoise1[i] = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2) * 0.5;
  //   r1 = Math.random();
  //   r2 = Math.random();
  //   r1 = (r1 === 0.0) ? Number.MIN_VALUE : r1;
  //   whiteNoise2[i] = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2) * 0.5;
  // }
  // noiseBuffer1.getChannelData(0).set(whiteNoise1, 0);
  // noiseBuffer1.getChannelData(1).set(whiteNoise1, 0);
  // noiseBuffer2.getChannelData(0).set(whiteNoise2, 0);
  // noiseBuffer2.getChannelData(1).set(whiteNoise2, 0);




  /**
   * WX.Noise
   */

  function Noise(params) {
    WX.UnitBase.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._noiseBuffer = getNoiseBuffer_Gaussian(9.73, WX.sampleRate);

    this.__init();

    this._modulationTargets = {
      'pGain': [this._nOutput.gain]
    };

    this.setParams(this.params);

    if (!this.params.pDynamic) {
      this.start();
    }
  }

  Noise.prototype = {

    defaultParams: {
      pLabel: 'Noise',
      pGrain: 1.0,
      pGain: 0.1,
      pDynamic: false
    },

    __init: function () {
      this._nNoise1 = WX.nSource();
      this._nNoise2 = WX.nSource();
      this._nNoise1.connect(this._nOutput);
      this._nNoise2.connect(this._nOutput);
      this._nNoise1.buffer = baseNoiseBuffer;
      this._nNoise2.buffer = this._noiseBuffer;
      this._nNoise1.loop = true;
      this._nNoise2.loop = true;
      this._nNoise1.loopStart = Math.random() * baseNoiseBuffer.duration;
      this._nNoise2.loopStart = Math.random() * this._noiseBuffer.duration;
    },

    _Grain: function (transType, time1, time2) {
      WX.$(this._nNoise1.playbackRate, this.params.pGrain, transType, time1, time2);
      WX.$(this._nNoise2.playbackRate, this.params.pGrain, transType, time1, time2);
    },

    start: function (time) {
      if (this.params.pDynamic) {
        this.__init();
      }
      this._nNoise1.start(time || WX.now);
      this._nNoise2.start(time || WX.now);
    },

    stop: function (time) {
      this._nNoise1.stop(time || WX.now);
      this._nNoise2.stop(time || WX.now);
    }

  };

  WX.extend(Noise.prototype, WX.UnitBase.prototype);
  WX.extend(Noise.prototype, WX.UnitOutput.prototype);

  WX.Noise = function (params) {
    return new Noise(params);
  };

})(WX);
