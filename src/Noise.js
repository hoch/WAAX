(function (WX) {

  // creating white noise (gaussian distribution) buffer (10s)
  var bufferLength = WX.sampleRate * 10;
  var whiteNoise = new Float32Array(bufferLength);
  var noiseBuffer = WX.context.createBuffer(2, bufferLength, WX.sampleRate);
  // gaussian white noise
  // http://www.musicdsp.org/showone.php?id=113
  for (var i = 0; i < bufferLength; i++) {
    var r1 = Math.random(), r2 = Math.random();
    r1 = (r1 === 0.0) ? Number.MIN_VALUE : r1;
    whiteNoise[i] = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2);
  }
  noiseBuffer.getChannelData(0).set(whiteNoise, 0);
  noiseBuffer.getChannelData(1).set(whiteNoise, 0);


  /**
   * WX.Noise
   */

  function Noise(params) {
    WX.UnitBase.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nNoise = WX.nSource();
    this._nNoise.connect(this._nOutput);
    this._nNoise.buffer = noiseBuffer;
    this._nNoise.loop = true;
    this._nNoise.loopStart = Math.random() * this._nNoise.buffer.duration;

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

    _Grain: function (transType, time1, time2) {
      WX.$(this._nNoise.playbackRate, this.params.pGrain, transType, time1, time2);
    },

    start: function (time) {
      if (this.params.pDynamic) {
        this._nNoise = WX.nSource();
        this._nNoise.connect(this._nOutput);
        this._nNoise.buffer = _noiseBuffer;
        this._nNoise.loop = true;
        this._nNoise.loopStart = Math.random() * this._nNoise.buffer.duration;
      }
      this._nNoise.start(time || WX.now);
    },

    stop: function (time) {
      this._nNoise.stop(time || WX.now);
    }

  };

  WX.extend(Noise.prototype, WX.UnitBase.prototype);
  WX.extend(Noise.prototype, WX.UnitOutput.prototype);

  WX.Noise = function (params) {
    return new Noise(params);
  };

})(WX);