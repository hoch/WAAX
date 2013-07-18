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
    for (var i = 0; i < controllers.length; i++) {
      console.log(controllers[i].getParams());
    }
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
    getPreset: getPreset
  };
})();