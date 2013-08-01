var UIManager = (function () {

  var _uidata = {
    "cMute": { 
      type: "button", label: "Mute", value: false, mode: "toggle", parent: "" 
    },
    "cTune": { 
      type: "slider", label: "Tune", value: 0.0, min: -1200.0, max: 1200.0, 
      precision: 2, scale: "linear", unit:"cents" , parent: "" 
    },
    "cVolume": { 
      type: "slider", label: "Volume", value: 0.0, min: -24.0, max: 24.0, 
      precision: 2, scale: "linear", unit:"dB" , parent: "" 
    }
  };
  
  var _controls = {};

  // find data name that matches with _uidata members
  // then create controls accordingly
  var _container = document.getElementById('i-ui-container');
  var elements = _container.getElementsByTagName('div');
  for (var i = 0; i < elements.length; i++) {
    var name = elements[i].dataset.uiName;
    if (name) {
      createControl(name, _uidata[name], elements[i]);
    }
    // var options = _uidata[name];
    // console.log(name, options);
    // createControl(name, options, elements[i]);
  }



  // factory
  function createControl (name, params, section) {
    var control = null;
    switch (params.type) {
      case "slider":
        control = new UI.SliderController(params, section);
        break;
      case "button":
        control = new UI.ButtonController(params, section);
        break;
      case "indexed-list":
        control = new UI.IndexedListController(params, section);
        break;
    }
    if (control) {
      _controls[name] = control;
      return control;
    } else {
      console.log("invalid controller type.");
      return;
    }
  }



})(UI);