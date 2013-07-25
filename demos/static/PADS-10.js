/*
 * @class PadCell
 */
var PadCell = function (targetDiv) {
  // vars
  this._id = targetDiv.id;
  this._view = targetDiv;
  this._overlay = this._view.getElementsByClassName('pad-overlay')[0];
  this._bufferMap = null;
  this._ready = false;
  // parameters: sample
  this._muted = false;
  this._tune = 0.0;
  this._volume = 0.0;
  this._buffer = null;
  this._bufferIndex = 0;
  this._sampleName = null;
  // parameters: envelope
  this._envState = false;
  this._attack = 0.001;
  this._hold = 0.01;
  this._release = 1.0;
  // build audiograph
  this._nLSFilter = WX.context.createBiquadFilter();
  this._nHSFilter = WX.context.createBiquadFilter();
  this._nOutput = WX.context.createGain();
  this._nLSFilter.connect(this._nHSFilter);
  this._nHSFilter.connect(this._nOutput);
  this._nFilterSwitcher = null;
  // caching
  this.input = this._nEnv;
  this.output = this._nOutput;
  // parameters: 2-filters (lo-shelf, hi-shelf)
  this._nLSFilter.type = "lowshelf";
  this._nHSFilter.type = "highshelf";
  this.setFilterState(false);
  this.setFilterFreq(2500);
  this.setLSGain(0.0);
  this.setHSGain(0.0);
  // load assets!
  this.loadBufferMap = this._loadBufferMap.bind(this);
};

PadCell.prototype = {
  // internal
  _loadBufferMap: function (buffermap) {
    this._bufferMap = buffermap;
    this._buffer = this._bufferMap.getBufferByIndex(this._bufferIndex);
    this._sampleName = this._bufferMap.getBufferNameByIndex(this._bufferIndex);
    this._ready = true;
  },

  // unit specific
  label: "u.gen.padcell",
  to: function (unit) {
    this.output.connect(unit._inlet);
    return unit;
  },
  isReady: function () {
    return this._ready;
  },

  // sample-related
  setSampleMute: function (bool) {
    this._muted = bool;
  },
  setSampleTune: function (value) {
    this._tune = value;
  },
  setSampleVolume: function (value) {
    this._volume = value;
  },
  setBufferByName: function (name) {
    this._buffer = this._bufferMap.getBufferByName(name);
    this._bufferIndex = this._bufferMap.getBufferIndexByName(name);
    this._sampleName = name;
  },
  setBufferByIndex: function (index) {
    this._buffer = this._bufferMap.getBufferByIndex(index);
    this._sampleName = this._bufferMap.getBufferNameByIndex(index);
    this._bufferIndex = index;
  },
  setBufferByIndexDelta: function (delta) {
    var index = WX.clamp(
      this._bufferIndex + delta,
      0,
      this._bufferMap.getBufferLength() - 1
    );
    this.setBufferByIndex(index);
  },
  getSampleName: function () {
    return this._sampleName;
  },
  getSampleNames: function () {
    return this._bufferMap.getBufferNames();
  },

  // envelope-related
  setEnvelopeState: function (bool) {
    this._envState = bool;
  },
  setAttack: function (value) {
    this._attack = value;
  },
  setHold: function (value) {
    this._hold = value;
  },
  setRelease: function (value) {
    this._release = value;
  },

  // filter-related
  setFilterState: function (bool) {
    this._filterState = bool;
    if (this._filterState) {
      this._nFilterSwitcher = this._nLSFilter;
    } else {
      this._nFilterSwitcher = this._nOutput;
    }
  },
  setFilterFreq: function (value) {
    this._filterFreq = value;
    this._nLSFilter.frequency.value = this._filterFreq;
    this._nHSFilter.frequency.value = this._filterFreq;
  },
  setLSGain: function (value) {
    this._nLSFilter.gain.value = this._LSGain = value;
  },
  setHSGain: function (value) {
    this._nHSFilter.gain.value = this._HSGain = value;
  },

  // getter
  getParams: function () {
    return {
      muted: this._muted,
      tune: this._tune,
      volume: this._volume,
      sampleNames: this.getSampleNames(),
      sampleName: this._sampleName,
      envState: this._envState,
      attack: this._attack,
      hold: this._hold,
      release: this._release,
      filterState: this._filterState,
      filterFreq: this._filterFreq,
      LSGain: this._LSGain,
      HSGain: this._HSGain
    };
  },

  // setter
  setParams: function (params) {
    this._muted = params.muted;
    this._tune = params.tune;
    this._volume = params.volume;
    //this.getSampleNames() = params.sampleNames
    //params.sampleName: this._sampleName,
    this._envState = params.envState;
    this._hold = params.hold;
    this._release = params.release;
    this._filterState = params.filterState;
    this._filterFreq = params.filterFreq;
    this._LSGain = params.LSGain;
    this._HSGain = params.HSGain;
  },

  // note-on
  noteOn: function (intensity, moment) {
    if (this._muted) {
      return;
    }
    this.flash();
    var source = WX.context.createBufferSource();
    var env = WX.context.createGain();
    source.connect(env);
    env.connect(this._nFilterSwitcher);

    source.buffer = this._buffer;
    moment = (moment || WX.now);
    var prate = Math.pow(2, this._tune / 1200);
    source.playbackRate.setValueAtTime(prate, moment);

    source.start(moment);
    var gvol = WX.db2lin(this._volume);
    if (this._envState) {
      env.gain.setValueAtTime(0.0, moment);
      env.gain.linearRampToValueAtTime(gvol * intensity, moment + this._attack);
      env.gain.setValueAtTime(gvol * intensity, moment + this._attack + this._hold);
      env.gain.exponentialRampToValueAtTime(
        0.0,
        moment + this._attack + this._hold + this._release
      );
      source.stop(moment + this._attack + this._hold + this._release);
    } else {
      env.gain.setValueAtTime(gvol * intensity, moment);
      source.stop(moment + source.buffer.duration);
    }
  },

  // view-related
  highlight: function (bool) {
    if (bool) {
      this._view.className += " pad-highlight";
    } else {
      this._view.className = "pad";
    }
  },
  flash: function () {
    // TODO: cancel scheduled event... when triggered
    this._overlay.className += " flash";
    var me = this;
    setTimeout(function () {
      me._overlay.className = "pad-overlay";
    }, 150);
  }
};


