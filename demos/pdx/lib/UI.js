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

  function buildList (listdata, itemClassName, parentDiv) {
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
  }

  function clamp (value, min, max) {
    return Math.max(Math.min(value, max), min);
  }

  Style = {
    sliderWidth: 152,
    sliderHandleSize: 6,
    buttonWidth: 60,
    buttonLEDSize: 6,
    listWidth: 154
  };

  return {
    buildDiv: buildDiv,
    buildList: buildList,
    clamp: clamp,
    Style: Style
  };
})();


/**
 * @class Control Center, controller factory and a singleton manager
 */
UI.ControlCenter = (function () {
  var _routeMap = {};
  var _mode = "Performance"; // or "MIDILearn"

  var _controllers = {};
  var _selectedControllers = [];

  function createSection (sectionTitle, targetDOM) {
    var div = UI.buildDiv('ui-section', document.getElementById(targetDOM));
    var header = UI.buildDiv('ui-section-title', div);
    header.textContent = sectionTitle;
    return div;
  }

  function createSubSection (sectionTitle, section) {
    var div = UI.buildDiv('ui-sub-section', section);
    var header = UI.buildDiv('ui-sub-section-title', div);
    //header.textContent = sectionTitle;
    return div;
  }

  function createControl (name, params, section) {
    var controller = null;
    switch (params.type) {
      case "slider":
        controller = new UI.SliderController(params, section);
        break;
      case "button":
        controller = new UI.ButtonController(params, section);
        break;
      case "indexed-list":
        controller = new UI.IndexedListController(params, section);
        break;
    }
    if (controller) {
      _controllers[name] = controller;
      return controller;
    } else {
      console.log("invalid controller type.");
      return;
    }
  }

  // start midi learn mode
  function addControllerToSelection (controller) {
    _selectedControllers.push(controller.getName());
    _mode = "MIDILearn";
    console.log(_selectedControllers);
  }

  function removeControllerFromSelection (controller) {
    var idx = _selectedControllers.indexOf(controller.getName());
    if (idx > -1) {
      _selectedControllers.splice(idx, 1);
    }
    if (_selectedControllers.length === 0) {
      _mode = "Performance";
    }
    console.log(_selectedControllers);
  }

  function endMIDILearn () {
    for (var i = 0; i < _selectedControllers.length; i++) {
      _controllers[_selectedControllers[i]].toggleSelect();
    }
    _selectedControllers = [];
    _mode = "Performance";
  }

  function handleMIDILearn (data) {
    // when MIDILearn mode
    if (_mode === "MIDILearn") {
      // iterate for all the selected controllers
      for (var i = 0; i < _selectedControllers.length; i++) {
        // find and delete existing controllers from routeMap
        for (var entry in _routeMap) {
          var index = _routeMap[entry].indexOf(_selectedControllers[i]);
          if (index > -1) {
            _routeMap[entry].splice(index, 1);
          }
        }
      }
      // and add entry to map with new CC number
      if (typeof _routeMap[data.control] === 'undefined') {
        _routeMap[data.control] = [];
      }
      for (i = 0; i < _selectedControllers.length; i++) {
        _routeMap[data.control].push(_selectedControllers[i]);
      }
      endMIDILearn();
    }
    // when performance mode
    else {
      if (_routeMap[data.control]) {
        var targetControllers = _routeMap[data.control];
        for (var t = 0; t < targetControllers.length; t++) {
          _controllers[targetControllers[t]].setNormValue(Ktrl.CurveLinear(data.value));
        }
      }
    }
  }

  // just in case....
  function createCID () {
    // From here: http://stackoverflow.com/a/2117523
    return 'WXUI-xxxyxxxy'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r&0x3 | 0x8);
      return v.toString(16);
    });
  }

  return {
    // controllers: _controllers,
    // presetBundle: _presetBundlePayload,
    createSection: createSection,
    createSubSection: createSubSection,
    createControl: createControl,
    createCID: createCID,
    addControllerToSelection: addControllerToSelection,
    removeControllerFromSelection: removeControllerFromSelection,
    handleMIDILearn: handleMIDILearn
  };
})();