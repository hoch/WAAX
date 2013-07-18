UI.IndexedListController = function (params, section) {
  this._selected = false;
  // vars
  this._name = params.name;
  // list data array
  this._data = params.data;
  // value is key, get property from key
  var idx = this._data.indexOf(params.value);
  // if value doesn't exist, init with the first element
  this._index = (idx === -1) ? 0 : idx;
  // value displayed
  this._value = this._data[this._index];
  // callback functions to push values to synth params
  this._callbacks = [];
  // slider view for this controller
  this._view = new UI._IndexedListView(this, section);
  // initialize view
  this.initializeView();
};

UI.IndexedListController.prototype = {

  changed: function (index) {
    this._index = UI.clamp(index, 0, this._data.length - 1);
    this._value = this._data[this._index];
    this._view.update(this._value);
  },

  nudged: function (delta) {
    this._index = UI.clamp(this._index + delta, 0, this._data.length - 1);
    this._value = this._data[this._index];
    this._view.update(this._value);
  },

  getData: function () {
    return this._data;
  },

  setValue: function (value) {
    // check index and corresponding value
    var idx = this._data.indexOf(value);
    // if value doesn't exist, init with the first element
    this._index = (idx === -1) ? 0 : idx;
    // value displayed
    this._value = this._data[this._index];
    this._view.update(this._value);
    this.runActions();
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
    this._view.setText(this._name);
    this._view.update(this._value);
  },

  /*
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
  */

  getParams: function () {
    var params = {
      type: "indexed-list",
      name: this._name,
      value: this._value,
      data: this._data
    };
    return params;
  }
};


UI._IndexedListView = function (controller, section) {
  // bound controller
  this._controller = controller;
  // building divs
  this._view = UI.buildDiv("ui-list-view", section);
  
  this._display = UI.buildDiv("ui-list-display", this._view);
  this._value = UI.buildDiv("ui-list-value", this._display);
  this._nudges = UI.buildDiv("ui-list-nudges", this._display);
  this._nudgeLeft = UI.buildDiv("ui-list-nudge-btn", this._nudges);
  this._nudgeRight = UI.buildDiv("ui-list-nudge-btn", this._nudges);

  this._dropdown = UI.buildDiv("ui-list-dropdown", this._display);
  this._list = UI.buildList(this._controller.getData(), "ui-list-item", this._dropdown);

  this._label = UI.buildDiv("ui-list-label", this._view);

  // set up styles
  this._view.style.width = UI.Style.listWidth + "px";
  this._value.style.width = UI.Style.listWidth - 60 + "px";
  this._nudgeLeft.textContent = "<";
  this._nudgeRight.textContent = ">";
  // view state
  this._state = "idle";
  // function references
  this._ref = {
    clicked: this.clicked.bind(this),
    //released: this.released.bind(this),
    itemSelected: this.itemSelected.bind(this),
    nudgeLeft: this.nudgeLeft.bind(this),
    nudgeRight: this.nudgeRight.bind(this)
    //selected: this.selected.bind(this)
  };
  // callback functions to push values to synth params
  this._callbacks = [];
  // activate slider for user interaction
  this.activate();
  // add data into dropdown
  // add ul, li to dropdown div
};

UI._IndexedListView.prototype = {

  // set name and unit
  setText: function (name) {
    this._label.textContent = name;
  },

  showDropdown: function () {
    this._dropdown.style.display = "block";
    this._state = "opened";
    // add eventlistener to dropdown menu
  },

  hideDropdown: function () {
    this._dropdown.style.display = "none";
    this._state = "idle";
    // remove eventlistern from dropdown menu
  },

  // update slider position and value string (by controller)
  update: function (value) {
    this._value.textContent = value;
  },

  // report norm value to controller
  report: function (value) {
    this._controller.setValue(value);
  },

  // register this slider with event listeners
  activate: function () {
    // click - drag - release cycle
    this._value.addEventListener("mousedown", this._ref.clicked, false);
    this._dropdown.addEventListener("mousedown", this._ref.itemSelected, false);
    this._nudgeLeft.addEventListener("mousedown", this._ref.nudgeLeft, false);
    this._nudgeRight.addEventListener("mousedown", this._ref.nudgeRight, false);
    // activate view for selection
    // this._view.addEventListener("mousedown", this._ref.selected, false);
  },

  nudgeLeft: function () {
    this._controller.nudged(-1);
  },

  nudgeRight: function () {
    this._controller.nudged(1);
  },

  clicked: function (event) {
    if (event.altKey) {
      return;
    }
    switch (this._state) {
      case "idle":
        this.showDropdown();
        break;
      case "opened":
        this.hideDropdown();
        break;
    }
    //window.addEventListener("mouseup", this._ref.released, false);
  },

  itemSelected: function (event) {
    this.report(event.target.id);
    this.hideDropdown();
  }

  /*
  released: function (event) {
    console.dir(event.target.id);
    this.report(event.target.id);
    this.hideDropdown();
    window.removeEventListener("mouseup", this._ref.released, false);
  }*/

/*
  selected: function (event) {
    if (event.altKey) {
      this._controller.toggleSelect();
    }
  },

  highlight: function (bool) {
    if (bool) {
      this._view.className += " ui-view-selected";
    } else {
      this._view.className = "ui-slider-view";
    }
  }*/
};