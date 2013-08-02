/**
 * @class UI.Slider
 * @param {string} name unique name for control
 * @param {float} value value
 * @param {float} min minimum value range
 * @param {float} min minimum value range
 * @param {Object} options { value, min, max, label, scale, precision, unit, width, exclude }
 * @param {Object} target target div id
 * @param {Function} callback callback function to UImanager
 */

UISlider = function (name, options, target, callback) {

  // name of control (should be unique!)
  this._name = name;
  // create view and initialize value
  this._view = new UISliderView(this, options, target);
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


UISlider.prototype = {

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
 * internal: view and UI logic for SliderView
 * @param {Object} control UI.Slider object
 * @param {Object} options { value, min, max, label, scale, precision, unit, width, exclude }
 * @param {Object} target target div
 */
UISliderView = function (control, options, target) {
  // bound controller
  this._control = control;

  // building divs
  this._view = UIManager.createDiv("ui-slider-view", target);
  this._touchable = UIManager.createDiv("ui-slider-touchable", this._view);
  this._display = UIManager.createDiv("ui-slider-display", this._touchable);
  this._bar = UIManager.createDiv("ui-slider-bar", this._touchable);
  this._label = UIManager.createDiv("ui-slider-label", this._view);
  this._value = UIManager.createDiv("ui-slider-value", this._display);
  this._unit = UIManager.createDiv("ui-slider-unit", this._display);
  this._handle = UIManager.createDiv("ui-slider-handle", this._bar);
  // set up styles
  this._view.style.width = (options.width || UIManager.Style.sliderWidth) + "px";
  this._handle.style.borderRightWidth = UIManager.Style.sliderHandleSize + "px";
  this._label.textContent = options.label;
  this._unit.textContent = options.unit;
  this._precision = options.precision || 0.1; // hack for discrete scale
  // various vars
  this._maxWidth = (options.width || UIManager.Style.sliderWidth) - UIManager.Style.sliderHandleSize;
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

UISliderView.prototype = {

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
    this._pos = UIManager.clamp(this._px, 0, this._maxWidth);
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
    this._pos = UIManager.clamp(this._pos, 0, this._maxWidth);
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