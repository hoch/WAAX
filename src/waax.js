/**
 * WAAX: Web Audio API eXtension
 *
 * @version   0.0.1-alpha
 * @author    hoch(hongchan.choi@gmail.com)
 * @license   MIT
 */


/**
 * @namespace WX
 */

window.WX = (function () {

  'use strict';


  /**
   * module: Info
   */

  var Info = (function () {

    var api_version = '0.0.1-alpha';

    return {
      getVersion: function () {
        return api_version;
      }
    };

  })();


  /**
   * module: Log
   */

  var Log = (function () {

    var logLevel = 1; // 3: error, 2: warn, 1: info
    var _c = window.console;

    return {
      setLevel: function (level) {
        logLevel = level;
      },
      info: function () {
        if (logLevel > 1) return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[WX:info]');
        _c.log.apply(_c, args);
      },
      warn: function () {
        if (logLevel > 2) return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[WX:warn]');
        _c.log.apply(_c, args);
      },
      // TODO: proper error throwing
      error: function (msg) {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[WX:error]');
        _c.log.apply(_c, args);
        throw new Error('[WX:error]');
      }
    };

  })();


  /**
   * module: Util
   */

  var Util = (function () {

    var LOG2 = Math.LN2,
        LOG10 = Math.LN10,
        MIDI1499 = 3.282417553401589e+38;

    return {

      /**
       * object manipulation, grabbed from here:
       * http://underscorejs.org/docs/underscore.html
       */

      isObject: function (obj) {
        return obj === Object(obj);
      },
      isArray: function (arr) {
        return toString.call(arr) === '[object Array]';
      },
      isNumber: function (num) {
        return toString.call(num) === '[object Number]';
      },
      hasParam: function(unit, param) {
        return hasOwnProperty.call(unit.preset, param);
      },
      extend: function (target, source) {
        for (var prop in source) {
          if (target[prop]) continue;
          target[prop] = source[prop];
        }
        return target;
      },
      clone: function (source) {
        var obj = {};
        for (var prop in source) {
          obj[prop] = source[prop];
        }
        return obj;
      },

      /**
       * music math helpers, mostly grabbed from here:
       * https://github.com/libpd/libpd/blob/master/pure-data/src/x_acoustics.c
       * https://lists.cs.princeton.edu/pipermail/chuck-users/2009-May/004182.html
       */

      clamp: function (value, min, max) {
        return Math.min(Math.max(value, min), max);
      },
      random2f: function (min, max) {
        return min + Math.random() * (max - min);
      },
      random2: function (min, max) {
        return Math.round(min + Math.random() * (max - min));
      },
      mtof: function (midi) {
        if (midi <= -1500) return 0;
        else if (midi > 1499) return MIDI1499;
        else return 440.0 * Math.pow(2, (Math.floor(midi) - 69) / 12.0);
      },
      ftom: function (freq) {
        return Math.floor(freq > 0 ? Math.log(freq/440.0) / LOG2 * 12 + 69 : -1500);
      },
      // NOTE: dbtopow(), dbtorms(), powtodb(), powtorms() off by 100 db.
      //       It is easy to use MIDI velocity numbers to change volume.
      //       This is the same convention that Pure Data uses.
      //       This behavior might change in the future.
      powtodb: function (pow) {
        if (pow <= 0) return 0;
        else {
          var db = 100 + 10.0 / LOG10 * Math.log(pow);
          return db < 0 ? 0 : db;
        }
      },
      dbtopow: function (db) {
        if (db <= 0) return 0;
        else {
          // TODO: what is 870?
          if (db > 870) db = 870;
          return Math.exp(LOG10 * 0.1 * (db - 100.0));
        }
      },
      rmstodb: function (rms) {
        if (rms <= 0) return 0;
        else {
          var db = 100 + 20.0 / LOG10 * Math.log(rms);
          return db < 0 ? 0 : db;
        }
      },
      dbtorms: function (db) {
        if (db <= 0) return 0;
        else {
          // TODO: what is 485?
          if (db > 485) db = 485;
          return Math.exp(LOG10 * 0.05 * (db - 100.0));
        }
      },
      // lintodb: linear amp to db from older version of WAAX
      lintodb: function (lin) {
        // if below -100dB, set to -100dB to prevent taking log of zero
        return 20.0 * (lin > 0.00001 ? (Math.log(lin) / LOG10) : -5.0);
      },
      // dbtolin: db to linear amp, useful for dBFS conversion
      dbtolin: function (db) {
        // if (db <= 0) return 0;
        return Math.pow(10.0, db / 20.0);
      },

      /**
       * patching helper
       */

      patch: function () {
        for (var i = 0, last = arguments.length-1; i < last; i++) {
          arguments[i]._outlet.connect(arguments[i+1]._inlet);
        }
      }
    };
  })();


  /**
   * feature detection: web audio api, AudioContext
   */

  if (!window.hasOwnProperty('webkitAudioContext') &&
    !window.hasOwnProperty('AudioContext')) {
    // FATAL: non-supported browser. stop everything and escape.
    Log.error('Web Audio API is not supported. ' +
      'See http://caniuse.com/audio-api for more info.');
  } else {
    if (window.hasOwnProperty('webkitAudioContext')) {
      window.AudioContext = window.webkitAudioContext;
    }
  }


  /**
   * module: WAAX Core
   */

  var Core = (function () {

    var ctx = new AudioContext();

    return {
      context: ctx,
      Gain: function () { return ctx.createGain(); },
      OSC: function () { return ctx.createOscillator(); },
      Delay: function () { return ctx.createDelay(); },
      Filter: function () { return ctx.createBiquadFilter(); },
      Comp: function () { return ctx.createDynamicsCompressor(); },
      Convolver: function () { return ctx.createConvolver(); },
      WaveShaper: function () { return ctx.createWaveShaper(); },
      Source: function () { return ctx.createBufferSource(); },
      Analyzer: function () { return ctx.createAnalyser(); },
      Panner: function () { return ctx.createPanner(); },
      // nPeriodicWave: function () { return ctx.createPeriodicWave(); },
      Splitter: function () { return ctx.createChannelSplitter.apply(ctx, arguments); },
      Merger: function () { return ctx.createChannelMerger.apply(ctx, arguments); },
      Buffer: function () { return ctx.createBuffer.apply(ctx, arguments); }
    };

  })();


  /**
   * @function Envelope generator
   * @description Create an envelope generator function for WA audioParam
   *   - Envelope data point: [val, offsetTimes, transition_type]
   *   - transition types: { 0: jump, 1: linear, 2: expo, 3: target }
   * @example
   *   // build an envelope generator with relative data points
   *   var AttRelEnv = WX.Envelope([0.0, 0.0], [0.8, 0.01, 1], [0.0, 0.3, 2]);
   *   // creates an envelope starts at 2.0 sec.
   *   var env = AttRelEnv(2.0);
   */

  function Envelope() {
    var args = arguments;
    return function (startTime) {
      var env = [];
      startTime = (startTime || 0);
      for (var i = 0; i < args.length; i++) {
        var val = args[i][0], time;
        // for setTargetAtTime - [t1, t2]
        if (Util.isArray(args[i][1])) {
          time = [startTime + args[i][1][0], startTime + args[i][1][1]];
          env.push([val, time, 3]);
        }
        // for jump, linear, expo
        else {
          time = startTime + args[i][1];
          env.push([val, time, (args[i][2] || 0)]);
        }
      }
      return env;
    };
  }


  /**
   * @class WA audioParam abstraction
   * @type {string} parameter type: ['bool', 'number', 'enum']
   */

  function Param(options) {
    this.type = (options.type || 'number');
    if (this.type === 'enum') {
      this.items = options.items;
    }
    this.default = options.default;
    this.min = options.min;
    this.max = options.max;
    this.target = options.target; // target audioParam

    this.init();
  }

  Param.prototype = {

    init: function () {
      switch (this.type) {
        case 'bool':
          this.set = this._setBool;
          break;
        case 'number':
          this.set = this._setNumber;
          break;
        case 'enum':
          this.set = this._setEnum;
          this.get = this._getEnum;
          break;
      }
      this.set(this.default, 0.0, 0);
    },

    get: function () {
      return this.target.value;
    },

    set: null,

    _setBool: function (val) {
      val = val ? this.max : this.min;
      this.target.setValueAtTime(val, 0.0);
    },

    _setNumber: function (val, time, xType) {
      val = Math.min(Math.max(val, this.min), this.max);
      switch (xType) {
        case 0:
          this.target.setValueAtTime(val, time);
          break;
        case 1:
          this.target.linearRampToValueAtTime(val, time);
          break;
        case 2:
          val = val <= 0.0 ? 0.00001 : val;
          this.target.exponentialRampToValueAtTime(val, time);
          break;
        case 3:
          val = val <= 0.0 ? 0.00001 : val;
          this.target.setTargetAtTime(val, time[0], time[1]);
          break;
      }
    },

    _setEnum: function (val) {
      if (this.items.indexOf(val) > -1) {
        this.target = val;
      } else {
        return null;
      }
    },

    _getEnum: function () {
      return this.target;
    }

  };


  /**
   * @function    loadClip
   * @description load audio file via xhr where clip = { name, url, buffer }
   */

  function loadClip(clip, onprogress, oncomplete) {
    // setup
    var xhr = new XMLHttpRequest();
    xhr.open('GET', clip.url, true);
    xhr.responseType = 'arraybuffer';
    // EVENT: onprogress
    xhr.onprogress = function (event) {
      onprogress(clip.name, event);
    };
    // EVENT: onload
    xhr.onload = function (event) {
      try {
        Core.context.decodeAudioData(xhr.response, function (buffer) {
          clip.buffer = buffer;
        });
        oncomplete();
      } catch (error) {
        Info.error('Loading clip failed. (XHR failure)', error.message, clip.url);
      }
    };
    xhr.send();
  }


  /**
   * Plug-in module structure
   *
   *         inlet
   *           |
   *      +----+----+
   *   _input       |
   *      |         |
   *   UnitBody     |
   *      |         |
   *   _output      |
   *      |         |
   *   _active   _bypass
   *      +----+----+
   *           |
   *         outlet
   *
   * # Naming convention
   *   - _node: web audio node starts with '_'
   *   - $param: parameter handler starts with '$'
   *
   * 1) base module
   *   - preset: active
   *   - nodes: _active
   *   - methods: get, set, getPreset, setPreset
   *   - handlers: $active
   * 2) input module
   *   - params: inputGain
   *   - nodes: _inlet >> _input, _bypass
   *   - handlers: $inputGain
   * 3) output module
   *   - params: gain
   *   - nodes: _output >> _active >> _outlet, _inlet >> _bypass >> _outlet
   *   - methods: to, connect
   *   - handlers: $gain
   */

  var Plugin = (function () {

    /**
     * BaseModule: base module for plug-in unit, mandatory
     *
     * @property {object} preset collection of parameters
     * @method set
     * @method get
     * @method setPreset
     * @method getPreset
     *
     * @param {bool} active unit state.
     *                      when false the unit does not output sound.
     */

    var BaseModule = function () {
      // node
      this._active = Core.Gain();

      // preset: parameter collection for external usage
      this.preset = {
        active: true
      };

      // params: internal parameter collection
      this.params = {
        active: new Param({
          type: 'bool', default: true, min: 0.0, max: 1.0,
          target: this._active.gain
        })
      };
    };

    BaseModule.prototype = {
      // NOTE:
      // this implements one-way binding (set method -> this.params)
      // setting 'param' can control multiple WA audioParams
      set: function (param, arg) {
        if (Util.hasParam(this, param)) {
          // if env is number or boolean, change param immediately
          if (!Util.isArray(arg)) {
            this['$'+param].apply(this, [arg, 0.0, 0]);
            // change preset value
            this.preset[param] = arg;
          }
          // if env is an array, iterate envelope data
          else {
            for (var i = 0; i < arg.length; i++) {
              this['$'+param].apply(this, arg[i]);
            }
            // TODO:
            // currently change params with the last value
            // what is the correct way of doing this?
            this.preset[param] = arg[arg.length-1][0];
          }
        }
        return this;
      },

      get: function (param) {
        if (Util.hasParam(this, param)) {
          return this.preset[param];
        } else {
          return null;
        }
      },

      setPreset: function (preset) {
        for (var param in preset) {
          this.set(param, preset[param]);
        }
      },

      getPreset: function () {
        return Util.clone(this.preset);
      },

      // handler: 'active'
      $active: function (val, time, xType) {
        // NOTE: this is 'bool' type
        this.params.active.set(val);
      }
    };


    /**
     * InputModule: input module of plug-in unit
     */

    var InputModule = function () {
      // WA nodes
      this._inlet = Core.Gain();
      this._input = Core.Gain();
      this._bypass = Core.Gain();

      // preset & params
      this.preset.inputGain = 1.0;
      this.params.inputGain = new Param({
        type: 'number', default: 1.0, min: 0.0, max: 1.0,
        target: this._input.gain
      });

      // patching
      this._inlet.connect(this._input);
      this._inlet.connect(this._bypass);
    };

    InputModule.prototype = {
      // handler: 'inputGain'
      $inputGain: function (val, time, xType) {
        this.params.inputGain.set(val, time, xType);
      }
    };


    /**
     * OutputModule: output module of plug-in unit
     */

    var OutputModule = function () {
      // WA nodes
      this._output = Core.Gain();
      this._outlet = Core.Gain();
      // preset & params
      this.preset.gain = 1.0;
      this.params.gain = new Param({
        type: 'number', default: 1.0, min: 0.0, max: 1.0,
        target: this._output.gain
      });
      // patching
      this._output.connect(this._active);
      this._active.connect(this._outlet);
    };

    OutputModule.prototype = {
      to: function (unit) {
        if (unit._inlet) {
          this._outlet.connect(unit._inlet);
          return unit;
        } else {
          Log.error('invalid patching.');
        }
      },
      connect: function (node) {
        this._outlet.connect(node);
      },
      // handler: gain
      $gain: function (val, time, xType) {
        this.params.gain.set(val, time, xType);
      }
    };


    /**
     * plugin utility functions
     * @note See plugin_template.js for the example usage
     */

    // pre procedure for plugin building
    function addModule(unit, modules) {
      // mandatory
      BaseModule.call(unit);
      // selective module loading
      if (modules.indexOf('input') > -1) InputModule.call(unit);
      if (modules.indexOf('output') > -1) OutputModule.call(unit);
    }

    // add parameter to plugin
    function addParam(unit, paramName, option) {
      unit.params[paramName] = new Param(option);
    }

    // post procedure for plugin building
    function initializePreset(unit, preset) {
      Util.extend(unit.preset, unit.defaultPreset);
      Util.extend(unit.preset, preset);
      unit.setPreset(unit.preset);
    }

    // extending plugin prototype
    function addPrototype(unit, modules) {
      // mandatory
      Util.extend(unit.prototype, BaseModule.prototype);
      // selective module loading
      if (modules.indexOf('input') > -1) {
        Util.extend(unit.prototype, InputModule.prototype);
      }
      if (modules.indexOf('output') > -1) {
        Util.extend(unit.prototype, OutputModule.prototype);
      }
    }

    // register plugin constructor to WX namespace
    function register(Constructor) {
      // hard check version info
      var i = Constructor.prototype.info;
      if (Info.getVersion() > i.api_version) {
        // FATAL: plugin is incompatible with WX Core.
        Log.error(Constructor.name, ': loading failed. incompatible WAAX version.');
      }
      // register plugin in WX namespace
      window.WX[Constructor.name] = function (preset) {
        return new Constructor(preset);
      };
    }


    /**
     * @namespace WX.plugin
     */

    return {
      addModule: addModule,
      addParam: addParam,
      initializePreset: initializePreset,
      addPrototype: addPrototype,
      register: register,
    };

  })();


  /**
   * initialization and bootup
   */

  (function () {

    Log.info('WAAX', Info.getVersion(), '(' + Core.context.sampleRate + 'Hz)');

  })();


  /**
   * public methods
   */

  return {

    // Info & Log
    Info: Info,
    Log: Log,

    // Utilities
    isObject: Util.isObject,
    isArray: Util.isArray,
    isNumber: Util.isNumber,
    hasParam: Util.hasParam,
    extend: Util.extend,
    clone: Util.clone,
    clamp: Util.clamp,
    random2f: Util.random2f,
    random2: Util.random2,
    mtof: Util.mtof,
    ftom: Util.ftom,
    powtodb: Util.powtodb,
    dbtopow: Util.dbtopow,
    rmstodb: Util.rmstodb,
    dbtorms: Util.dbtorms,
    lintodb: Util.lintodb,
    dbtolin: Util.dbtolin,
    patch: Util.patch,

    // Audio-related methods and classes
    Envelope: Envelope,
    Param: Param,
    loadClip: loadClip,

    // WAAX Core
    context: Core.context,
    get now () { return Core.context.currentTime; },
    get srate () { return Core.context.sampleRate; },
    Gain: Core.Gain,
    OSC: Core.OSC,
    Delay: Core.Delay,
    Filter: Core.Filter,
    Comp: Core.Comp,
    Convolver: Core.Convolver,
    WaveShaper: Core.WaveShaper,
    Source: Core.Source,
    Analyzer: Core.Analyzer,
    Panner: Core.Panner,
    // PeriodicWave: Core.PeriodicWave,
    Splitter: Core.Splitter,
    Merger: Core.Merger,
    Buffer: Core.Buffer,

    // Plug-in builders
    Plugin: Plugin

  };

})();


