(function (WX) {

  var renderSetting = {
    binCount: this._nAnalyzer.frequencyBinCount,
    binSize: WX.sampleRate / this._nAnalyzer.frequencyBinCount,
    logbase: 2.0,
    logmax: Math.log((this._nAnalyzer.frequencyBinCount - 1) / 1.0, 2.0),
    xAxisLabel: [30, 65, 125, 250, 500, 1000, 2000, 4000, 8000, 16000],
    baseX: 0.0,
    unitX: 0.0,
    scaleY: 0.0
  };

  /**
   * WX.Spectrum
   */

  function Spectrum(params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nAnalyzer = WX.nAnalyzer();
    this._nInput.connect(this._nAnalyzer);
    this._ctx2d = null;
    this._buffer = new Float32Array(this._nAnalyzer.frequencyBinCount);

    this._renderSetting = {
      binCount: this._nAnalyzer.frequencyBinCount,
      binSize: WX.sampleRate / this._nAnalyzer.frequencyBinCount,
      logbase: 2.0,
      logmax: Math.log((this._nAnalyzer.frequencyBinCount - 1) / 1.0, 2.0),
      xAxisLabel: [30, 65, 125, 250, 500, 1000, 2000, 4000, 8000, 16000],
      baseX: 0.0,
      unitX: 0.0,
      scaleY: 0.0
    };

    this.setParams(this.params);
  }

  Spectrum.prototype = {

    defaultParams: {
      pLabel: 'spectrum',
      pAutoClear: true,
      pShowGrid: false,
      pSmoothingTimeConstant: 0.9,
      pMaxDecibels: 0.0,
      pMinDecibels: -100.0,
      pScale: 'log'
    },

    _setSmoothingTimeConstant: function (value) {
      this._nAnalyzer.smoothingTimeConstant = value;
    },

    _setMaxDecibels: function (value) {
      this._nAnalyzer.maxDecibels = value;
    },

    _setMinDecibels: function (value) {
      this._nAnalyzer.minDecibels = -100.0;
    },

    _updateSize: function () {
      this._renderSetting.baseX = this._ctx2d.canvas.width / 4.0;
      this._renderSetting.unitX = this._ctx2d.canvas.width / this._buffer.length;
      this._renderSetting.scaleY = this._ctx2d.canvas.height;
    },

    setContext2D: function (context) {
      this._ctx2d = context;
      this._updateSize();
    },

    draw: function (color, gridColor) {
      var c = this._ctx2d, p = this.params, s = this._renderSetting;
      if (p.pAutoClear) {
        c.clearRect(0, 0, c.canvas.width, c.canvas.height);
      }
      if (p.pShowGrid) {
        this.drawGrid(gridColor);
      }
      // drawing spectrum
      c.lineWidth = 0.75;
      c.strokeStyle = (color || "#222");
      c.beginPath();
      this._nAnalyzer.getFloatFrequencyData(this._buffer);
      for(var i = 1; i < s.binCount; ++i) {
        if (p.pScale === 'linear') {
          c.moveTo(i * s.unitX, s.scaleY);
          c.lineTo(i * s.unitX, (this._buffer[i] * -0.01) * s.scaleY);
        } else {
          var x = c.canvas.width * Math.log(i / 1, s.logbase) / s.logmax;
          c.lineTo(x, (this._buffer[i] * -0.01) * s.scaleY);
        }
      }
      c.stroke();
    },

    drawGrid: function (gridColor) {
      var c = this._ctx2d;
      c.lineWidth = 0.5;
      c.strokeStyle = (gridColor || "#666");
      c.beginPath();
      var numOctaves = 10, nyquist = WX.sampleRate * 0.5;
      for (var oct = 0; oct < numOctaves; ++oct) {
        var x = oct * c.canvas.width / numOctaves;
        var f = nyquist * Math.pow(2.0, oct - numOctaves);
        c.moveTo(x, 0.0);
        c.lineTo(x, c.canvas.height);
        c.fillText(~~(f) + "Hz", x + 5, c.canvas.height - 10);
      }
      var numDecibelGrid = 100 / 6; // -100dB with 6dB grid size
      for (var grid = 0; grid < numDecibelGrid; ++grid) {
        var y = grid * c.canvas.height / numDecibelGrid;
        var d = 0.0 + (-6 * grid);
        c.moveTo(0.0, y);
        c.lineTo(c.canvas.width, y);
        c.fillText(~~(d) + "dB", c.canvas.width - 30, y + 15);
      }
      c.stroke();
    }

  };

  WX.extend(Spectrum.prototype, WX.UnitTemplate.prototype);

  WX.Spectrum = function (params) {
    return new Spectrum(params);
  };

})(WX);