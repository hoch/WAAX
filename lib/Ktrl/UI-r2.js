/**
 * @namespace UI
 */
UI = (function() {

  function buildDiv (className, parentDiv) {
    var div = document.createElement('div');
    div.className = className;
    if (parentDiv) {
      parentDiv.appendChild(div);
    }
    return div;
  }

  Style = {
    sliderWidth: 140,
    sliderHandleSize: 6,
    toggleWidth: 70,
    toggleLEDWidth: 20,
    toggleLEDHeight: 20,
    dropdownWidth: 140,
    dropdownHeight: 20
  };

  return {
    buildDiv: buildDiv,
    Style: Style
  };
})();


/**
 * @class internal view class created by Control
 * @param  {DOMId} targetDivId target Div ID
 * @param  {object} controller controller for this view
 * @param  {int} displayPrecision precision for string values
 */
UI._SliderView = function (controller, targetDivId, displayPrecision) {
  // building divs
  this._view = UI.buildDiv("ui-slider-view", targetDivId);
  this._touchable = UI.buildDiv("ui-slider-touchable", this._view);
  this._display = UI.buildDiv("ui-slider-display", this._touchable);
  this._bar = UI.buildDiv("ui-slider-bar", this._touchable);
  this._label = UI.buildDiv("ui-slider-label", this._view);
  this._value = UI.buildDiv("ui-slider-value", this._display);
  this._unit = UI.buildDiv("ui-slider-unit", this._display);
  this._handle = UI.buildDiv("ui-slider-handle", this._bar);
  // set up styles
  this._view.style.width = UI.Style.sliderWidth + "px";
  this._handle.style.borderRightWidth = UI.Style.sliderHandleSize + "px";
  // vars
  this._maxWidth = UI.Style.sliderWidth - UI.Style.sliderHandleSize;
  this._pos = 0;
  this._px = 0;
  this._py = 0;
  this._left = this._touchable.getBoundingClientRect().left;
  this._top = this._touchable.getBoundingClientRect().top;
  this._precision = displayPrecision || 2;
  // bound controller
  this._controller = controller;
  // function references
  this._ref = {
    clicked: this.clicked.bind(this),
    dragged: this.dragged.bind(this),
    released: this.released.bind(this),
    selected: this.selected.bind(this)
  };
  // activate slider for user interaction
  this.activate();
};

UI._SliderView.prototype = {

  // set name and unit
  setInfo: function (name, unit) {
    this._label.textContent = name;
    this._unit.textContent = unit;
  },

  // update slider position and value string (by controller)
  update: function (normValue, displayValue) {
    this._value.textContent = displayValue.toFixed(this._precision);
    this._pos = normValue * (this._maxWidth);
    this._handle.style.width = this._pos + "px";
  },

  // report norm value to controller
  report: function () {
    this._controller.setNormValue(this._pos / this._maxWidth);
  },

  // register this slider with event listeners
  activate: function () {
    // click - drag - release cycle
    this._touchable.addEventListener("mousedown", this._ref.clicked, false);
    // activate view for selection
    this._view.addEventListener("mousedown", this._ref.selected, false);
  },

  clicked: function (event) {
    // set start point
    this._px = event.clientX - this._left;
    this._py = event.clientY - this._top;
    window.addEventListener("mousemove", this._ref.dragged, false);
    window.addEventListener("mouseup", this._ref.released, false);
  },

  dragged: function (event) {
    var x = event.clientX - this._left;
    var y = event.clientY - this._top;
    var dx = x - this._px;
    var dy = y - this._py;
    this._px = x;
    this._py = y;
    // shift key for fine controller
    this._pos += (dx - dy) * (event.shiftKey ? 0.2 : 1);
    this._pos = Math.max(Math.min(this._pos, this._maxWidth), 0);
    // report the result to controller
    this.report();
  },

  released: function (event) {
    window.removeEventListener("mousemove", this._ref.dragged, false);
    window.removeEventListener("mouseup", this._ref.released, false);
  },

  selected: function (event) {
    if (event.altKey) {
      this._controller.select();
    }
  }
};


/**
 * @class UI.SliderController, controller object for slider view
 * @param  {string} name name of parameter
 * @param  {string} unit parameter unit (Hz, dB, cents, etc...)
 * @param  {float} defaultValue default value
 * @param  {float} minValue minimum value
 * @param  {float} maxValue maximum value
 * @param  {object} options options in json (containerId, precision, logscale...)
 */
