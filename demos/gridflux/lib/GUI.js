var GUI = (function () {

  /**
   * utilities
   */
  function _createDiv (className, parentDiv) {
    var div = document.createElement('div');
    div.className = className;
    if (parentDiv) {
      parentDiv.appendChild(div);
    }
    return div;
  }

  function _createList (listdata, itemClassName, parentDiv) {
    var list = document.createElement('ul');
    for (var i = 0; i < listdata.length; i++) {
      var item = document.createElement('li');
      item.id = listdata[i];
      item.className = itemClassName;
      item.textContent = listdata[i];
      list.appendChild(item);
    }
    if (parentDiv) {
      parentDiv.appendChild(list);
    }
    return list;
  }

  function _clamp (value, min, max) {
    return Math.max(Math.min(value, max), min);
  }


  /**
   * default styles
   */
  var _Style = {
    sliderWidth: 152,
    sliderHandleSize: 6,
    buttonWidth: 60,
    buttonLEDSize: 6,
    listWidth: 154
  };


  /**
   * @class Slider
   */
  Slider = function (name, options, target, callback) {
    // name of control (should be unique!)
    this._name = name;
    // create view and initialize value
    this._view = new SliderView(this, options, target);
    // callback to manager
    this._callback = callback;
    // control selection (for MIDI learning)
    this._selected = false;
    // set options
    this._exclude = (options.exclude || false); // excluding from preset saving

    // set option: scale
    if (options.scale === "log") {
      this.calculateValue = this._calculateValueLog;
      this.calculateNormValue = this._calculateNormValueLog;
    } else {
      this.calculateValue = this._calculateValueLinear;
      this.calculateNormValue = this._calculateNormValueLinear;
    }
    // set value and range
    this._value = options.value;
    this._min = options.min;
    this._max = options.max;
    this.calculateNormValue(this._value);

    // update view and ready to go!
    this.updateView();
  };

  Slider.prototype = {

    // onChange: view => control => manager & view
    onChange: function (normValue) {
      if (normValue === this._normValue) {
        return;
      }
      this._normValue = normValue;
      this.calculateValue(normValue);
      this._callback(this._name, "onchange", this._value);
      this.updateView();
    },
    // onSelectToggle: view => control => manager & view
    onSelectToggle: function () {
      this._selected = !this._selected;
      if (this._selected) {
        this._view.highlight(true);
        this._callback(this._name, "onselect", true);
      } else {
        this._view.highlight(false);
        this._callback(this._name, "onselect", false);
      }
    },
    // setValue: manager => control => view
    setValue: function (value) {
      this._value = value;
      this.calculateNormValue(value);
      this.updateView();
    },
    // updateView: control => view
    updateView: function () {
      this._view.update(this._value, this._normValue);
    },
    // isExcluded: is this controller excluded from preset?
    isExcluded: function () {
      return this._exclude;
    },

    // internal: get value from normvalue, linear
    _calculateValueLinear: function (normValue) {
      this._normValue = normValue;
      this._value = this._min + this._normValue * (this._max - this._min);
    },
    // internal: get value from normvalue, log
    _calculateValueLog: function (normValue) {
      this._normValue = normValue;
      var v1 = Math.log(this._min), v2 = Math.log(this._max);
      this._value = Math.exp(v1 + this._normValue * (v2 - v1));
    },
    // internal: get normvalue from value, linear
    _calculateNormValueLinear: function (value) {
      this._value = value;
      this._normValue = (this._value - this._min) / (this._max - this._min);
    },
    // internal: get normvalue from value, log
    _calculateNormValueLog: function (value) {
      this._value = value;
      var v1 = Math.log(this._min), v2 = Math.log(this._max), v = Math.log(this._value);
      this._normValue = (v - v1) / (v2 - v1);
    }
  };


  /**
   * @class SliderView
   */
  SliderView = function (control, options, target) {
    // bound controller
    this._control = control;
    // building divs
    this._view = _createDiv("ui-slider-view", target);
    this._touchable = _createDiv("ui-slider-touchable", this._view);
    this._display = _createDiv("ui-slider-display", this._touchable);
    this._bar = _createDiv("ui-slider-bar", this._touchable);
    this._label = _createDiv("ui-slider-label", this._view);
    this._value = _createDiv("ui-slider-value", this._display);
    this._unit = _createDiv("ui-slider-unit", this._display);
    this._handle = _createDiv("ui-slider-handle", this._bar);
    // set up styles
    this._view.style.width = (options.width || _Style.sliderWidth) + "px";
    this._handle.style.borderRightWidth = _Style.sliderHandleSize + "px";
    this._label.textContent = options.label;
    this._unit.textContent = options.unit;
    this._precision = options.precision || 0.1; // hack for discrete scale
    // various vars
    this._maxWidth = (options.width || _Style.sliderWidth) - _Style.sliderHandleSize;
    this._pos = 0;
    this._px = 0;
    this._py = 0;
    this._left = this._touchable.getBoundingClientRect().left;
    this._top = this._touchable.getBoundingClientRect().top;
    // event responders with object binding
    this._ref = {
      clicked: this.clicked.bind(this),
      dragged: this.dragged.bind(this),
      released: this.released.bind(this)
    };
    // activate slider for user interaction
    this._view.addEventListener("mousedown", this._ref.clicked, false);
  };

  SliderView.prototype = {

    // update slider position and value string (controller => view)
    update: function (value, normValue) {
      this._value.textContent = value.toFixed(this._precision);
      this._pos = normValue * (this._maxWidth);
      this._handle.style.width = this._pos + "px";
    },

    // onChange: report normValue to control
    onChange: function () {
      this._control.onChange(this._pos / this._maxWidth);
    },

    // event responders
    clicked: function (event) {
      event.stopPropagation();
      // select this controller when alt is pressed
      if (event.altKey) {
        this._control.onSelectToggle();
        return;
      }
      // add responders for move/up actions
      window.addEventListener("mousemove", this._ref.dragged, false);
      window.addEventListener("mouseup", this._ref.released, false);
      // set start point
      this._px = event.clientX - this._left;
      this._py = event.clientY - this._top;
      this._pos = _clamp(this._px, 0, this._maxWidth);
      this.onChange();
    },

    dragged: function (event) {
      event.stopPropagation();
      var x = event.clientX - this._left;
      var y = event.clientY - this._top;
      var dx = x - this._px;
      var dy = y - this._py;
      this._px = x;
      this._py = y;
      // shift key for fine controller
      // FIXME: take dx or dy. the control speed is a bit jittery...
      this._pos += (dx - dy) * (event.shiftKey ? 0.2 : 1);
      this._pos = _clamp(this._pos, 0, this._maxWidth);
      // report the result to controller
      this.onChange();
    },

    released: function (event) {
      event.stopPropagation();
      window.removeEventListener("mousemove", this._ref.dragged, false);
      window.removeEventListener("mouseup", this._ref.released, false);
    },

    // highlight this view when selected
    highlight: function (bool) {
      if (bool) {
        this._view.className += " ui-view-selected";
      } else {
        this._view.className = "ui-slider-view";
      }
    }
  };


  /**
   * @class Button
   */
  Button = function(name, options, target, callback) {
    this._name = name;
    // create view and initialize value
    this._view = new ButtonView(this, options, target);
    // callback to manager
    this._callback = callback;
    // target selection state
    this._selected = false;
    // set options: mode
    this._mode = options.mode;
    switch (options.mode) {
      case "oneshot":

        this.changed = this._changedOneShot;
        break;
      case "momentary":
        this.changed = this._changedMomentary;
        break;
      case "toggle":
        this.changed = this._changedToggle;
        break;
    }
    // set value
    this._value = options.value;
    // update view and ready to go!
    this.updateView();
  };

  Button.prototype = {
    onChange: function (action) {
      this.changed(action);
      this.updateView();
    },
    // controller section
    onSelectToggle: function() {
      this._selected = !this._selected;
      if (this._selected) {
        this._view.highlight(true);
        this._callback(this._name, "onselect", true);
      } else {
        this._view.highlight(false);
        this._callback(this._name, "onselect", true);
      }
    },
    // for preset saving
    setValue: function (value) {
      if (this._mode === "toggle") {
        this._value = value;
        this.updateView();
      }
    },
    updateView: function () {
      this._view.update(this._value);
    },
    // isExcluded: is this controller excluded from preset?
    isExcluded: function() {
      return this._exclude;
    },
    // changed in toggle mode
    _changedToggle: function (action) {
      if (action === "mousedown") {
        this._value = !this._value;
        this._callback(this._name, "onchange", this._value);
      }
    },
    // changed in momentary mode
    _changedMomentary: function (action) {
      if (action === "mousedown") {
        this._value = true;
      } else if (action === "mouseup") {
        this._value = false;
      }
      this._callback(this._name, "onchange", this._value);
    },
    // changed in oneshot mode
    _changedOneShot: function (action) {
      if (action === "mousedown") {
        this._value = true;
        this._callback(this._name, "onchange", this._value);
        // turn off led in 500ms
        setTimeout(function () {
          this._value = false;
          this.updateView();
        }.bind(this), 100);
      }
    },
  };


  /**
   * @class ButtonView
   */
  ButtonView = function(control, options, target) {
    // bound controller
    this._control = control;
    // building divs
    this._view = _createDiv("ui-button-view", target);
    this._touchable = _createDiv("ui-button-touchable", this._view);
    this._led = _createDiv("ui-button-led", this._touchable);
    this._label = _createDiv("ui-button-label", this._touchable);
    // set up styles
    this._view.style.width = (options.width || _Style.buttonWidth) + "px";
    this._led.style.width = (options.LEDwidth || _Style.buttonLEDSize) + "px";
    this._label.textContent = options.label;
    // function references
    this._ref = {
      clicked: this.clicked.bind(this),
      released: this.released.bind(this)
    };
    // activate button for user interaction
    this._view.addEventListener("mousedown", this._ref.clicked, false);
  };

  ButtonView.prototype = {
    // update slider position and value string (controller => view)
    update: function(bool) {
      if (bool) {
        this._led.className += " ui-button-led-on";
      } else {
        this._led.className = "ui-button-led";
      }
    },
    onChange: function (action) {
      this._control.onChange(action);
    },
    // event responders
    clicked: function(event) {
      event.stopPropagation();
      // select this controller when alt is pressed
      if (event.altKey) {
        this._controller.toggleSelect();
        return;
      }
      window.addEventListener("mouseup", this._ref.released, false);
      this.onChange("mousedown");
    },
    released: function(event) {
      event.stopPropagation();
      window.removeEventListener("mouseup", this._ref.released, false);
      this.onChange("mouseup");
    },
    // highlight this view when selected
    highlight: function(bool) {
      if (bool) {
        this._view.className += " ui-view-selected";
      } else {
        this._view.className = "ui-button-view";
      }
    }
  };



  /**
   * revealing components
   */
  return {
    createSlider: function (name, options, target, callback) {
      return new Slider(name, options, target, callback);
    },
    createButton: function (name, options, target, callback) {
      return new Button(name, options, target, callback);
    }
  };

})();