/**
 * Pad10 core, Singletone
 */
var Pad10 = (function (WX, Center, Ktrl, window) {

  // Master Class
  var compUnit = WX.Comp({ threshold: -12, ratio: 8, makeup: 4.0, active: false });
  var distUnit = WX.Dist({ type:"saturate", factor:1.5, active: false });
  var verbUnit = WX.Multiverb();
  compUnit.to(distUnit).to(verbUnit).to(WX.DAC);

  // load impulse responses and assign to verbUnit
  WX.buildBufferMap(ImpulseResponses.Default, function (buffermap) {
    verbUnit.setBufferMap(buffermap);
    verbUnit.setBufferByIndex(0);
  });

  // create 10 PadCells
  var PadCells = [];
  var s_pad = document.getElementById('s-pad');
  for (var i = 0; i < 10; i++) {
    var overlay = document.createElement('div');
    var pad = document.createElement('div');
    overlay.className = "pad-overlay";
    overlay.id = "pad-overlay" + i;
    pad.className = "pad";
    pad.id = "pad" + i;
    pad.appendChild(overlay);
    s_pad.appendChild(pad);
    PadCells[i] = new PadCell(pad);
    PadCells[i].to(compUnit);
  }


  /**
   * preset
   */
  var _preset = {
    name: "",
    payload: {
      drumkit: "",
      cellIndex: 0,
      cellParams: [],
      masterParams: {
        comp: {
          active: compUnit.active(),
          threshold: compUnit.threshold(),
          ratio: compUnit.ratio(),
          makeup: compUnit.makeup()
        },
        dist: {
          active: distUnit.active(),
          drive: distUnit.drive()
        },
        verb: {
          mix: verbUnit.mix(),
          preset: verbUnit.getPresetName()
        }
      }
    }
  };

  // UI touched => update elements => update preset


  // init: selected cell
  var _selectedCell = PadCells[0];
  _selectedCell.highlight(true);
  // add user interaction to PadCells
  s_pad.addEventListener("mousedown", function (event) {
    var index = event.target.id.slice(11);
    if (index > -1 && index < 10) {
      if (index !== cellIndex) {
        _preset.payload.cellIndex = index;
        _selectedCell.highlight(false);
        _selectedCell = PadCells[index];
        _selectedCell.highlight(true);
        _onCellChangedCallback();
      }
      _selectedCell.noteOn(0.75);
      _selectedCell.flash();
      event.stopPropagation();
    }
  }, false);

  // handle keyboard
  var _keyMap = KeyboardSetup.KeyCodeToPadMap;
  var _keyPressed = [];
  window.addEventListener("keydown", function (event) {
    var kc = event.keyCode;
    // if key is pressed, ignore
    if (_keyPressed[kc]) {
      return;
    } else {
      if (typeof _keyMap[kc] !== 'undefined') {
        _keyPressed[kc] = true;
        PadCells[_keyMap[kc]].noteOn(0.75);
        PadCells[_keyMap[kc]].flash();
      }
    }
    event.stopPropagation();
  });
  window.addEventListener("keyup", function (event) {
    _keyPressed[event.keyCode] = false;
  });

  // handle MIDINote
  var _noteMap = MIDISetup.NoteToPadMap;
  function _handleMIDINote (data) {
    if (typeof _noteMap[data.pitch] === 'undefined') {
      return;
    }
    var id = _noteMap[data.pitch];
    PadCells[id].noteOn(Ktrl.CurveCubed(data.velocity), WX.now);
  }

  // load drum kit
  function _loadDrumKit(drumkitData, oncomplete) {
    WX.buildBufferMap(drumkitData, function (buffermap) {
      for (var i = 0; i < PadCells.length; i++) {
        PadCells[i].loadBufferMap(buffermap);
        PadCells[i].setBufferByIndex(i);
      }
      _preset.payload.drumkit = drumkitData.name;
      oncomplete();
    });
  }

  // save preset
  function _savePreset (name) {
    _preset.name = name;
    for (var i = 0; i < PadCells.length; i++) {
      var params = PadCells[i].getParams();
      delete params.sampleNames;
      _preset.payload.cellParams.push(params);
    }
    return JSON.stringify(_preset);
  }

  // load preset
  var _currentPresetName = null;
  function _loadPreset (preset) {
    // get preset name
    _currentPresetName = preset.name;
    var pl = preset.payload;
    //  get cell params => iterate(cell.setParam())
    for (var i = 0; i < PadCells.length; i++) {
      PadCells[i].setParams(pl.cellParams[i]);
    }
    //  get master params => set parameters
    _setMasterParams(pl.masterParams);
    // find drumkitname in DrumKits & update view and all
    for (var kit in DrumKits) {
      if (DrumKits[kit].name === pl.drumkit) {
        _loadDrumKit(DrumKits[kit], _onPresetChangedCallback);
      }
    }
  }

  // onCellChangedCallback
  var _onCellChangedCallback = null;
  function _onCellChanged (callback) {
    _onCellChangedCallback = callback;
  }

  // onPresetChangedCallback
  var _onPresetChangedCallback = null;
  function _onPresetChanged (callback) {
    _onPresetChangedCallback = callback;
  }

  // check all cells to be ready, then fire onready callback
  function _onReady (callback) {
    var flag = PadCells[0].isReady();
    for (var i = 1; i < 10; i++) {
      flag = flag && PadCells[i].isReady();
    }
    if (flag) {
      callback();
    } else {
      console.log("checking...");
      setTimeout(function () {
        _onReady(callback);
      }, 1000);
    }
  }

  // revealed methods
  return Object.create(null, {

    onCellChanged: {
      value: _onCellChanged
    },
    onPresetChanged: {
      value: _onPresetChanged
    },
    onReady: {
      value: _onReady
    },

    setSampleMute: function (value) {

    },

    cell: {
      get: function () {
        return _selectedCell;
      }
    },
    loadDrumKit: {
      value: _loadDrumKit
    },
    savePreset: {
      value: _savePreset
    },
    loadPreset: {
      value: _loadPreset
    },
    comp: {
      value: compUnit
    },
    dist: {
      value: distUnit
    },
    verb: {
      value: verbUnit
    },
    handleMIDINote: {
      value: _handleMIDINote
    }
  });

})(WX, UI.ControlCenter, Ktrl, window);





