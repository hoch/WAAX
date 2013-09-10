/**
 * UIManager
 * : managing UI elements and dispatching events to other entities.
 * : this is the main controller of the system
 */
var UIManager = (function () {

  // storage: controls
  var _controls = {};

  // Default styles
  Style = {
    sliderWidth: 152,
    sliderHandleSize: 6,
    buttonWidth: 60,
    buttonLEDSize: 6,
    listWidth: 154
  };

  // callback (UIManager => whatever)
  function _onmessage (controlName, eventType, value) {
    console.log(controlName, eventType, value);
  };

  // callback for control event (UIComponent => UIManager)
  function _callbackControl (controlName, eventType, value) {
    //console.log(controlName, eventType, value);
    _onmessage(controlName, eventType, value);
  }

  /**
   * build UI elements from UIData on target div
   * @param  {Object} UIData UI data object
   * @param  {Object} target target div
   */
  function _build (UIData, target) {
    // find data name that matches with _uidata members
    // then create controls accordingly
    var _container = document.getElementById(target);
    var elements = _container.getElementsByTagName('div');
    for (var i = 0; i < elements.length; i++) {
      var name = elements[i].dataset.uiName;
      if (name) {
        _createControl(name, UIData[name], elements[i]);
      }
    }
    // initializing
    //_setPreset(SamplerEngine.getPreset());
  }

  // factory
  function _createControl (name, options, target) {
    var control = null;
    switch (options.type) {
      case "slider":
        control = new UISlider(name, options, target, _callbackControl);
        break;
      case "button":
        control = new UIButton(name, options, target, _callbackControl);
        break;
      case "indexed-list":
        //control = new UIIndexedListController(options, target);
        break;
    }
    if (control) {
      _controls[name] = control;
      return control;
    } else {
      console.log("invalid control type.");
      return;
    }
  }

  // set control value
  function _setControl (name, value) {
    if (_controls.hasOwnProperty(name)) {
      _controls[name].setValue(value);
    } else {
      return null;
    }
  }

  function _setPreset (preset) {
    for (var param in preset) {
      _setControl(param, preset[param]);
    }
  }

  return {

    // primary features
    controls: _controls,
    build: _build,
    createControl: _createControl,
    onMessage: function (fn) {
      _onmessage = fn;
    },

    // helpers for UI elements building
    createDiv: function (className, parentDiv) {
      var div = document.createElement('div');
      div.className = className;
      if (parentDiv) {
        parentDiv.appendChild(div);
      }
      return div;
    },
    createList: function (listdata, itemClassName, parentDiv) {
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
    },
    clamp: function (value, min, max) {
      return Math.max(Math.min(value, max), min);
    },

    // UI default style
    Style: Style

  }

})();