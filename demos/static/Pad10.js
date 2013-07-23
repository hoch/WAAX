function Pad (domId, path, filenames) {
  this._padView = domId;
  this._buffers = [];

  this._muted = false;
  this._tune = 0.0;
  this._gaindB = 0.0;

  this._envState = false;
  this._attack = 0.005;
  this._hold = 0.010;
  this._release = 0.75;

  this._loshelf = WX.context.createBiquadFilter();
  this._hishelf = WX.context.createBiquadFilter();
  this._output = WX.context.createGain();
  this._loshelf.connect(this._hishelf);
  this._hishelf.connect(this._output);

  this._loshelf.type = "lowshelf";
  this._hishelf.type = "highshelf";

  this._filterState = true;
  this._crossoverFreq = 2500;
  this._lsGaindB = 0.0;
  this._hsGaindB = 0.0;

  this._loshelf.frequency.value = this._hishelf.frequency.value = this._crossoverFreq;
  this._loshelf.gain.value = this._lsGaindB;
  this._hishelf.gain.value = this._hsGaindB;

  this._path = path;
  this._filenames = filenames;

  this._switchingNode = this._loshelf;

  this.loadAssets();
}

Pad.prototype = {

  to: function (unit) {
    this._output.connect(unit._inlet);
    return unit;
  },

  loadAssets: function () {
    // quite hacky.. need some elegant solution
    for (var i = 0; i < this._filenames.length; i++) {
      if (i === this._filenames.length - 1) {
        WX._loadBuffers(this._path + this._filenames[i], this._buffers, i, this.onloaded.bind(this));
      } else {
        WX._loadBuffers(this._path + this._filenames[i], this._buffers, i);
      }
    }
    this._currentBufferIndex = 0;
  },

  noteOn: function (intensity, moment) {
    if (this._muted) {
      return;
    }
    var source = WX.context.createBufferSource();
    var env = WX.context.createGain();
    source.connect(env);
    env.connect(this._switchingNode);

    source.buffer = this._buffers[this._currentBufferIndex];
    moment = (moment || WX.now);
    var prate = Math.pow(2, this._tune / 1200);
    source.playbackRate.setValueAtTime(prate, moment);

    source.start(moment);
    var gdb = WX.db2lin(this._gaindB);
    if (this._envState) {
      env.gain.setValueAtTime(0.0, moment);
      env.gain.linearRampToValueAtTime(gdb * intensity, moment + this._attack);
      env.gain.setValueAtTime(gdb * intensity, moment + this._attack + this._hold);
      env.gain.exponentialRampToValueAtTime(0.0, moment + this._attack + this._hold + this._release);
      source.stop(moment + this._attack + this._hold + this._release);
    } else {
      env.gain.setValueAtTime(gdb * intensity, moment);
      source.stop(moment + source.buffer.duration);
    }
  },

  setCurrentBuffer: function (index) {
    this._currentBufferIndex = index;
    return this.getCurrentFilename();
  },

  setCurrentBufferByName: function (name) {
    var index = -1;
    for (var i = 0; i < this._filenames.length; i++) {
      if (this._filenames[i] === name) {
        index = i;
      }
    }
    if (i > -1) {
      this._currentBufferIndex = index;
    }
    return this.getCurrentFilename();
  },

  changeBufferByIndexDelta: function (delta) {
    this._currentBufferIndex = WX.clamp(
      this._currentBufferIndex + delta,
      0,
      this._buffers.length - 1
    );
    return this.getCurrentFilename();
  },

  getCurrentFilename: function () {
    return this._filenames[this._currentBufferIndex];
  },

  getFilenames: function () {
    return this._filenames;
  },

  setMute: function (bool) {
    this._muted = bool;
  },

  setTune: function (value) {
    this._tune = value;
  },

  setGaindB: function (value) {
    this._gaindB = value;
  },

  enableEnvelope: function (bool) {
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

  setFilterState: function (bool) {
    this._filterState = bool;
    if (this._filterState) {
      this._switchingNode = this._loshelf;
    } else {
      this._switchingNode = this._output;
    }
  },

  setCrossover: function (value) {
    this._crossoverFreq = value;
    this._loshelf.frequency.value = this._hishelf.frequency.value = this._crossoverFreq;
  },

  setLSGain: function (value) {
    this._loshelf.gain.value = this._lsGaindB = value;
  },

  setHSGain: function (value) {
    this._hishelf.gain.value = this._hsGaindB = value;
  },

  getParams: function () {
    return {
      muted: this._muted,
      tune: this._tune,
      gain: this._gaindB,
      filenames: this._filenames,
      currentBufferIndex: this._currentBufferIndex,
      envState: this._envState,
      attack: this._attack,
      hold: this._hold,
      release: this._release,
      filterState: this._filterState,
      crossover: this._crossoverFreq,
      loshelfGain: this._lsGaindB,
      hishelfGain: this._hsGaindB
    };
  },

  onloaded: function () {
    this._currentBufferIndex = 0;
    this.getCurrentFilename();
    WX._log.post("DrummerPad loaded. (current: " + this.getCurrentFilename() + ")");
    //filename.textContent = "Loaded.";
  },

  setTargetDiv: function (domId) {
    this._view = domId;
    // add event listeners
  }
};


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

  function createCurve() {
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

  var fx = WX.context.createWaveShaper();
  // fx.curve = curve1;
  fx.curve = createCurve();
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