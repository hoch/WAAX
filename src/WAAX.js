/**
 * WAAX Core
 * @revision r13 dev
 */


/**
 * @namespace WX
 */

window.WX = {};

(function (WX) {

  'use strict';


  /**
   * @module log
   */

  WX.log = (function () {
    var _prefix = '[wx] ',
      _prefix_info = '[wx:info] ',
      _prefix_warn = '[wx:warn] ',
      _prefix_err = '[wx:err] ';
    var _verbose = false;

    function _compose(prefix, msg, ref) {
      var message = prefix + msg;
      if (ref && ref.label) {
        message += ' (' + ref.label + ')';
      }
      return message;
    }

    return {
      verbose: function (bool) {
        if (typeof bool === 'boolean') {
          _verbose = bool;
        }
      },
      post: function (msg) {
        console.log(_compose(_prefix, msg));
      },
      info: function (msg, ref) {
        if (_verbose) {
          console.log(_compose(_prefix_info, msg, ref));
        }
      },
      warn: function (msg, ref) {
        if (_verbose) {
          console.log(_compose(_prefix_warn, msg, ref));
        }
      },
      error: function (msg, ref) {
        throw new Error(_compose(_prefix_err, msg, ref));
      }
    };
  })();


  /**
   * API support checking and monkey patching
   * @note WAAX only supports: Chrome and Safari
   * TODO: this needs to be more comprehensive. collaborate with Chris Wilson.
   */

  var _kApiAvailable = false;
  var _kLegacySupport = false;
  if (!window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
    //WX.log.error('AudioContext seems to be missing. Bye.');
    //return null;
  } else {
    if (!window.hasOwnProperty('webkitAudioContext')) {
      //WX.log.error('WAAX currently does not support FireFox due to its incomplete implementation of Web Audio API. Use Chrome or Safari. bye.');
      //return null;
    } else {
      _kApiAvailable = true;
      WX.log.info('Web Audio API fully supported.');
      window.AudioContext = window.webkitAudioContext;
      // and implements legacy support for safari
      if (!AudioContext.prototype.hasOwnProperty('createGain')) {
        _kLegacySupport = true;
        WX.log.info('adding legacy support on audio context...');
        // --------------------------------------
        // TODO: do some monkey patching here....
        // --------------------------------------
      }
    }
  }
  
  /**
   *  For WX.init, any ugen that has static variables that depend on the
   *  audio context running can register with `WX.add_init_callback` to 
   *  ensure they are initialized after the audio context is set up.
   *
   *  If the audio context is not set up, i.e. it isn't available, then
   *  WX.init will throw an error.
   **/
  var _initCallbacks = [];

  WX.add_init_callback = function (cb) {
    _initCallbacks.push(cb);
  };

  /**
   * internal
   */

  // audio context
  var _ctx = null;
  if (_kApiAvailable) {
    _ctx = new AudioContext();
  }
 
  // unit stack for patch building
  // var _unitStack = [];
  // ignore function (to avoid prototype propagation)
  var _ignore = function () {
    return;
  };


  /**
   * system variables and utilities
   */

  Object.defineProperties(WX, {

    // system flags and constant
    System: {
      value: {
        REVISION: 'r13dev',
        API_AVAILABLE: _kApiAvailable,
        LEGACY_SUPPORT: _kLegacySupport
      }
    },

    // audio context
    context: {
      value: _ctx
    },

    // now (getter)
    now: {
      get: function () {
        return _ctx.currentTime;
      },
      set: _ignore
    },

    // sample rate
    sampleRate: {
      get: function () {
        return _ctx.sampleRate;
      },
      set: _ignore
    }

  });



  /**
   * unit-related utilities, math utilities
   */

  Object.defineProperties(WX, {

    // EXPERIMENTAL (DO NOT USE IN PROD)
    // : creates a patch from a collection of WX units
    // patch_exp: {
    //   set: function (value) {
    //     if (isNaN(value) || value > 0) {
    //       WX.log.warn('not a valid patch.');
    //       _unitStack.length = 0;
    //       return false;
    //     }
    //     if (_unitStack.length < 2) {
    //       WX.log.warn('not enough units to connect.');
    //       _unitStack.length = 0;
    //       return false;
    //     } else {
    //       WX.log.info('building audio graph...');
    //       for (var i = 0; i < _unitStack.length - 1; i++) {
    //         if (_unitStack[i].outlet && _unitStack[i + 1].inlet) {
    //           console.log('  ' + _unitStack[i].params.pLabel + ' >> '+
    //             _unitStack[i+1].params.pLabel);
    //           _unitStack[i].outlet.connect(_unitStack[i+1].inlet);
    //         } else {
    //           WX.log.warn('invalid unit found.');
    //           _unitStack.length = 0;
    //           return false;
    //         }
    //       }
    //       _unitStack.length = 0;
    //       return true;
    //     }
    //   },
    //   get: _ignore
    // },

    patch: {
      value: function () {
        for (var i = 0; i < arguments.length - 1; i++) {
          arguments[i].outlet.connect(arguments[i+1].inlet);
        }
      }
    },

    // $: setAudioParam function (internal)
    $: {
      value: function (audioParam, value, transType, time1, time2) {
        // if no trans type, change param immediately
        if (typeof transType === 'undefined') {
          audioParam.setValueAtTime(value, 0);
          audioParam.value = value;
          return;
        }
        // branch on transition type
        switch (transType) {
        case 0:
        case 'step':
          audioParam.setValueAtTime(value, time1);
          break;
        case 1:
        case 'line':
          audioParam.linearRampToValueAtTime(value, time1);
          break;
        case 2:
        case 'expo':
          audioParam.exponentialRampToValueAtTime(value, time1);
          break;
        case 3:
        case 'target':
          audioParam.setTargetAtTime(value, time1, time2);
          break;
        }
      }
    },

    // extend source target object with source props (for prototype, preset)
    extend: {
      value: function (target, source) {
        for (var prop in source) {
          target[prop] = source[prop];
        }
      }
    },

    // returns a duplicated object (for preset)
    clone: {
      value: function (source) {
        var obj = {};
        for (var prop in source) {
          obj[prop] = source[prop];
        }
        return obj;
      }
    },

    // returns a float random number between (min, max)
    random2f: {
      value: function (min, max) {
        return min + Math.random() * (max - min);
      }
    },

    // returns an integer random number between (min, max)
    random2: {
      value: function (min, max) {
        return Math.round(min + Math.random() * (max - min));
      }
    },

    // clamp
    clamp: {
      value: function (value, min, max) {
        return Math.min(Math.max(value, min), max);
      }
    },

    // converts a MIDI pitch to frequency(Hz)
    pitch2freq: {
      value: function (pitch) {
        return 440.0 * Math.pow(2, ((Math.floor(pitch) - 69) / 12));
      }
    },

    // converts frequency to a MIDI pitch
    freq2pitch: {
      value: function (freq) {
        // Math.log(2) = 0.6931471805599453
        return Math.floor(69 + 12 * Math.log(freq / 440.0) / 0.6931471805599453);
      }
    },

    // converts linear amplitude to decibel
    lin2db: {
      value: function (amp) {
        // if below -100dB, set to -100dB to prevent taking log of zero
        // Math.LN10 = 2.302585092994046
        return 20.0 * (amp > 0.00001 ? (Math.log(amp) / 2.302585092994046) : -5.0);
      }
    },

    // converts decibel to linear amplitude
    db2lin: {
      value: function (db) {
        return Math.pow(10.0, db / 20.0);
      }
    }
  });


  /**
   * WAAX node creation shorthand
   * TODO: this should be the monkey patch
   */

  WX.nGain = function () { return _ctx.createGain(); };
  WX.nDelay = function () { return _ctx.createDelay(); };
  WX.nFilter = function () { return _ctx.createBiquadFilter(); };
  WX.nComp = function () { return _ctx.createDynamicsCompressor(); };
  WX.nConvolver = function () { return _ctx.createConvolver(); };
  WX.nWaveShaper = function () { return _ctx.createWaveShaper(); };
  WX.nSource = function () { return _ctx.createBufferSource(); };
  WX.nOSC = function () { return _ctx.createOscillator(); };
  WX.nAnalyzer = function () { return _ctx.createAnalyser(); };
  WX.nPanner = function () { return _ctx.createPanner(); };
  WX.nSplitter = function (numChannel) { return _ctx.createChannelSplitter(numChannel); };
  WX.nMerger = function (numChannel) { return _ctx.createChannelMerger(numChannel); };
  WX.nPeriodicWave = function () { return _ctx.createPeriodicWave(); };

  WX.nBuffer = function (nChannel, length, sampleRate) {
    return _ctx.createBuffer(nChannel, length, sampleRate);
  };


  /**
   * ENUMs
   */
  WX.OscilType = {
    'sine': 0,
    'square': 1,
    'sawtooth': 2,
    'triangle': 3,
    'custom': 4
  };


  /**
   * Unit Mixins, assembling routine
   *
   *         inlet
   *           |
   *      +----+----+
   *    nInput      |
   *      |         |
   *   UnitBody     |
   *      |         |
   *   nOutput      |
   *      |         |
   *   nActive   nBypass
   *      +----+----+
   *           |
   *         outlet
   *
   * 1) base mixin
   *   - params: pActive, pLabel
   *   - nodes: nActive
   *   - methods: get, set, getParams, setParams
   *   - handlers: _Active
   * 2) input mixin
   *   - params: pInputGain
   *   - nodes: inlet >> nInput, nBypass
   *   - handlers: _InputGain
   * 3) output mixin
   *   - params: pGain
   *   - nodes: nOutput >> nActive >> outlet, inlet >> (nBypass) >> outlet
   *   - methods: to, connect, control
   *   - handlers: _Gain
   *
   */


  /**
   * WX.UnitBase
   */

  WX.UnitBase = function () {
    this.params = {
      pLabel: 'Unit',
      pActive: true
    };
    this._nActive = WX.nGain();
  };

  WX.UnitBase.prototype = {
    // core method of r12, r13
    // : update params.paramName and call the corresponding handler
    set: function (paramName, value, transType, time1, time2) {
      if (this.params.hasOwnProperty(paramName)) {
        this.params[paramName] = value;
        var handler = "_" + paramName.slice(1);
        if (typeof this[handler] === 'function') {
          this[handler](transType, time1, time2);
        } else {
          // if no handler, do nothing
        }
      }
      return this;
    },
    get: function (paramName) {
      if (this.params.hasOwnProperty(paramName)) {
        return this.params[paramName];
      } else {
        return null;
      }
    },
    setParams: function (params) {
      for (var param in params) {
        this.set(param, params[param]);
      }
      return this;
    },
    getParams: function () {
      return WX.clone(this.params);
    },
    // handler
    _Active: function () {
      this._nActive.gain.value = this.params.pActive ? 1.0 : 0.0;
      if (this._nBypass) {
        this._nBypass.gain.value = this.params.pActive ? 0.0 : 1.0;
      }
    }
  };


  /**
   * WX.UnitInput
   */

  WX.UnitInput = function () {
    this.params.pInputGain = 1.0;
    this.inlet = WX.nGain();
    this._nInput = WX.nGain();
    this._nBypass = WX.nGain();
    this.inlet.connect(this._nInput);
    this.inlet.connect(this._nBypass);
  };

  WX.UnitInput.prototype = {
    _InputGain: function (transType, time1, time2) {
      WX.$(this._nInput.gain, this.params.pInputGain, transType, time1, time2);
    }
  };


  /**
   * WX.UnitOutput
   */

  WX.UnitOutput = function () {
    this.params.pGain = 1.0;
    this._nOutput = WX.nGain();
    this._nActive = WX.nGain();
    this.outlet = WX.nGain();
    this._nOutput.connect(this._nActive);
    this._nActive.connect(this.outlet);
    if (this._nBypass) {
      this._nBypass.connect(this.outlet);
    }
  };

  WX.UnitOutput.prototype = {
    to: function (unit) {
      if (unit.inlet) {
        this.outlet.connect(unit.inlet);
        return unit;
      } else {
        WX.log.error('invalid unit.');
      }
    },
    connect: function (node) {
      this.outlet.connect(node);
    },
    control: function (unit, paramName) {
      if (unit._modulationTargets.hasOwnProperty(paramName)) {
        var targets = unit._modulationTargets[paramName];
        for (var i = 0; i < targets.length; i++) {
          this.outlet.connect(targets[i]);
        }
      } else {
        return null;
      }
    },
    _Gain: function (transType, time1, time2) {
      WX.$(this._nOutput.gain, this.params.pGain, transType, time1, time2);
    }
  };


  /**
   * @class buffermap
   */
  function _BufferMap(bufferData, oncomplete, onprogress, verbose) {

    var _buffers = {};
    var _oncomplete = function (name, iteration) {
      WX.log.info('loading completed.');
      if (oncomplete) {
        oncomplete();
      }
    };
    var _onprogress = (onprogress || function (event, name, iteration) {
      var pct = ~~((event.loaded / event.total) * 100) + '%';
      WX.log.info('loading('+ iteration + '): ' + name + '... ' + pct);
      if (onprogress) {
        onprogress();
      }
    });

    // serialize for xhr: object -> array
    var _data = [];
    var names = Object.keys(bufferData);
    for (var i = 0; i < names.length; i++) {
      _data[i] = [names[i], bufferData[names[i]]];
    }

    // recurse XHR loader
    function _recurseXHR (data, iteration) {
      var entry = data.shift();
      var name = entry[0], url = entry[1];
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";
      xhr.onprogress = function (event) {
        _onprogress(event, name, iteration);
      };
      xhr.onload = function () {
        try {
          var b = WX.context.createBuffer(xhr.response, false);
          iteration++;
          _addBuffer(name, b);
          if (data.length === 0) {
            _oncomplete("done");
            return;
          } else {
            _recurseXHR(data, iteration);
          }
        } catch (error) {
          WX.log.error('XHR failed (' + error.message + '): ' + url);
        }
      };
      xhr.send();
    }

    // adding buffer with stereo conversion
    function _addBuffer (name, buffer) {
      // when buffer is mono, make it duplicated stereo
      if (buffer.numberOfChannels === 1) {
        var newBuffer = WX.context.createBuffer(2, buffer.length, WX.sampleRate);
        var channel = buffer.getChannelData(0);
        newBuffer.getChannelData(0).set(new Float32Array(channel));
        newBuffer.getChannelData(1).set(new Float32Array(channel));
        _buffers[name] = newBuffer;
      } else {
        _buffers[name] = buffer;
      }
    }

    return {
      addBuffer: _addBuffer,
      getBufferByName: function (name) {
        if (_buffers.hasOwnProperty(name)) {
          return _buffers[name];
        } else {
          return null;
        }
      },
      getBufferByIndex: function (index) {
        var key = Object.keys(_buffers)[index];
        if (typeof key === undefined) {
          return null;
        } else {
          return _buffers[key];
        }
      },
      getBufferNames: function () {
        return Object.keys(_buffers);
      },
      /**
       *  Begin loading the buffers.
       **/
      load: function () {
        // start recursion
        _recurseXHR(_data, 0);
      }
    };

  }

  WX.BufferMap = function (bufferMapData, oncomplete, onprogress) {
    return _BufferMap(bufferMapData, oncomplete, onprogress);
  };
  
  /**
   *  `WX.init` should be called from user code to initialize WAAX if possible.
   **/
  WX.init = function () {
    var i;

    if (_kApiAvailable) {
      for (i = 0; i < _initCallbacks.length; i++) {
        (_initCallbacks[i])();
      }
      // start loading other units... go!
      WX.log.post('WAAX core loaded. (' + WX.System.REVISION + ')');
    } else {
      WX.log.error('WAAX is not currently supported in this browser!');
      
    }
  };



})(window.WX);
