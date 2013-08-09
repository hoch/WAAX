/**
 * @class UIButton
 * @param  {object} params { name, unit, value, min, max, precision, scale }
 * @param  {object} section target UI.Section object
 */
UIButton = function(name, options, target, callback) {

  this._name = name;
  // create view and initialize value
  this._view = new UIButtonView(this, options, target);
  // callback to manager
  this._callback = callback;

  // target selection state
  this._selected = false;

  // set options: mode
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

UIButton.prototype = {

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
 * internal: view and UI logic for ButtonView
 * @param {object} controller UI.ButtonController object
 * @param {object} section target UI.Section object
 */
UIButtonView = function(control, options, target) {
  // bound controller
  this._control = control;
  // building divs
  this._view = UIManager.createDiv("ui-button-view", target);
  this._touchable = UIManager.createDiv("ui-button-touchable", this._view);
  this._led = UIManager.createDiv("ui-button-led", this._touchable);
  this._label = UIManager.createDiv("ui-button-label", this._touchable);
  // set up styles
  this._view.style.width = (options.width || UIManager.Style.buttonWidth) + "px";
  this._led.style.width = (options.LEDwidth || UIManager.Style.buttonLEDSize) + "px";
  this._label.textContent = options.label;
  // function references
  this._ref = {
    clicked: this.clicked.bind(this),
    released: this.released.bind(this)
  };
  // activate button for user interaction
  this._view.addEventListener("mousedown", this._ref.clicked, false);
};

UIButtonView.prototype = {

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