/*


function MultiVerb (spaces) {
  this._data = spaces;
  this._buffers = {};
  this._currentBufferName = null;

  this._inlet = WX.context.createGain();
  this._dry = WX.context.createGain();
  this._conv = WX.context.createConvolver();
  this._wet = WX.context.createGain();
  this._output = WX.context.createGain();

  this._wet.gain.value = 0.0;

  this._inlet.connect(this._dry);
  this._inlet.connect(this._conv);
  this._conv.connect(this._wet);
  this._dry.connect(this._output);
  this._wet.connect(this._output);

  this.loadAssets();
}

MultiVerb.prototype = {
  label: "u.pro.multiverb",
  to: function (unit) {
    this._output.connect(unit._inlet);
    return unit;
  },
  loadAssets: function () {
    var me = this;
    WX._loadBufferX(this._data, this._buffers, function () {
      console.log("IR loading completed.");
      for (var b in me._buffers) {
        me._conv.buffer = me._buffers[b];
        break;
      }
    });
  },
  setSpace: function (value) {
    this._conv.buffer = this._buffers[value];
  },
  setAmount: function (value) {
    this._wet.gain.value = value;
  },
  getAmount: function () {
    return this._wet.gain.value;
  },
  getSpaceList: function () {
    var list = [];
    for (var name in this._data) {
      list.push(name);
    }
    return list;
  }
};


// boot-up
var Pads = (function (controlCenter) {

  //build bufferPool
  var paths = [
    "../data/pad10/kd/",
    "../data/pad10/sd/",
    "../data/pad10/hh/",
    "../data/pad10/perc/",
    "../data/pad10/fx/"
  ];
  var filenames = [
    ["kd1.wav", "kd2.wav", "kd3.wav", "kd4.wav", "kd5.wav",
   "kd6.wav", "kd7.wav", "kd8.wav", "kd9.wav", "kd10.wav"],
   ["sd1.wav", "sd2.wav", "sd3.wav", "sd4.wav", "sd5.wav",
   "sd6.wav", "sd7.wav", "sd8.wav", "sd9.wav", "sd10.wav"],
   ["hh1.wav", "hh2.wav", "hh3.wav", "hh4.wav", "hh5.wav",
   "hh6.wav", "hh7.wav", "hh8.wav", "hh9.wav", "hh10.wav"],
   ["perc1.wav", "perc2.wav", "perc3.wav", "perc4.wav", "perc5.wav",
   "perc6.wav", "perc7.wav", "perc8.wav", "perc9.wav", "perc10.wav"],
   ["belltree.wav", "bone-rattle.wav", "wah.wav", "moog-slide.wav", "scratch1.wav",
   "scratch2.wav", "scratch3.wav", "shaker-fx.wav", "drop.wav", "waterdrop.wav"]
  ];

  // WXDATA (name:url data list)
  var spaces = {
    "Bright Hall": "../data/ir/bright-hall.wav",
    "Plain Hall": "../data/ir/hall.wav",
    "Large Room": "../data/ir/large.wav",
    "Medium Room": "../data/ir/medium.wav",
    "Small Room": "../data/ir/small.wav",
    "Strong Space": "../data/ir/strong.wav",
    "Heavy Space": "../data/ir/heavy.wav"
  };

  // for wave shaper
  var len = 256;
  var curve1 = new Float32Array(len);
  function getCurve (iter) {
    for (var i = 0; i < len; ++i) {
      var x = i / len;
      for (var j = 0; j < iter; ++j) {
        x = x * x * (3 - 2 * x);
      }
      curve1[i] = x;
    }
  }
  getCurve(0);

  // Chebyshev Polynomials.
  function T0(x) { return 1; }
  function T1(x) { return x; }
  function T2(x) { return 2*x*x - 1; }
  function T3(x) { return 4*x*x*x - 3*x; }
  function T4(x) { return 8*x*x*x*x - 8*x*x + 1; }

  function createCurve_cheby() {
    var n = 65536;
    var n2 = n / 2;
    var curve = new Float32Array(n);
    for (var i = 0; i < n; ++i) {
      var x = (i - n2) / n2;
      var y = 0.25 * (T1(x) + T2(x) + T3(x) + T4(x));
      curve[i] = y;
    }
    return curve;
  }

  function createCurve_softclip () {
    var n = 65536;
    var n2 = n / 2;
    var curve = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var x = (i - n2) / n2;
      var y = x / (1 + Math.abs(x));
      curve[i] = y;
    }
    return curve;
  }

  var fx = WX.context.createWaveShaper();
  // fx.curve = curve1;
  fx.curve = createCurve_cheby();
  fx.oversampleType = "2x";

  var cmp = WX.Comp({ threshold: -12, ratio: 8, makeup: 4.0 });
  var vrb = new MultiVerb(spaces);

  var switcherIn = WX.context.createGain();
  var switcherOut1 = WX.context.createGain();
  var switcherOut2 = WX.context.createGain();

  switcherIn.connect(switcherOut1);
  switcherIn.connect(switcherOut2);

  cmp.connect(switcherIn);
  switcherOut1.connect(fx);
  switcherOut2.connect(vrb._inlet);

  function crush (bool) {
    if (bool) {
      switcherOut1.gain.value = 1.0;
      switcherOut2.gain.value = 0.0;
    } else {
      switcherOut1.gain.value = 0.0;
      switcherOut2.gain.value = 1.0;
    }
  }
  crush(false);

  fx.connect(vrb._inlet);
  vrb.to(WX.DAC);

  // create pad divs
  var _pads = [];
  var selectedPad = null;
  var padContainer = document.getElementById('s-pad');
  for (var i = 0; i < 5; i++) {
    var pad = document.createElement('div');
    pad.className = "pad";
    pad.id = "pad" + i;
    padContainer.appendChild(pad);

    var p = new Pad(pad, paths[i], filenames[i]);
    p.to(cmp);
    _pads.push(p);
  }

  selectedPad = _pads[0];
  selectedPad._padView.className += " pad-highlight";

  function selectPadFromEvent (eventTarget) {
    if (selectedPad) {
      selectedPad._padView.className = " pad";
    }
    selectedPad = _pads[eventTarget.id.slice(3)];
    selectedPad._padView.className += " pad-highlight";
    //selectedPadIndex = eventTarget.id.slice(3);
    UI.ControlCenter.updateView(selectedPad);
  }

  // add event listerner to s-pad
  padContainer.addEventListener("mousedown", function (event) {
    selectPadFromEvent(event.target);
    event.stopPropagation();
  }, false);

  var MIDIRouteMap = {
    "48": _pads[0], "52": _pads[0],
    "54": _pads[1], "58": _pads[1],
    "51": _pads[2], "49": _pads[2],
    "68": _pads[3], "56": _pads[3],
    "60": _pads[4], "59": _pads[4], "57": _pads[4], "55": _pads[4]
  };

  function _handleMIDINote (data) {
    //console.log(data);
    if (MIDIRouteMap[data.pitch]) {
      MIDIRouteMap[data.pitch].noteOn(Ktrl.CurveCubed(data.velocity), WX.now);
    }
  }

  function _getCurrentPad () {
    return selectedPad;
  }

  return {
    handleMIDINote: _handleMIDINote,
    getSelectedPad: _getCurrentPad,
    comp: cmp,
    crush: crush,
    reverb: vrb
  };

})(UI.ControlCenter);
*/