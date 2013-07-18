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
    sliderHandleSize: 6,
    buttonWidth: 75,
    buttonLEDSize: 10,
    listWidth: 200
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
  var routeMap = {};
  var mode = "Performance"; // or "MIDILearn"

  var controllers = [];
  var selectedControllers = [];

  var presets = [];

  function createSection (sectionTitle, targetDOM) {
    var div = UI.buildDiv('ui-section', document.getElementById(targetDOM));
    var header = UI.buildDiv('ui-section-title', div);
    header.textContent = sectionTitle;
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
      controllers.push(controller);
      return controller;
    } else {
      console.log("invalid controller type.");
      return;
    }
  }

  function getPreset () {
    var preset = [];
    for (var i = 0; i < controllers.length; i++) {
      preset.push(controllers[i].getParams());
    }
    console.log(preset);
    return preset;
  }

  function savePreset (presetName) {
    var payload = [];
    for (var i = 0; i < controllers.length; i++) {
      payload.push(controllers[i].getParams());
    }
    presets[presetName] = payload;
  }

  function loadPreset (presetName) {
    if (presets.hasOwnProperty(presetName)) {
      var payload = presets[presetName];
      for (var i = 0; i < controllers.length; i++) {
        console.log(payload[i]);
        if (payload[i].type === "slider") {
          controllers[i].setParams(payload[i]);
        }
      }
    } else {
      console.log("invalid preset name.");
    }
  }

  function exportPresets () {

  }

  function importPresets () {
    
  }

  function addControllerToSelection (controller) {
    selectedControllers.push(controller);
    console.log(selectedControllers);
  }

  function removeControllerFromSelection (controller) {
    var idx = selectedControllers.indexOf(controller);
    if (idx !== -1) {
      selectedControllers.splice(idx, 1);
    }
    console.log(selectedControllers);
  }

  return {
    createSection: createSection,
    createControl: createControl,
    addControllerToSelection: addControllerToSelection,
    removeControllerFromSelection: removeControllerFromSelection,
    getPreset: getPreset,
    savePreset: savePreset,
    loadPreset: loadPreset
  };
})();