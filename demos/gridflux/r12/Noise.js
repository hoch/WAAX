(function (WX) {

  // creating white noise (gaussian distribution) buffer (10s)
  var _bufferLength = WX.sampleRate * 10;
  var _whiteNoise = new Float32Array(_bufferLength);
  var _noiseBuffer = WX.context.createBuffer(2, _bufferLength, WX.sampleRate);
  // gaussian white noise
  // http://www.musicdsp.org/showone.php?id=113
  for (var i = 0; i < _bufferLength; i++) {
    var r1 = Math.random(), r2 = Math.random();
    r1 = (r1 === 0.0) ? Number.MIN_VALUE : r1;
    _whiteNoise[i] = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2);
  }
  _noiseBuffer.getChannelData(0).set(_whiteNoise, 0);
  _noiseBuffer.getChannelData(1).set(_whiteNoise, 0);


  function Noise(params) {

    WX.UnitTemplate.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);
    this._removeInlet();

    this._nNoise = WX.context.createBufferSource();
    this._nOutput = WX.context.createGain();

    this._nNoise.buffer = _noiseBuffer;
    this._nNoise.loop = true;
    this._nNoise.loopStart = Math.random() * this._nNoise.buffer.duration;

    this._nNoise.connect(this._nOutput);
    this._nOutput.connect(this._nActive);
    if (!this.params.pDynamic) {
      this.start();
    }

    this.setParams(this.params);

  }

  Noise.prototype = {

    defaultParams: {
      pRate: 1.0,
      pGain: 0.1,
      pDynamic: false
    },

    _setRate: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nNoise.playbackRate, value, transType, time1, time2);
    },

    start: function (time) {
      this._nNoise.start(time || WX.now);
    },
    stop: function (time) {
      this._nNoise.stop(time || WX.now);
    }

  };

  WX.extend(Noise.prototype, WX.UnitTemplate.prototype);

  WX.Noise = function (params) {
    return new Noise(params);
  };

})(WX);