/**
 * @class internal view class created by controller
 * @param  {object} controller controller for this view
 * @param  {DOMId} targetDivId target Div ID
 */
UI._SliderView = function (controller, section) {
  // building divs
  this._view = UI.buildDiv("ui-slider-view", section);
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
  setText: function (name, unit) {
    this._label.textContent = name;
    this._unit.textContent = unit;
  },

  // update slider position and value string (by controller)
  update: function (normValue, displayValue) {
    this._value.textContent = displayValue;
    this._pos = normValue * (this._maxWidth);
    this._handle.style.width = this._pos + "px";
  },

  highlight: function (bool) {
    if (bool) {
      this._view.className += " ui-view-selected";
    } else {
      this._view.className = "ui-slider-view";
    }
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
      this._controller.toggleSelect();
    }
  }
};



/**
 * @class controller object, parameter logic and calculation
 * @param  {string} name name of parameter
 * @param  {string} unit parameter unit (Hz, dB, cents, etc...)
 * @param  {float} defaultValue default value
 * @param  {float} minValue minimum value
 * @param  {float} maxValue maximum value
 * @param  {object} options options in json (containerId, precision, logscale...)
 */
UI.SliderController = function (params, section) {
  // slider view for this controller
  this._view = new UI._SliderView(this, section);
  this._selected = false;
  // vars
  this._name = params.name;
  this._unit = params.unit;
  // value displayed
  this._value = params.value;
  this._min = params.min;
  this._max = params.max;
  this._precision = params.precision || 0.1; // hack for integer display
  // value normalized
  this._normValue = (this._value - this._min) / (this._max - this._min);
  // scale type = log || linear
  this._scale = params.scale;
  if (this._scale === "log") {
    this.calculateValue = this._calculateValueLog;
    this.calculateNormValue = this._calculateNormValueLog;
  } else {
    this.calculateValue = this._calculateValueLinear;
    this.calculateNormValue = this._calculateNormValueLinear;
  }
  // callback functions to push values to synth params
  this._callbacks = [];
  // initialize view
  this.initializeView();
};

UI.SliderController.prototype = {

  // get value from normvalue, linear
  _calculateValueLinear: function () {
    this._value = this._min + this._normValue * (this._max - this._min);
  },

  // get value from normvalue, log
  _calculateValueLog: function () {
    var v1 = Math.log(this._min), v2 = Math.log(this._max);
    this._value = Math.exp(v1 + this._normValue * (v2 - v1));
  },

  _calculateNormValueLinear: function () {
    this._normValue = (this._value - this._min) / (this._max - this._min);
  },

  _calculateNormValueLog: function () {
    var v1 = Math.log(this._min), v2 = Math.log(this._max), v = Math.log(this._value);
    this._normValue = (v - v1) / (v2 - v1);
  },

  // set normValue, update displayValue, update view, execute callbacks 
  setNormValue: function (normValue) {
    this._normValue = normValue;
    this.calculateValue();
    this._view.update(this._normValue, this._value.toFixed(this._precision));
    this.runActions();
  },

  // set displayValue, update normValue, update view, execute callbacks
  // TODO: need to have separate function for log and linear
  setValue: function (value) {
    this._value = value;
    this.calculateNormValue();
    this._view.update(this._normValue, this._value.toFixed(this._precision));
    this.runActions();
  },

  updateView: function () {
    this._view.update(this._normValue, this._value.toFixed(this._precision));
  },

  runActions: function () {
    for (var i = 0; i < this._callbacks.length; i++) {
      this._callbacks[i](this._value);
    }
  },

  addAction: function (fn) {
    this._callbacks.push(fn);
  },

  initializeView: function () {
    this._view.setText(this._name, this._unit);
    this._view.update(this._normValue, this._value.toFixed(this._precision));
  },

  toggleSelect: function () {
    this._selected = !this._selected;
    if (this._selected) {
      this._view.highlight(true);
      UI.ControlCenter.addControllerToSelection(this);
    } else {
      this._view.highlight(false);
      UI.ControlCenter.removeControllerFromSelection(this);
    }
  },

  getParams: function () {
    var params = {
      type: "slider",
      name: this._name,
      unit: this._unit,
      value: this._value,
      min: this._min,
      max: this._max,
      precision: this._precision,
      scale: this._scale
    };
    return params;
  }
};