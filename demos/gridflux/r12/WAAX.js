/**
 * todo
 * 1) web audio and midi support check
 * 2) patching webaudioContext
 *
 * utilities
 * - some math, interpolation
 * - curve generator
 */


/**
 * namespace WX
 */
window.WX = {};

(function (WX) {

  'use strict';


  /**
   * logging module
   */
  WX.log = (function () {
    var _prefix = '[wx] ',
      _prefix_info = '[wx:info] ',
      _prefix_warn = '[wx:warn] ',
      _prefix_err = '[wx:err] ';
    var _verbose = true;

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
   * @note WAAX r12 only supports: Chrome (primary), Safari
   */
  var _kApiAvailable = false;
  var _kLegacySupport = false;
  if (!window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
    WX.log.error('AudioContext seems to be missing. Bye.');
    return null;
  } else {
    if (!window.hasOwnProperty('webkitAudioContext')) {
      WX.log.error('WAAX currently does not support FireFox due to its incomplete implementation of Web Audio API. Use Chrome or Safari. bye.');
      return null;
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
   * internal variables
   */
  // audio context
  var _ctx = new AudioContext();
  // unit stack for patch building
  var _unitStack = [];
  // ignore function (avoid prototype propagation)
  var _ignore = function () {
    return;
  };



  /**
   * system-wide variables, utilities
   */
  Object.defineProperties(WX, {
    // system flags and constant
    System: {
      value: {
        REVISION: 'r12',
        API_AVAILABLE: _kApiAvailable,
        LEGACY_SUPPORT: _kLegacySupport
      }
    },
    // audio context
    context: {
      value: _ctx
    },
    // now
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
    // creates a patch from a collection of WX units
    patch: {
      set: function (value) {
        if (isNaN(value) || value > 0) {
          WX.log.warn('not a valid patch.');
          _unitStack.length = 0;
          return false;
        }
        if (_unitStack.length < 2) {
          WX.log.warn('not enough units to connect.');
          _unitStack.length = 0;
          return false;
        } else {
          for (var i = 0; i < _unitStack.length - 1; i++) {
            if (_unitStack[i].outlet && _unitStack[i + 1].inlet) {
              console.log(_unitStack[i].params.pLabel, _unitStack[i+1].params.pLabel);
              _unitStack[i].outlet.connect(_unitStack[i+1].inlet);
            } else {
              WX.log.warn('invalid unit found.');
              _unitStack.length = 0;
              return false;
            }
          }
          _unitStack.length = 0;
          return true;
        }
      },
      get: function () {
        return;
      }
    },

    // handling audio param from pParams setting
    setAudioParam: {
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
   * Unit Template, builder and audioParam setter
   */
  WX.UnitTemplate = function () {

    this.params = {
      pLabel: 'unlabeled',
      pActive: true
    };

    this.inlet = WX.context.createGain();
    this._nActive = WX.context.createGain();
    this._nBypass = WX.context.createGain();
    this.outlet = WX.context.createGain();

    this.inlet.connect(this._nBypass);
    this._nBypass.connect(this.outlet);
    this._nActive.connect(this.outlet);

    // NOTE: the real unit should have input, output gain node.
    // inlet => input, output => active

  };

  WX.UnitTemplate.prototype = {

    valueOf: function () {
      _unitStack.push(this);
      return 1;
    },
    connect: function (node) {
      this.outlet.connect(node);
    },

    _setActive: function (bool) {
      this._nActive.gain.value = bool ? 1.0 : 0.0;
      if (this._nBypass) {
        this._nBypass.gain.value = bool ? 0.0 : 1.0;
      }
    },
    _setGain: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nOutput.gain, value, transType, time1, time2);
    },

    setParam: function (param, value, transType, time1, time2) {
      if (this.params.hasOwnProperty(param)) {
        // update params
        this.params[param] = value;
        // execute corresponding _set functions
        var actorName = "_set" + param.slice(1);
        if (typeof this[actorName] === 'function') {
          this[actorName](value, transType, time1, time2);
        }
      }
      return this;
    },

    getParam: function (param) {
      if (this.params.hasOwnProperty(param)) {
        return this.params[param];
      } else {
        return null;
      }
    },

    setParams: function (params) {
      for (var param in params) {
        this.setParam(param, params[param]);
      }
      return this;
    },

    getParams: function () {
      return WX.clone(this.params);
    },

    _removeInlet: function () {
      this.inlet.disconnect();
      this._nBypass.disconnect();
      delete this.inlet;// = null;
      delete this._nBypass; // = null;
    }
  };

  // curve
  // MIDI

  /**
   * TODO: buffermap
   * @param {Object} bufferData key(name)-value(url) pair for buffer data
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
    // start recursion
    _recurseXHR(_data, 0);

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
      }
    };

  }

  WX.BufferMap = function (bufferMapData, oncomplete, onprogress) {
    return _BufferMap(bufferMapData, oncomplete, onprogress);
  };

  // start loading other units... go!
  WX.log.post('WAAX foundation loaded. (' + WX.System.REVISION + ')');

})(window.WX);