var SamplerEngine = (function (CTX) {

  var _osc = CTX.createOscillator();
  var _gain = CTX.createGain();
  _osc.start(0);
  _osc.connect(_gain);
  _gain.connect(CTX.destination);

  var _preset = {
    pOscFreq: 220.0,
    pOscGain: 0.2
  }

  var _actors = {
    setOscFreq: function (value) {
      _osc.frequency.value = value;
    },
    setOscGain: function (value) {
      _gain.gain.value = value;
    }
  }

  function _setParam (name, value) {
    if (_preset.hasOwnProperty(name)) {
      _preset[name] = value;
      _actors["set" + name.slice(1)](value);
    } else {
      return null;
    }
  }

  function _setPreset (preset) {
    for (var param in preset) {
      _setParam(param, preset[param]);
    }
  }

  // initialize
  _setPreset(_preset);

  // helper
  function _setAudioParam (audioparam, value, transType, time1, time2) {
    // if value is single, use audioParam.value = value
    if (typeof transType === 'undefined') {
      audioparam.setValueAtTime(value, 0);
      audioparam.value = value;
      return;
    }
    // branch on transition type
    switch (transType) {
      case 0:
      case "undefined":
        audioparam.setValueAtTime(value, time1);
        break;
      case 1:
      case "line":
        audioparam.linearRampToValueAtTime(value, time1);
        break;
      case 2:
      case "expo":
        audioparam.exponentialRampToValueAtTime(value, time1);
        break;
      case 3:
      case "target":
        audioparam.setTargetAtTime(value, time1, time2);
        break;
    }
  }

  return {

    setPreset: _setPreset,

    setParam: _setParam,

    getPreset: function () {
      return _preset;
    },

    getParam: function (name) {
      if (_preset.hasOwnProperty(name)) {
        return _preset[name];
      } else {
        return null;
      }
    }

  }

})(PDX.AudioContext);