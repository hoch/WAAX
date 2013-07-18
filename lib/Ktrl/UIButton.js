/**
 * ToggleView
 * @param  {[type]} controller  [description]
 * @param  {[type]} targetDivId [description]
 */
UI._ButtonView = function (controller, section) {
  // building divs
  this._view = UI.buildDiv("ui-button-view", section);
  this._touchable = UI.buildDiv("ui-button-touchable", this._view);
  this._led = UI.buildDiv("ui-button-led", this._touchable);
  this._label = UI.buildDiv("ui-button-label", this._touchable);
  // set up styles
  this._view.style.width = UI.Style.toggleWidth + "px";
  this._led.style.width = UI.Style.toggleLEDSize + "px";
  // bound controller
  this._controller = controller;
  // function references
  this._ref = {
    clicked: this.clicked.bind(this),
    released: this.released.bind(this),
    selected: this.selected.bind(this)
  };
  // activate button for user interaction
  this.activate();
};

UI._ButtonView.prototype = {

  // set name and unit
  setText: function (name) {
    this._label.textContent = name;
  },

  // update slider position and value string (by controller)
  update: function (bool) {
    if (bool) {
      this._led.className += " ui-button-led-on";
    } else {
      this._led.className = "ui-button-led";
    }
  },

  // report user action to controller
  report: function (action) {
    this._controller.changed(action);
  },

  // register this slider with event listeners
  activate: function () {
    // click - drag - release cycle
    this._touchable.addEventListener("mousedown", this._ref.clicked, false);
    // activate view for selection
    this._view.addEventListener("mousedown", this._ref.selected, false);
  },

  clicked: function (event) {
    this.report("mousedown");
    window.addEventListener("mouseup", this._ref.released, false);
  },

  released: function (event) {
    this.report("mouseup");
    window.removeEventListener("mouseup", this._ref.released, false);
  },

  selected: function (event) {
    if (event.altKey) {
      this._controller.select();
    }
  },

  highlight: function (bool) {
    if (bool) {
      this._view.className += " ui-button-view-selected";
    } else {
      this._view.className = "ui-button-view";
    }
  }
};


UI.ButtonController = function (params, section) {
  // slider view for this controller
  this._view = new UI._ButtonView(this, section);
  // label, name
  this._name = params.name;
  // value
  this._value = params.value;
  // mode (toggle || momentary)
  this._mode = params.mode;
  if (this._mode === "toggle") {
    this.changed = this._changedToggle;
  } else {
    this.changed = this._changedMomentary;
  }
  console.dir(this);

  // initialize view
  this.initializeView();
};

UI.ButtonController.prototype = {

  _changedToggle: function (action) {
    if (action === "mousedown") {
      this._value = !this._value;
    }
    this._view.update(this._value);
  },

  _changedMomentary: function (action) {
    if (action === "mousedown") {
      this._value = true;
    } else if (action === "mouseup") {
      this._value = false;
    }
    this._view.update(this._value);
  },

  updateView: function () {
    this._view.update(this._value);
  },

  initializeView: function () {
    this._view.setText(this._name);
    this._view.update(this._value);
  },

  getParams: function () {
    var params = {
      type: "button",
      name: this._name,
      value: this._value,
      mode: this._mode
    };
    return params;
  }
};