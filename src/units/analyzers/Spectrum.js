/**
 * @class Spectrum
 */
WX.Spectrum = function(json) {
  WX.Unit.Analyzer.call(this);
  this.label += "Spectrum";
  Object.defineProperties(this, {
    _context2D: {
      writable: true,
      value: null
    },
    _buffer: {
      writable: true,
      value: new Uint8Array(this._analyzer.frequencyBinCount)
    },
    _pause: {
      writable: true,
      value: false
    },
    _autoClear: {
      writable: true,
      value: true
    },
    _defaults: {
      value: {
      }
    }
  });
  // handling parameters
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
};

WX.Spectrum.prototype = Object.create(WX.Unit.Analyzer.prototype, {
  _updateSize: {
    value: function() {
      this._unitX = this._context2D.canvas.width / this._buffer.length;
      this._scaleY = this._context2D.canvas.height;
    }
  },
  context: {
    enumerable: true,
    get: function() {
      return this._context2D;
    },
    set: function(ctx) {
      if (ctx === undefined || ctx === null) {
        WX.error(this, "invalid drawing context.");
      } else {
        // TODO: check if ctx is valid context
        this._context2D = ctx;
        this._updateSize();
      }
    }
  },
  pause: {
    enumerable: true,
    get: function() {
      return this._pause;
    },
    set: function(bool) {
      this._pause = bool;
    }
  },
  autoClear: {
    enumerable: true,
    get: function() {
      return this._autoClear;
    },
    set: function(bool) {
      this._autoClear = bool;
    }
  },
  draw: {
    value: function(event) {
      if (this._pause) {
        return;
      } else {
        this._analyzer.getByteFrequencyData(this._buffer);
        var c = this._context2D;
        if (this._autoClear) {
          c.clearRect(0, 0, c.canvas.width, c.canvas.height);
        }
        c.beginPath();
        c.moveTo(0, (1.0 - this._buffer[i]/255) * this._scaleY);
        for(var i = 1, b = this._buffer.length; i < b; ++i) {
          c.lineTo(i * this._unitX, (1.0 - this._buffer[i]/255) * this._scaleY);
        }
        c.stroke();
      }
    }
  }
});