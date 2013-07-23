/**
 * @class UI.ButtonController
 * @param  {object} params { name, unit, value, min, max, precision, scale }
 * @param  {object} section target UI.Section object
 */
UI.ButtonController = function(params, section) {
  // storage for action callbacks
  this._actions = [];
  // target selection state
  this._selected = false;
  // set params
  this.setParams(params);
  // create view and initialize value
  this._view = new UI._ButtonView(this, section);
  // update value and do actions: changed without action
  this.changed();
};

UI.ButtonController.prototype = {
  // changed in toggle mode
  _changedToggle: function(action) {
    if (action === "mousedown") {
      this._value = !this._value;
    }
    this._view.update(this._value);
    this._runActions();
  },
  // changed in momentary mode
  _changedMomentary: function(action) {
    if (action === "mousedown") {
      this._value = true;
      this._runActions();
    } else if (action === "mouseup") {
      this._value = false;
    }
    this._view.update(this._value);
  },
  // changed in oneshot mode
  _changedOneShot: function(action) {
    if (action === "mousedown") {
      this._value = true;
      this._view.update(this._value);
      this._runActions();
      // turn off led in 500ms
      setTimeout(function() {
        this._value = false;
        this._view.update(this._value);
      }.bind(this), 100);
    }
  },
  // virtual function
  changed: function () {
  },

  // for preset saving
  setValue: function (value) {
    if (this._mode === "toggle") {
      this._value = value;
      this._view.update(this._value);
      if (this._value) {
        this._runActions();
      }
    }
  },
  // getters
  getValue: function () {
    var value = {
      name: this._name,
      value: this._value
    };
    return value;
  },
  getName: function() {
    return this._name;
  },

  // add action callback to this controller object
  addAction: function(fn) {
    this._actions.push(fn);
  },
  // internal: run all action callbacks
  _runActions: function() {
    for (var i = 0; i < this._actions.length; i++) {
      this._actions[i](this._value);
    }
  },

  // controller section
  toggleSelect: function() {
    this._selected = !this._selected;
    if (this._selected) {
      this._view.highlight(true);
      UI.ControlCenter.addControllerToSelection(this);
    } else {
      this._view.highlight(false);
      UI.ControlCenter.removeControllerFromSelection(this);
    }
  },

  // isExcluded: is this controller excluded from preset?
  isExcluded: function() {
    return this._exclude;
  },
  // setParams: ControlCenter responders
  setParams: function(params) {
    this._name = params.name;
    // button state
    this._value = params.value;
    // mode (toggle || momentary || oneshot)
    this._mode = params.mode;
    switch (this._mode) {
      case "toggle":
        this.changed = this._changedToggle;
        break;
      case "momentary":
        this.changed = this._changedMomentary;
        break;
      case "oneshot":
        this.changed = this._changedOneShot;
        break;
    }
    this._exclude = (params.exclude || false);
    // if view is alive, update value as well
    if (this._view) {
      this.changed(this._value);
    }
  }
};


/**
 * internal: view and UI logic for ButtonView
 * @param {object} controller UI.ButtonController object
 * @param {object} section target UI.Section object
 */
UI._ButtonView = function(controller, section) {
  // bound controller
  this._controller = controller;
  // building divs
  this._view = UI.buildDiv("ui-button-view", section);
  this._touchable = UI.buildDiv("ui-button-touchable", this._view);
  this._led = UI.buildDiv("ui-button-led", this._touchable);
  this._label = UI.buildDiv("ui-button-label", this._touchable);
  // set up styles
  this._view.style.width = UI.Style.buttonWidth + "px";
  this._led.style.width = UI.Style.buttonLEDSize + "px";
  // function references
  this._ref = {
    clicked: this.clicked.bind(this),
    released: this.released.bind(this)
  };
  // activate button for user interaction
  this._initialize();
};

UI._ButtonView.prototype = {
  // internal: initialize the view
  _initialize: function() {
    this._label.textContent = this._controller.getName();
    // add default event listeners 
    this._touchable.addEventListener("mousedown", this._ref.clicked, false);
  },

  // update slider position and value string (controller => view)
  update: function(bool) {
    if (bool) {
      this._led.className += " ui-button-led-on";
    } else {
      this._led.className = "ui-button-led";
    }
  },
  // report action (view => controller)
  report: function(action) {
    this._controller.changed(action);
  },
  // highlight this view when selected
  highlight: function(bool) {
    if (bool) {
      this._view.className += " ui-view-selected";
    } else {
      this._view.className = "ui-button-view";
    }
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
    this.report("mousedown");
  },
  released: function(event) {
    event.stopPropagation();
    window.removeEventListener("mouseup", this._ref.released, false);
    this.report("mouseup");
  }
};