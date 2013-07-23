/**
 * @class UI.SliderController
 * @param  {object} params { name, unit, value, min, max, precision, scale }
 * @param  {object} section target UI.Section object
 */
UI.SliderController = function (params, section) {
  // storage for action callbacks
  this._actions = [];
  // target selection state
  this._selected = false;
  // set params
  this.setParams(params);
  // create view and initialize value
  this._view = new UI._SliderView(this, section);
  // update value and do actions
  this.setValue(this._value);
};

UI.SliderController.prototype = {
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
  },

  // set normValue, update displayValue, update view, execute callbacks 
  setNormValue: function (normValue) {
    this.calculateValue(normValue);
    this._view.update(this._normValue, this._value.toFixed(this._precision));
    this._runActions();
  },
  // set displayValue, update normValue, update view, execute callbacks
  // TODO: need to have separate function for log and linear
  setValue: function (value) {
    this.calculateNormValue(value);
    this._view.update(this._normValue, this._value.toFixed(this._precision));
    this._runActions();
  },

  // getters
  getValue: function () {
    var value = {
      name: this._name,
      value: this._value
    };
    return value;
  },
  getName: function () {
    return this._name;
  },
  getUnit: function () {
    return this._unit;
  },

  // add action callback to this controller object
  addAction: function (fn) {
    this._actions.push(fn);
  },
  // internal: run all action callbacks
  _runActions: function () {
    for (var i = 0; i < this._actions.length; i++) {
      this._actions[i](this._value);
    }
  },

  // controller selection
  toggleSelect: function () {
    this._selected = !this._selected;
    if (this._selected) {
      this._view.highlight(true);
      UI.ControlCenter.addControllerToSelection(this);
    } else {
      this._view.highlight(false);
      //UI.ControlCenter.removeControllerFromSelection(this);
    }
    return this._selected;
  },

  // isExcluded: is this controller excluded from preset?
  isExcluded: function () {
    return this._exclude;
  },
  // setParams, getParams: ControlCenter responders
  setParams: function (params) {
    this._name = params.name;
    this._unit = params.unit;
    this._value = params.value;
    this._min = params.min;
    this._max = params.max;
    this._precision = params.precision;
    this._scale = params._scale;
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
    this._exclude = (params.exclude || false);
    // if view is alive, update value as well
    if (this._view) {
      this.setValue(this._value);
    }
  }
};


/**
 * internal: view and UI logic for SliderView
 * @param {object} controller UI.SliderController object
 * @param {object} section target UI.Section object
 */
UI._SliderView = function (controller, section) {
  // bound controller
  this._controller = controller;
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
  // various vars
  this._maxWidth = UI.Style.sliderWidth - UI.Style.sliderHandleSize;
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
  this._initialize();
};

UI._SliderView.prototype = {
  // internal: initialize the view
  _initialize: function () {
    this._label.textContent = this._controller.getName();
    this._unit.textContent = this._controller.getUnit();
    // add default event listeners 
    this._touchable.addEventListener("mousedown", this._ref.clicked, false);
  },

  // update slider position and value string (controller => view)
  update: function (normValue, displayValue) {
    this._value.textContent = displayValue;
    this._pos = normValue * (this._maxWidth);
    this._handle.style.width = this._pos + "px";
  },
  // report value (view => controller)
  // FIXME: do not expose controller reference here.. use callback in controller.
  report: function () {
    this._controller.setNormValue(this._pos / this._maxWidth);
  },
  // highlight this view when selected
  highlight: function (bool) {
    if (bool) {
      this._view.className += " ui-view-selected";
    } else {
      this._view.className = "ui-slider-view";
    }
  },

  // event responders
  clicked: function (event) {
    event.stopPropagation();
    // select this controller when alt is pressed
    if (event.altKey) {
      // FIXME: this is not cool...
      this._controller.toggleSelect();
      return;
    }
    // set start point
    this._px = event.clientX - this._left;
    this._py = event.clientY - this._top;
    window.addEventListener("mousemove", this._ref.dragged, false);
    window.addEventListener("mouseup", this._ref.released, false);
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
    this._pos = UI.clamp(this._pos, 0, this._maxWidth);
    // report the result to controller
    this.report();
  },
  released: function (event) {
    event.stopPropagation();
    window.removeEventListener("mousemove", this._ref.dragged, false);
    window.removeEventListener("mouseup", this._ref.released, false);
  }
};