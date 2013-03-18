WX.UISliderH = function(json) {
  Object.defineProperties(this, {
    _container: {
      value: document.createElement("div")
    },
    _groove: {
      value: document.createElement("div")
    },
    _handle: {
      value: document.createElement("div")
    },
    _label: {
      value: document.createElement("div")
    },
    _rect: {
      writable: true,
      value: null
    },
    _pos: {
      writable: true,
      value: {
        x: 0,
        y: 0
      }
    },
    _prev: {
      writable: true,
      value: {
        x: 0,
        y: 0
      }
    },
    _params: {
      writable: true,
      value: {
        val: json.value || 0.0 ,
        offset: json.offset || 0.0,
        scale: json.scale || 1.0,
        defaultVal: json.value || 0.0
      }
    },
    _target: {
      writable: true,
      value: null
    }
  });
  // build slider
  this._build(json);
  // set parameters
  this._rect = this._groove.getBoundingClientRect();
  this._params.val = this._params.defaultVal;
  this._pos.x = (this._params.val - this._params.offset) / this._params.scale * (this._rect.width - 20);
  this._pos.x = Math.min(this._rect.width - 20, this._pos.x);
  this._pos.x = Math.max(0, this._pos.x);
  this._handle.style.left = this._pos.x + "px";
  // return a handle for this slider
  return this;
};

WX.UISliderH.prototype = Object.create(null, {
  _build: {
    value: function(json) {
      // compositing DOM
      this._container.appendChild(this._groove);
      this._container.appendChild(this._label);
      this._groove.appendChild(this._handle);
      var d = json.targetDiv;
      if (d === undefined || d === null) {
        console.err("invalid UI panel div");
        throw "error";
      }
      d.appendChild(this._container);
      // styling
      this._container.style.left = json.x + "px";
      this._container.style.top = json.y + "px";
      this._container.className = "wx-slider-container";
      this._groove.className = "wx-slider-groove wx-slider-bg";
      this._handle.className = "wx-slider-handle wx-slider-bg";
      this._label.className = "wx-slider-label";
      this._label.textContent = json.label;
      // attaching event listener
      var me = this;
      this._groove.addEventListener("mousedown", function(event) {
        me._handleClicked.call(me, event);
      }, false);
    }
  },
  _handleClicked: {
    value: function(event) {
      event.preventDefault();
      // storing previous x
      this._rect = this._groove.getBoundingClientRect();
      this._prev.x = event.clientX - this._rect.left;
      // caching function references
      var me = this;
      WX.UIManager.selected = me;
      WX.UIManager.onDragged = function(event) {
        me._handleDragged.call(me, event);
      };
      WX.UIManager.onReleased = function(event) {
        me._handleReleased.call(me, event);
      };
      window.addEventListener("mousemove", WX.UIManager.onDragged, false);
      window.addEventListener("mouseup", WX.UIManager.onReleased, false);
    }
  },
  _handleDragged: {
    value: function(event) {
      event.preventDefault();
      var x = event.clientX - this._rect.left;
      var y = event.clientY - this._rect.top;
      var dx = x - this._prev.x;
      var dy = y - this._prev.y;
      this._pos.x += dx;
      // this._pos.y += dy;
      this._pos.x = Math.min(this._rect.width - 20, this._pos.x);
      this._pos.x = Math.max(0, this._pos.x);
      this._handle.style.left = this._pos.x + "px";
      this._prev.x = x;
      // this._prev.y = y;
      // calculate value
      this._params.val = (this._pos.x / (this._rect.width - 20)) * this._params.scale + this._params.offset;
      this._label.textContent = this._params.val.toFixed(2);
      // setting parameter
      if (this._target) {
        this._target.setValueAtTime(this._params.val, 0);
      }
    }
  },
  _handleReleased: {
    value: function(event) {
      event.preventDefault();
      window.removeEventListener("mousemove", WX.UIManager.onDragged, false);
      window.removeEventListener("mouseup", WX.UIManager.onReleased, false);
      WX.UIManager.selected = null;
      WX.UIManager.onClicked = null;
      WX.UIManager.onDragged = null;
      WX.UIManager.onReleased = null;
    }
  },
  getValue: function() {
    return this._params.val;
  },
  target: {
    set: function(audioParam) {
      this._target = audioParam;
    },
    get: function() {
      return this._target;
    }
  }
});