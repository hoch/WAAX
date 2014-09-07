/**
 * @wapl Noise
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */
(function (WX) {

  'use strict';

  // const noise type
  var NOISETYPE = [
    { key: 'White', value: 'white' },
    { key: 'Pink', value: 'pink' }
  ];

  // pre-generation of gaussian white noise
  // http://www.musicdsp.org/showone.php?id=113
  function createGaussian(duration) {
    var length = Math.floor(WX.srate * duration);
    var noiseFloat32 = new Float32Array(length);
    for (var i = 0; i < length; i++) {
      var r1 = Math.log(Math.random()), r2 = Math.PI * Math.random();
      noiseFloat32[i] = Math.sqrt(-2.0 * r1) * Math.cos(2.0 * r2) * 0.5;
    }
    var noiseBuffer = WX.Buffer(2, length, WX.srate);
    noiseBuffer.getChannelData(0).set(noiseFloat32, 0);
    noiseBuffer.getChannelData(1).set(noiseFloat32, 0);
    return noiseBuffer;
  }

  // NEEDS TO BE TESTED
  // pre-generation of pink noise
  // http://home.earthlink.net/~ltrammell/tech/pinkalg.htm
  // http://home.earthlink.net/~ltrammell/tech/pinkgen.c
  function createPink(duration) {
    var length = Math.floor(WX.srate * duration);
    var noiseFloat32 = new Float32Array(length);
    // pink noise specific
    var pA = [3.8024, 2.9694, 2.5970, 3.0870, 3.4006],
        pSum = [0.00198, 0.01478, 0.06378, 0.23378, 0.91578],
        pASum = 15.8564,
        sample = 0,
        contrib = [0.0, 0.0, 0.0, 0.0, 0.0];
    for (var i = 0; i < length; i++) {
      var ur1 = Math.random(), ur2 = Math.random();
      for (var j = 0; j < 5; j++) {
        if (ur1 <= pSum[j]) {
          sample -= contrib[j];
          contrib[j] = 2 * (ur2 - 0.5) * pA[j];
          sample += contrib[j];
          break;
        }
      }
      noiseFloat32[i] = sample / pASum;
    }
    // console.log(noiseFloat32); // debug
    var noiseBuffer = WX.Buffer(2, length, WX.srate);
    noiseBuffer.getChannelData(0).set(noiseFloat32, 0);
    noiseBuffer.getChannelData(1).set(noiseFloat32, 0);
    return noiseBuffer;
  }

  var _baseBufferGaus = createGaussian(10.0),
      _baseBufferPink = createPink(10.0);


  /**
   * [Noise description]
   * @param {[type]} preset [description]
   */
  function Noise(preset) {

    // REQUIRED: adding necessary modules
    WX.PlugIn.defineType(this, 'Generator');

    this._bufferGaus = createGaussian(9.73);
    this._bufferPink = createPink(9.73);

    this._src1 = WX.Source();
    this._src2 = WX.Source();
    this._src1.to(this._output);
    this._src2.to(this._output);
    this._src1.loop = true;
    this._src2.loop = true;
    this._src1.start(0);
    this._src2.start(0);

    WX.defineParams(this, {

      type: {
        type: 'Itemized',
        name: 'Type',
        default: 'white',
        model: NOISETYPE
      }

    });

    // REQUIRED: initializing instance with preset
    WX.PlugIn.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  Noise.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'Noise',
      version: '0.0.1',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Generator',
      description: 'White and Pink Noise Generator'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      type: 'white'
    },

    $type: function (value, time, rampType) {
      switch (value) {
        case 'white':
          this._src1.buffer = _baseBufferGaus;
          this._src2.buffer = this._bufferGaus;
          this._src1.loopStart = Math.random() * 10.0;
          break;
        case 'pink':
          this._src1.buffer = _baseBufferPink;
          this._src2.buffer = this._bufferPink;
          this._src1.loopStart = Math.random() * 10.0;
          break;
      }
    }

  };

  // REQUIRED: extending plug-in prototype with modules
  WX.PlugIn.extendPrototype(Noise, 'Generator');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.PlugIn.register(Noise);

})(WX);