/**
 * Fader: Built-in Plugin
 */

(function (WX) {

  function Fader(preset) {
    // adding modules
    WX.Plugin.addModule(this, ['input', 'output']);
    // do internal stuffs
    this._input.connect(this._output);
    // initialize preset
    WX.Plugin.initializePreset(this, preset);
  }

  Fader.prototype = {
    info: {
      name: 'Fader',
      api_version: '0.0.1-alpha',
      plugin_version: '0.0.1',
      author: 'hoch',
      type: 'effect',
      description: 'a channel fader'
    },

    defaultPreset: {
      mute: false,
      dB: 0.0,
      // panning: 0.0;
    },

    $active: function (val, time, xType) {
      this.preset.mute = !val;
      this.params.active.set(val);
    },

    $gain: function (val, time, xType) {
      this.preset.dB = WX.lintodb(val);
      this.params.gain.set(val, time, xType);
    },

    // simple proxies for gain and active
    $mute: function (val, time, xType) {
      this.set('active', !val);
    },

    $dB: function (val, time, xType) {
      this.set('gain', [[WX.dbtolin(val), time, xType]]);
    }

  };

  WX.Plugin.addPrototype(Fader, ['input', 'output']);
  WX.Plugin.register(Fader);

  // built in master output fader
  WX.Master = WX.Fader();
  WX.Master.connect(WX.context.destination);

})(WX);