UI.SliderController = function (name, unit, defaultValue, minValue, maxValue, options) {
  // slider view for this controller
  this._view = new UI._SliderView(this, options.container, options.precision);
  // vars
  this._name = name;
  this._unit = unit;
  // value displayed
  this._value = defaultValue;
  this._minValue = minValue;
  this._maxValue = maxValue;
  // value normalized
  this._normValue = (this._value - this._minValue) / (this._maxValue - this._minValue);
  this._logScale = (options.logScale || false);
  this.calculateValue = this._logScale ? this._calculateValueLog : this._calculateValueLinear;
  // initialize view
  this.onchange = function () {};
  this.initializeView();
};

UI.SliderController.prototype = {

  // get value from normvalue, linear
  _calculateValueLinear: function () {
    this._value = this._minValue + this._normValue * (this._maxValue - this._minValue);
  },

  // get value from normvalue, log
  _calculateValueLog: function () {
    var max = Math.log(this._maxValue),
        min = Math.log(this._minValue);
    this._value = Math.exp(min + this._normValue * (max - min));
  },

  getControllerData: function () {
    var obj = {
      name: this._name,
      unit: this._unit,
      value: this._value,
      minValue: this._minValue,
      maxValue: this._maxValue,
      logScale: this._logScale
    };
    return obj;
  },

  setNormValue: function (normValue) {
    this._normValue = normValue;
    this.calculateValue();
    this.updateView();
  },

  setValue: function (value) {
    this._value = value;
    this._normValue = (this._value - this._minValue) / (this._maxValue - this._minValue);
    this.updateView();
  },

  updateView: function () {
    this._view.update(this._normValue, this._value);
    this.onchange(this._value);
  },

  initializeView: function () {
    this._view.setInfo(this._name, this._unit);
    this.updateView();
  }
};


/**
 * ToggleView
 * @param  {[type]} controller  [description]
 * @param  {[type]} targetDivId [description]
 * @return {[type]}             [description]
 */
UI._ToggleView = function (controller, targetDivId) {
  // building divs
  this._view = UI.buildDiv("ui-toggle-view", targetDivId);
  this._touchable = UI.buildDiv("ui-toggle-touchable", this._view);
  this._led = UI.buildDiv("ui-toggle-led", this._touchable);
  this._label = UI.buildDiv("ui-toggle-label", this._touchable);

  // set up styles
  this._view.style.width = UI.Style.toggleWidth + "px";
  this._led.style.width = UI.Style.toggleLEDWidth + "px";
  this._led.style.height = UI.Style.toggleLEDHeight + "px";
  // bound controller
  this._controller = controller;
  // function references
  this._ref = {
    clicked: this.clicked.bind(this),
    selected: this.selected.bind(this)
  };
  // activate button for user interaction
  this.activate();
};

UI._ToggleView.prototype = {

  // set name and unit
  setInfo: function (name) {
    this._label.textContent = name;
  },

  // update slider position and value string (by controller)
  update: function (bool) {
    if (bool) {
      this._led.className += "-highlight";
    } else {
      this._led.className = "ui-toggle-led";
    }
  },

  // report norm value to controller
  report: function () {
    this._controller.toggle();
  },

  // register this slider with event listeners
  activate: function () {
    // click - drag - release cycle
    this._touchable.addEventListener("mousedown", this._ref.clicked, false);
    // activate view for selection
    this._view.addEventListener("mousedown", this._ref.selected, false);
  },

  clicked: function (event) {
    // set start point
    this.report();
  },

  selected: function (event) {
    if (event.altKey) {
      this._controller.select();
    }
  }
};


UI.ToggleController = function (name, defaultValue, options) {
  // slider view for this controller
  this._view = new UI._ToggleView(this, options.container);
  // vars
  this._name = name;
  // value displayed
  this._value = defaultValue;
  // initialize view
  this.initializeView();
};

UI.ToggleController.prototype = {

  getControllerData: function () {
    var obj = {
      name: this._name,
      unit: this._unit,
      value: this._value
    };
    return obj;
  },

  toggle: function () {
    this._value = !this._value;
    this.updateView();
  },

  updateView: function () {
    this._view.update(this._value);
  },

  initializeView: function () {
    this._view.setInfo(this._name, this._unit);
    this.updateView();
  }
};


/**
 * @class Control Center, managing all the controller in one place
 */
UI.ControlCenter = function () {
  this.routeMap = {};
  this.mode = "Performance"; // or MIDILearn
  this.MIDILearnTargets = [];

  this.controllers = [];
  this.presets = [];
};