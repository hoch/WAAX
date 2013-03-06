/**
 * @class Visualizer
 */
WX.Visualizer = function(json) {
  WX.Unit.Analyzer.call(this);
  Object.defineProperties(this, {
    _drawCallback: {
      enumerable: false,
      writable: true,
      value: function() {}
    },
    _canvas: {
      writable: true,
      value: null
    },
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
    _defaults: {
      value: {
        canvas: "canvas-wx-Visualizer",
        style: {
          color: "#0f0",
          bgcolor: "#000",
          width: 1.0
        }
      }
    }
  });
  // stuffs
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
  this.label += "Visualizer";
};

WX.Visualizer.prototype = Object.create(WX.Unit.Analyzer.prototype, {
  canvas: {
    enumerable: true,
    get: function() {
      return this._canvas;
    },
    set: function(canvasId) {
      this._canvas = document.getElementById(canvasId);
      if (this._canvas === null) {
        WX.error(this, "no valid canvas DOM.");
        return;
      }
      this._context2D = this._canvas.getContext('2d');
      // flip vertically
      // this._context2D.scale(1,-1);
      this.update();
    }
  },
  update: {
    value: function() {
      this._unitX = this._canvas.width / this._buffer.length;
      this._scaleY = this._canvas.height;
    }
  },
  style: {
    get: function() {
      if (this._context2D === null) {
        WX.error(this, "no context2D exists.");
        return;
      }
      var s = {
        color: this._context2D.strokeStyle,
        width: this._context2D.lineWidth,
        bgcolor: this._canvas.style.backgroundColor
      };
      return s;
    },
    set: function(json) {
      if (typeof json !== "object") {
        WX.error(this, "invalid JSON.");
        return;
      }
      this._context2D.strokeStyle = json.color || "#0f0";
      this._context2D.lineWidth = json.width || 1.0;
      this._canvas.style.backgroundColor = json.bgcolor || "#000";
    }
  },
  pause: {
    get: function() {
      return this._pause;
    },
    set: function(bool) {
      this._pause = bool;
    }
  },
  onRender: {
    set: function(userFunction) {
      this._drawCallback = userFunction;
    },
    get: function() {
      return this._drawCallback;
    }
  },
  draw: {
    value: function(event) {
      if (this._pause) {
        return;
      } else {
        this._analyzer.getByteTimeDomainData(this._buffer);
        this._drawCallback.call(this, this._context2D, this._buffer);
      }
    }
  }
});