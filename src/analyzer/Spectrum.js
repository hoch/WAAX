/*
  Copyright 2013, Google Inc.
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are
  met:

      * Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the following disclaimer
  in the documentation and/or other materials provided with the
  distribution.
      * Neither the name of Google Inc. nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


/**
 * wx._unit.spectrum : WX.Spectrum
 * @file spectrum renderer
 */
WX._unit.spectrum = function (options) {
  // initiate analyzer wrapper : pre-build
  WX._unit.analyzer.call(this);
  // build unit
  this._analyzer.maxDecibels = 0.0;
  this._analyzer.minDecibels = -100.0;
  this._analyzer.smoothingTimeConstant = 0.8;
  this._context2D = null;
  this._buffer = new Float32Array(this._analyzer.frequencyBinCount);
  this._pause = false;
  this._autoclear = true;
  this._grid = false;
  var logbase = 2;
  this._renderParams = {
    binCount: this._analyzer.frequencyBinCount,
    binSize: WX.context.sampleRate / this._analyzer.frequencyBinCount,
    logbase: logbase,
    logmax: Math.log((this._analyzer.frequencyBinCount - 1) / 1, logbase),
    xAxisLabel: [30, 65, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
  };
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.spectrum.prototype = {

  label: "spectrum",

  _default: {
    pause: false,
    autoClear: true
  },

  _updateSize: function() {
    this._baseX = this._context2D.canvas.width / 4.0;
    this._unitX = this._context2D.canvas.width / this._buffer.length;
    this._scaleY = this._context2D.canvas.height;
  },

  context: function(ctx) {
    if (ctx === undefined) {
      return this._context2D;
    } else {
      if (ctx.constructor.name !== "CanvasRenderingContext2D") {
        WX.error(this, "invalid drawing context.");
      } else {
        this._context2D = ctx;
        this._updateSize();
      }
    }
  },

  pause: function(bool) {
    if (typeof bool === 'undefined') {
      return this._pause;
    } else {
      this._pause = bool;
    }
  },

  autoClear: function(bool) {
    if (typeof bool === 'undefined') {
      return this._autoclear;
    } else {
      this._autoclear = bool;
    }
  },

  grid: function(bool) {
    if (typeof bool === 'undefined') {
      return this._grid;
    } else {
      this._grid = bool;
    }
  },

  smoothingFactor: function (factor) {
    if (typeof factor === 'undefined') {
      return this._analyzer.smoothingTimeConstant;
    } else {
      factor = Math.min(1.0, Math.max(0.0, factor));
      this._analyzer.smoothingTimeConstant = factor;
    }
  },

  // REF: http://stackoverflow.com/questions/8586216/linear-x-logarithmic-scale
  draw: function () {
    if (this._pause) {
      return;
    }
    var c = this._context2D;
    if (this._autoclear) {
      c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    }
    if (this._grid) {
      c.lineWidth = 0.5;
      c.strokeStyle = "#333",
      c.beginPath();
      var numOctaves = 10;
      var nyquist = WX.context.sampleRate * 0.5;
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
    this._analyzer.getFloatFrequencyData(this._buffer);
    c.beginPath();
    for(var i = 1; i < this._renderParams.binCount; ++i) {
      // linear scale drawing
      // c.moveTo(i * this._unitX, this._scaleY);
      // c.lineTo(i * this._unitX, (this._buffer[i] * -0.01) * this._scaleY);
      // logarithmic scale drawing
      var x = c.canvas.width * Math.log(i / 1, this._renderParams.logbase) / this._renderParams.logmax;
      c.lineTo(x, (this._buffer[i] * -0.01) * this._scaleY);
    }
    c.stroke();
  }
};

WX._unit.extend(WX._unit.spectrum.prototype, WX._unit.generator.prototype);