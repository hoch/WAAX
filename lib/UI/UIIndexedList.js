/**
 * @class UI.IndexedListController
 * @param {object} params { name(string), value(string), data(array) }
 * @param {object} section target UI.Section object
 */
UI.IndexedListController = function (params, section) {
  // storage for action callbacks
  this._actions = [];
  // set params
  this.setParams(params);
  // create view and initialize value
  this._view = new UI._IndexedListView(this, section);
  // update value and do actions
  this.setValue(this._value);
};

UI.IndexedListController.prototype = {
  // internal: update index from value string
  // if value doesn't exist, set with the first element
  _updateIndexFromValue: function (value) {
    var idx = this._data.indexOf(value);
    this._index = (idx === -1) ? this._index : idx;
    this._value = this._data[this._index];
  },
  // internal: update index from value string
  _updateValueFromIndex: function (index) {
    this._index = UI.clamp(index, 0, this._data.length - 1);
    this._value = this._data[this._index];
  },

  // 1) set value in controller from value
  // 2) update view accordingly
  // 3) and run action callbacks
  setValue: function (value) {
    // value is (-1 || 1 || string)
    if (value === -1 || value === 1) {
      this._updateValueFromIndex(this._index + value);
    } else {
      this._updateIndexFromValue(value);
    }
    this._view.update(this._value);
    this._runActions();
  },
  // set index and update value accordingly
  setIndex: function (index) {
    this._updateValueFromIndex(index);
    this._view.update(this._value);
    this._runActions();
  },
  setListData: function (data) {
    this._data = data;
    this._view.updateList();
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
  getListData: function () {
    return this._data;
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

  // add list item dynamically
  addListItem: function (item) {
    this._data.push(item);
    this._view.updateList();
  },

  // isExcluded: is this controller excluded from preset?
  isExcluded: function () {
    return this._exclude;
  },
  // setParams: ControlCenter responders
  setParams: function (params) {
    this._name = params.name;
    if (params.data.length === 0) {
      console.log("invalid list data.");
      return;
    }
    this._index = 0;
    this._data = params.data;
    // prepare value(string) and index(number)
    this._updateIndexFromValue(params.value);
    // flag for MIDI targeting selection
    this._selected = false;
    this._exclude = (params.exclude || false);
    // if view is alive, update value as well
    if (this._view) {
      this.setValue(this._value);
    }
  }
};


/**
 * internal: view and UI logic for IndexedList
 * @param {object} controller UI.IndexedListController object
 * @param {object} section target UI.Section object
 */
UI._IndexedListView = function (controller, section) {
  // bound controller
  this._controller = controller;
  // building DOMs
  this._view = UI.buildDiv("ui-list-view", section);
  this._display = UI.buildDiv("ui-list-display", this._view);
  this._value = UI.buildDiv("ui-list-value", this._display);
  this._nudges = UI.buildDiv("ui-list-nudges", this._display);
  this._nudgeLeft = UI.buildDiv("ui-list-nudge-btn", this._nudges);
  this._nudgeRight = UI.buildDiv("ui-list-nudge-btn", this._nudges);
  this._dropdown = UI.buildDiv("ui-list-dropdown", this._display);
  this._list = UI.buildList(this._controller.getListData(), "ui-list-item", this._dropdown);
  this._label = UI.buildDiv("ui-list-label", this._view);
  // setting up styles
  this._view.style.width = UI.Style.listWidth + "px";
  //this._value.style.width = UI.Style.listWidth - 60 + "px";
  this._nudgeLeft.textContent = "<";
  this._nudgeRight.textContent = ">";
  // vars: state for dropdown menu
  this._state = "hidden";
  // event responders with object binding
  this._ref = {
    valueClicked: this.valueClicked.bind(this),
    itemSelected: this.itemSelected.bind(this),
    nudgeLeft: this.nudgeLeft.bind(this),
    nudgeRight: this.nudgeRight.bind(this)
    //selected: this.selected.bind(this)
  };
  // initialize the view
  this._initialize();
};

UI._IndexedListView.prototype = {
  // internal: initialize the view
  _initialize: function () {
    // set label and list data
    this._label.textContent = this._controller.getName();
    // add default event listeners
    this._value.addEventListener("mousedown", this._ref.valueClicked, false);
    this._nudgeLeft.addEventListener("mousedown", this._ref.nudgeLeft, false);
    this._nudgeRight.addEventListener("mousedown", this._ref.nudgeRight, false);
  },
  // binary state machine
  _setNextState: function () {
    switch (this._state) {
      case "hidden":
        this._state = "shown";
        this._dropdown.style.display = "block";
        // add itemselection listener
        window.addEventListener("mousedown", this._ref.itemSelected, false);
        break;
      case "shown":
        this._state = "hidden";
        this._dropdown.style.display = "none";
        // remove itemselection listener
        window.removeEventListener("mousedown", this._ref.itemSelected, false);
        break;
    }
  },

  // update value string (controller => view)
  update: function (value) {
    this._value.textContent = value;
  },
  // update data list (controller => view)
  updateList: function () {
    this._dropdown.removeChild(this._list);
    this._list = UI.buildList(this._controller.getListData(), "ui-list-item", this._dropdown);
  },
  // report value (view => controller)
  // FIXME: do not expose controller reference here.. use callback in controller.
  report: function (value) {
    this._controller.setValue(value);
  },

  // event responders
  nudgeLeft: function (event) {
    event.stopPropagation();
    this.report(-1);
  },
  nudgeRight: function (event) {
    event.stopPropagation();
    this.report(1);
  },
  valueClicked: function (event) {
    event.stopPropagation();
    // escape when alt is pressed (alt is for view selection)
    if (event.altKey) {
      return;
    }
    this._setNextState();
  },
  itemSelected: function (event) {
    event.stopPropagation();
    // controller will handle the validity and update the view back
    this.report(event.target.id);
    this._setNextState();
  }
  // selected: function (event) {
  //   if (event.altKey) {
  //     this._controller.toggleSelect();
  //   }
  // },
  // highlight: function (bool) {
  //   if (bool) {
  //     this._view.className += " ui-view-selected";
  //   } else {
  //     this._view.className = "ui-slider-view";
  //   }
  // }
};