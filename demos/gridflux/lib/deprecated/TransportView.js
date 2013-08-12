GF.TransportView = (function (GF) {

  var _mananger = null;

  return {
    setManager: function (manager) {
      _manager = manager;
    },
    report: function (elementName, action, value) {
      _manager.getReport(elementName, action, value);
    }
  };


  /*
  var UIData = {
    "pRewind": {
      type: "button", label: "Rewind", value: false, mode: "oneshot"
    },
    "pStop": {
      type: "button", label: "Stop", value: false, mode: "oneshot"
    },
    "pPlay": {
      type: "button", label: "Play", value: false, mode: "oneshot"
    },
    "pRecord": {
      type: "button", label: "Record", value: false, mode: "toggle"
    },
    "pQuantize": {
      type: "slider", label: "Quantize", value: 0.0, min: 0.0, max: 1.0,
      precision: 2, unit: "", width: 125
    },
    "pShuffle": {
      type: "slider", label: "Shuffle", value: 0.0, min: 0.0, max: 1.0,
      precision: 2, scale: "linear", unit:"" , width: 125
    },
    "pTempo": {
      type: "slider", label: "Tempo", value: 120.0, min: 60.0, max: 240.0,
      precision: 2, scale: "linear", unit:"BPM" , width: 240
    }
  };

  UIManager.build(UIData, 'i-ui-xport');

  function _callback(name, eventType, value) {
    console.log(name, eventType, value);
  };

  UIManager.onMessage(function (name, eventType, value) {
    _callback(name, eventType, value);
  });

  GF.TransportView = {
    onMessage: function (fn) {
      _callback = fn;
    }
  };
  */

})(GF);