WX.UIKnob = function(json) {
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
    _angle: {
      writable: true,
      value:  0
    },
    _prevAngle: {
      writable: true,
      value: 0
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
    _targetValue: {
      writable: true,
      value: null
    }
  });
  // build slider
  this._build(json);
  // set parameters
  this._rect = this._placeholder.getBoundingClientRect();
  this._params.val = this._params.defaultVal;
  // infer angle from default value (offset for actual knob position)
  this._angle = ((this._params.val - this._params.offset) / this._params.scale) * 270 + 45;
  // capping value between 45~315 (PI/4 ~ PI*7/4)
  this._angle = Math.min(315, Math.max(45, this._angle));
  // rotate DOM
  this._control.style.webkitTransform = "rotate(" + this._angle + "deg)";
  // return a handle for this slider
  return this;
};

WX.UIKnob.prototype = Object.create(null, {
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
      this._container.className = "wx-knob-container";
      this._placeholder.className = "wx-knob-placeholder wx-gui-light";
      this._control.className = "wx-knob-control wx-gui-light";
      this._label.className = "wx-knob-label";
      this._label.textContent = json.label;
      // attaching event listener
      var me = this;
      this._placeholder.addEventListener("mousedown", function(event) {
        me._handleClicked.call(me, event);
      }, false);
    }
  },
  _getCurrentAngle: {
    value: function(ex, ey) {
      var x = this._rect.left + (this._rect.width / 2.0) - ex;
      var y = this._rect.top + (this._rect.height / 2.0) - ey;
      var a = Math.atan2(y, x) * 180/Math.PI + 90;
      return (a > 0) ? a : (a + 360);
    }
  },
  _handleClicked: {
    value: function(event) {
      event.preventDefault();
      // storing starting angle
      this._prevAngle = this._getCurrentAngle(event.clientX, event.clientY);
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
      var a = this._getCurrentAngle(event.clientX, event.clientY);
      var delta = a - this._prevAngle;
      // if delta is moving too much, ignore it
      if (delta > 180 || delta < -180) {
        return;
      }
      this._angle += delta;
      this._angle = Math.min(315, Math.max(45, this._angle));
      this._control.style.webkitTransform = "rotate(" + this._angle + "deg)";
      // calculate value
      this._params.val = (this._angle - 45) / 270 * this._params.scale + this._params.offset;
      this._label.textContent = this._params.val.toFixed(2);
      this._prevAngle = a;
      // setting parameter
      if (this._target) {
        this._target.setValueAtTime(this._params.val, 0);
      }
      if (this._targetValue) {
        this._targetValue.object[this._targetValue.property] = this._params.val;
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