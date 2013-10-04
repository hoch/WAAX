(function (WX) {


  /**
   * WX.StereoVisualizer
   */

  function StereoVisualizer(params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nAnalyzer1 = WX.nAnalyzer();
    this._nAnalyzer2 = WX.nAnalyzer();
    var _nSplitter = WX.nSplitter(2);

    this._nInput.connect(_nSplitter);
    _nSplitter.connect(this._nAnalyzer1, 0, 0);
    _nSplitter.connect(this._nAnalyzer2, 1, 0);

    this._f32Buffer1 = new Float32Array(this._nAnalyzer1.frequencyBinCount);
    this._f32Buffer2 = new Float32Array(this._nAnalyzer2.frequencyBinCount);
    this._u8Buffer1 = new Uint8Array(this._nAnalyzer1.frequencyBinCount);
    this._u8Buffer2 = new Uint8Array(this._nAnalyzer2.frequencyBinCount);

    this.setParams(this.params);
  }

  StereoVisualizer.prototype = {

    defaultParams: {
      pLabel: 'StereoVisualizer',
      pSmoothingTimeConstant: 0.9,
      pMaxDecibels: 0.0,
      pMinDecibels: -60.0,
    },

    _SmoothingTimeConstant: function () {
      this._nAnalyzer1.smoothingTimeConstant = this.params.pSmoothingTimeConstant;
      this._nAnalyzer2.smoothingTimeConstant = this.params.pSmoothingTimeConstant;
    },

    _MaxDecibels: function () {
      this._nAnalyzer1.maxDecibels = this.params.pMaxDecibels;
      this._nAnalyzer2.maxDecibels = this.params.pMaxDecibels;
    },

    _MinDecibels: function () {
      this._nAnalyzer1.minDecibels = this.params.pMinDecibels;
      this._nAnalyzer2.minDecibels = this.params.pMinDecibels;
    },

    _ondraw: function (buffer1, buffer2) {
      // ondraw callback with buffers, user-defined
    },

    drawSpectrum: function () {
      this._nAnalyzer1.getFloatFrequencyData(this._f32Buffer1);
      this._nAnalyzer2.getFloatFrequencyData(this._f32Buffer2);
      this._ondraw(this._f32Buffer1, this._f32Buffer2);
    },

    drawWaveform: function () {
      this._nAnalyzer1.getByteTimeDomainData(this._u8Buffer1);
      this._nAnalyzer2.getByteTimeDomainData(this._u8Buffer2);
      this._ondraw(this._u8Buffer1, this._u8Buffer2);
    },

    onDraw: function (fn) {
      this._ondraw = fn;
    }

  };

  WX.extend(StereoVisualizer.prototype, WX.UnitBase.prototype);
  WX.extend(StereoVisualizer.prototype, WX.UnitInput.prototype);

  WX.StereoVisualizer = function (params) {
    return new StereoVisualizer(params);
  };

})(WX);