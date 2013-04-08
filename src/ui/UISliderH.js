/**
 * @class WX.UISliderH
 * @param {json} json value, offset, scale, default value
 */
WX.UISliderH = function(json) {
  Object.defineProperties(this, {
    _container: {
      value: document.createElement("div")
    },
    _placeholder: {
      value: document.createElement("div")
    },
    _control: {
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
    },
    _targetVal: {
      writable: true,
      value: null
    }
  });
  // build slider
  this._build(json);
  // set parameters
  this._rect = this._placeholder.getBoundingClientRect();
  this._params.val = this._params.defaultVal;
  // infer value from default value
  this._pos.x = (this._params.val - this._params.offset) / this._params.scale * (this._rect.width - 18);
  // capping between 0~(width-18); size of control
  this._pos.x = Math.min(this._rect.width - 18, Math.max(0, this._pos.x));
  this._control.style.left = this._pos.x + "px";
  // return a handle for this slider
  return this;
};

WX.UISliderH.prototype = Object.create(null, {
  _build: {
    value: function(json) {
      // compositing DOM
      this._container.appendChild(this._placeholder);
      this._container.appendChild(this._label);
      this._placeholder.appendChild(this._control);
      var d = json.targetDiv;
      if (d === undefined || d === null) {
        console.err("invalid UI panel div");
        throw "error";
      }
      d.appendChild(this._container);
      // styling
      this._container.style.left = json.x + "px";
      this._container.style.top = json.y + "px";
      this._container.className = "wx-sliderH-container";
      this._placeholder.className = "wx-sliderH-placeholder wx-gui-light";
      this._control.className = "wx-sliderH-control wx-gui-light";
      this._label.className = "wx-sliderH-label";
      this._label.textContent = json.label;
      // attaching event listener
      var me = this;
      this._placeholder.addEventListener("mousedown", function(event) {
        me._controlClicked.call(me, event);
      }, false);
    }
  },
  _controlClicked: {
    value: function(event) {
      event.preventDefault();
      // storing previous x
      this._prev.x = event.clientX - this._rect.left;
      // caching function references
      var me = this;
      WX.UIManager.selected = me;
      WX.UIManager.onDragged = function(event) {
        me._controlDragged.call(me, event);
      };
      WX.UIManager.onReleased = function(event) {
        me._controlReleased.call(me, event);
      };
      window.addEventListener("mousemove", WX.UIManager.onDragged, false);
      window.addEventListener("mouseup", WX.UIManager.onReleased, false);
    }
  },
  _controlDragged: {
    value: function(event) {
      event.preventDefault();
      var x = event.clientX - this._rect.left;
      var y = event.clientY - this._rect.top;
      var dx = x - this._prev.x;
      var dy = y - this._prev.y;
      this._pos.x += dx;
      // this._pos.y += dy;
      this._pos.x = Math.min(this._rect.width - 18, this._pos.x);
      this._pos.x = Math.max(0, this._pos.x);
      this._control.style.left = this._pos.x + "px";
      this._prev.x = x;
      // this._prev.y = y;
      // calculate value
      this._params.val = (this._pos.x / (this._rect.width - 18)) * this._params.scale + this._params.offset;
      this._label.textContent = this._params.val.toFixed(2);
      // setting parameter
      if (this._target) {
        this._target.setValueAtTime(this._params.val, 0);
      }
      if (this._targetValue) {
        this._targetValue.object[this._targetValue.property] = this._params.val;
      }
    }
  },
  _controlReleased: {
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
  target: {
    set: function(audioParam) {
      this._target = audioParam;
    },
    get: function() {
      return this._target;
    }
  },
  getValue: {
    value: function() {
      return this._params.val;
    }
  },
  setTargetValue: {
    value: function(obj, prop) {
      this._targetValue = {
        object: obj,
        property: prop
      };
    }
  }
});