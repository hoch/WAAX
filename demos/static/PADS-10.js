/**
 * @class PadCell
 */
var PadCell = function (targetDiv, label) {
  // vars
  this._id = targetDiv.id;
  this._view = targetDiv;
  this._overlay = this._view.getElementsByClassName('pad-overlay')[0];
  this._label = this._view.getElementsByClassName('pad-label')[0];
  this._label.textContent = label;
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
  getSampleList: function () {
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
      sampleNames: this.getSampleList(),
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
 * Pad10 core, Singleton
 */
var Pad10 = (function (WX, Center, Ktrl, window) {

  // Master effect chain
  var _compUnit = WX.Comp({ threshold: -12, ratio: 8, makeup: 4.0, active: false });
  var _distUnit = WX.Dist({ type:"saturate", factor:1.5, active: false });
  var _verbUnit = WX.Multiverb();
  _compUnit.to(_distUnit).to(_verbUnit).to(WX.DAC);

  // create 10 PadCells
  var PadCells = [];
  var _labels = ["Q", "W", "E", "R", "T", "A", "S", "D", "F", "G"];
  var s_pad = document.getElementById('s-pad');
  for (var i = 0; i < 10; i++) {
    var overlay = document.createElement('div');
    var label = document.createElement('div');
    var pad = document.createElement('div');
    overlay.className = "pad-overlay";
    overlay.id = "pad-overlay" + i;
    label.className = "pad-label";
    pad.className = "pad";
    pad.id = "pad" + i;
    pad.appendChild(overlay);
    pad.appendChild(label);
    s_pad.appendChild(pad);
    PadCells[i] = new PadCell(pad, _labels[i]);
    PadCells[i].to(_compUnit);
  }

  // loading indicator
  var i_indicator = document.createElement('div');
  i_indicator.className = "c-indicator";
  s_pad.appendChild(i_indicator);
  function _setIndicator (value) {
    i_indicator.style.width = 103 * (1.0 - (value / 9)) + "px";
  }

  // loading blocker
  var _onhold = true;

  // some system variables
  var _presetName = "";
  var _drumKitName = "";

  // _getNewPreset
  function _getNewPreset (name) {
    var preset = {
      name: name,
      drumKitName: _drumKitName,
      cellParams: [],
      compActive: _compUnit.active(),
      compThreshold: _compUnit.threshold(),
      compRatio:_compUnit.ratio(),
      compMakeup: _compUnit.makeup(),
      distActive: _distUnit.active(),
      distDrive: _distUnit.drive(),
      verbMix: _verbUnit.mix(),
      verbPresetName: _verbUnit.getPresetName()
    };
    // debugger;
    for (var i = 0; i < PadCells.length; i++) {
      var params = PadCells[i].getParams();
      delete params.sampleNames;
      preset.cellParams.push(params);
    }
    return preset;
  }

  // _setPreset
  function _setPreset (preset) {
    if (!_onhold) {
      // store names
      _presetName = preset.name;
      // loading cell params
      for (var i = 0; i < PadCells.length; i++) {
        PadCells[i].setParams(preset.cellParams[i]);
      }
      // unpacking master params
      _compUnit.active(preset.active);
      _compUnit.threshold(preset.compThreshold);
      _compUnit.ratio(preset.compRatio);
      _compUnit.makeup(preset.compMakeup);
      _distUnit.active(preset.distActive);
      _distUnit.drive(preset.distDrive);
      _verbUnit.mix(preset.verbMix);
      _verbUnit.setBufferByName(preset.verbPresetName);
      // find and load drum kit
      var drumKitData = null;
      for (var kit in DrumKits) {
        if (DrumKits[kit].name === preset.drumKitName) {
          drumKitData = DrumKits[kit];
          break;
        }
      }
      if (drumKitData !== null) {
        _loadDrumKit(drumKitData, function () {
          _drumKitName = preset.drumKitName;
          _onPresetChangedCallback();
        });
      } else {
        console.log("[PADS-10] drumkit not found...", preset.drumKitName);
      }
    } else {
      console.log("[PADS-10] system busy(on hold)...");
    }
  }



  // load drum kit
  function _loadDrumKit(drumKitData, oncomplete) {
    _onhold = true;
    var loadingIndicator = 0;
    WX.buildBufferMap(
      drumKitData,
      function (buffermap) {
        for (var i = 0; i < PadCells.length; i++) {
          PadCells[i].loadBufferMap(buffermap);
          PadCells[i].setBufferByIndex(i);
        }
        // save drumkit name
        _drumKitName = drumKitData.name;
        if (oncomplete) {
          oncomplete();
          _onhold = false;
        }
      },
      function (progress) {
        _setIndicator(progress);
      }
    );
  }

  // load impulse response
  function _loadImpulseResponses(irdata, oncomplete) {
    WX.buildBufferMap(
      irdata,
      function (buffermap) {
        _verbUnit.setBufferMap(buffermap);
        _verbUnit.setBufferByIndex(0);
        if (oncomplete) {
          oncomplete();
        }
      },
      function (progress) {
        //console.log(progress);
      }
    );
  }



  // handle mouse input (cell selection)
  var _selectedCellIndex = 0;
  var _selectedCell = PadCells[_selectedCellIndex];
  _selectedCell.highlight(true);
  // add user interaction to PadCells
  s_pad.addEventListener("mousedown", function (event) {
    if (!_onhold) {
      var index = event.target.id.slice(11);
      if (index > -1 && index < 10) {
        if (index !== _selectedCellIndex) {
          _selectedCellIndex = index;
          _selectedCell.highlight(false);
          _selectedCell = PadCells[index];
          _selectedCell.highlight(true);
          _onCellChangedCallback();
        }
        _selectedCell.noteOn(0.75);
        _selectedCell.flash();
        event.stopPropagation();
      }
    }
  }, false);

  // handle keyboard (keyboard drumming)
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
      console.log("[PADS-10] waiting for samples to be loaded...");
      setTimeout(function () {
        _onReady(callback);
      }, 1000);
    }
  }

  /**
   * revealed methods
   */
  return {

    onCellChanged: _onCellChanged,
    onPresetChanged: _onPresetChanged,
    onReady: _onReady,

    getNewPreset: _getNewPreset,
    getDrumKitName: function () {
      return _drumKitName;
    },
    getSampleData: function () {
      return {
        list: _selectedCell.getSampleList(),
        name: _selectedCell.getSampleName()
      };
    },
    getCellParams: function () {
      return _selectedCell.getParams();
    },

    setPreset: _setPreset,
    setSample: function (prop, value) {
      switch (prop) {
        case "mute":
          _selectedCell.setSampleMute(value);
          break;
        case "buffername":
          _selectedCell.setBufferByName(value);
          break;
        case "tune":
          _selectedCell.setSampleTune(value);
          break;
        case "volume":
          _selectedCell.setSampleVolume(value);
          break;
      }
    },

    setEnvelope: function (prop, value) {
      switch (prop) {
        case "state":
          _selectedCell.setEnvelopeState(value);
          break;
        case "attack":
          _selectedCell.setAttack(value);
          break;
        case "hold":
          _selectedCell.setHold(value);
          break;
        case "release":
          _selectedCell.setRelease(value);
          break;
      }
    },

    setFilter: function (prop, value) {
      switch (prop) {
        case "state":
          _selectedCell.setFilterState(value);
          break;
        case "frequency":
          _selectedCell.setFilterFreq(value);
          break;
        case "lsgain":
          _selectedCell.setLSGain(value);
          break;
        case "hsgain":
          _selectedCell.setHSGain(value);
          break;
      }
    },

    setComp: function (prop, value) {
      switch (prop) {
        case "state":
          _compUnit.active(value);
          break;
        case "threshold":
          _compUnit.threshold(value);
          break;
        case "ratio":
          _compUnit.ratio(value);
          break;
        case "makeup":
          _compUnit.makeup(value);
          break;
      }
    },

    setDist: function (prop, value) {
      switch (prop) {
        case "state":
          _distUnit.active(value);
          break;
        case "drive":
          var amp = WX.db2lin(value);
          _distUnit.drive(amp);
          _distUnit.gain(1.0/amp);
          break;
      }
    },

    setReverb: function (prop, value) {
      switch (prop) {
        case "mix":
          _verbUnit.mix(value);
          break;
        case "preset":
          _verbUnit.setBufferByName(value);
          break;
      }
    },

    loadDrumKit: _loadDrumKit,
    loadImpulseResponses: _loadImpulseResponses,
    handleMIDINote: _handleMIDINote
  };

})(WX, UI.ControlCenter, Ktrl, window);