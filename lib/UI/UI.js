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
    sliderWidth: 100,
    sliderHandleSize: 4,
    buttonWidth: 60,
    buttonLEDSize: 10,
    listWidth: 160
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

  var _controllers = [];
  var _selectedControllers = [];

  var _presets = {};

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

  function createControl (params, section) {
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
      _controllers.push(controller);
      return controller;
    } else {
      console.log("invalid controller type.");
      return;
    }
  }

  function savePreset (presetName) {
    var payload = [];
    for (var i = 0; i < _controllers.length; i++) {
      if (!_controllers[i].isExcluded()) {
        payload.push(_controllers[i].getParams());
      }
    }
    _presets[presetName] = payload;
  }

  function loadPreset (presetName) {
    if (_presets.hasOwnProperty(presetName)) {
      var payload = _presets[presetName];
      for (var i = 0; i < payload.length; i++) {
        // console.log(payload[i].name, payload[i].type);
        for (var c = 0; c < _controllers.length; c++) {
          // if two names match, do setParams()
          if (payload[i].name === _controllers[c].getName()) {
            _controllers[c].setParams(payload[i]);
          }
        }
      }
    } else {
      console.log("invalid preset name.");
    }
  }

  function exportPresets () {
    return JSON.stringify(_presets);
  }

  function importPresets (presets) {
    _presets = presets;
    var presetList = [];
    for (var key in _presets) {
      presetList.push(key);
    }
    return presetList;
  }

  function exportRouteMap () {
    return _routeMap;
  }

  // start midi learn mode
  function addControllerToSelection (controller) {
    _selectedControllers.push(controller);
    _mode = "MIDILearn";
    console.log(_selectedControllers, _mode);
  }

  function removeControllerFromSelection (controller) {
    var idx = _selectedControllers.indexOf(controller);
    if (idx !== -1) {
      _selectedControllers.splice(idx, 1);
    }
    if (_selectedControllers.length === 0) {
      _mode = "Performance";
    }
    //console.log(_selectedControllers, _mode);
  }

  function endMIDILearn () {
    for (var i = 0; i < _selectedControllers.length; i++) {
      _selectedControllers[i].toggleSelect();
    }
    _selectedControllers = [];
    _mode = "Performance";
    //console.log(_selectedControllers, _mode);
  }

  function handleMIDILearn (data) {
    // when MIDILearn mode
    if (_mode === "MIDILearn") {
      // iterate for all the selected controllers
      for (var i = 0; i < _selectedControllers.length; i++) {
        // find and delete existing controllers from routeMap
        for (var entry in _routeMap) {
          var index = _routeMap[entry].indexOf(_selectedControllers[i]);
          if (index !== -1) {
            _routeMap[entry].splice(index, 1);
          }
        }
      }
      // and add entry to map with new CC number
      if (typeof _routeMap[data.control] === 'undefined') {
        _routeMap[data.control] = [];
      }
      for (var j = 0; j < _selectedControllers.length; j++) {
        _routeMap[data.control].push(_selectedControllers[j]);
      }
      endMIDILearn();
    }
    // when performance mode
    else {
      if (_routeMap[data.control]) {
        var targetControllers = _routeMap[data.control];
        for (var t = 0; t < targetControllers.length; ++t) {
          // for slider
          targetControllers[t].setNormValue(Ktrl.CurveLinear(data.value));
        }
      }
    }
  }

  return {
    createSection: createSection,
    createSubSection: createSubSection,
    createControl: createControl,
    addControllerToSelection: addControllerToSelection,
    removeControllerFromSelection: removeControllerFromSelection,
    exportPresets: exportPresets,
    importPresets: importPresets,
    exportRouteMap: exportRouteMap,
    handleMIDILearn: handleMIDILearn,
    savePreset: savePreset,
    loadPreset: loadPreset
  };
})();