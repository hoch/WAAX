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
 * WX.waveform : WX.Waveform
 * @file waveform drawer
 */
WX._unit.waveform = function (options) {
  // initiate analyzer wrapper : pre-build
  WX._unit.analyzer.call(this);
  // build unit
  this._context2D = null;
  this._buffer = new Uint8Array(this._analyzer.frequencyBinCount);
  this._pause = false;
  this._autoclear = true;
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.waveform.prototype = {
  label: "waveform",
  _default: {
  },

  _updateSize: function() {
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

  draw: function() {
    if (this._pause) {
      return;
    } else {
      this._analyzer.getByteTimeDomainData(this._buffer);
      var c = this._context2D;
      if (this._autoclear) {
        c.clearRect(0, 0, c.canvas.width, c.canvas.height);
      }
      c.beginPath();
      c.moveTo(0, (1.0 - this._buffer[0]/255) * this._scaleY);
      for(var i = 1, b = this._buffer.length; i < b; ++i) {
        c.lineTo(i * this._unitX, (1.0 - this._buffer[i]/255) * this._scaleY);
      }
      c.stroke();
    }
  }
};

WX._unit.extend(WX._unit.waveform.prototype, WX._unit.generator.prototype);