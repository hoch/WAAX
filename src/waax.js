/**
 * WAAX: Web Audio API eXtension
 *
 * @version   1.0.0-alpha
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

    var api_version = '1.0.0-alpha';

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
      isFunction: function (fn) {
        return toString.call(fn) === '[object Function]';
      },
      isArray: function (arr) {
        return toString.call(arr) === '[object Array]';
      },
      isNumber: function (num) {
        return toString.call(num) === '[object Number]';
      },
      isBoolean: function (bool) {
        return toString.call(bool) === '[object Boolean]';
      },
      hasParam: function(plugin, param) {
        return hasOwnProperty.call(plugin.params, param);
      },
      extend: function (target, source) {
        // if source property exists in target, overwrite
        // if not, just add source property
        for (var prop in source) {
          // if (target[prop]) continue;
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
      veltoamp: function (velocity) {
        // TODO: velocity curve here?
        return velocity / 127;
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
   *
   * + AudioNode extension
   * + AudioParam extension
   * + Envelope
   * + GenericParam
   * + ItemizedParam
   * + BooleanParam
   * + createParam
   * + loadClip
   *
   * + AudioContext
   * + AudioNode shorthands
   */

  var Core = (function () {

    // context
    var ctx = new AudioContext();

    // WARNING: AudioNode extension
    AudioNode.prototype.to = function () {
      for (var i = 0; i < arguments.length; i++) {
        this.connect(arguments[i]);
      }
      return arguments[0];
    };

    AudioNode.prototype.cut = function () {
      this.disconnect();
    };

    // WARNING: AudioParam extension
    var WAP = window.AudioParam.prototype;
    WAP.cancel = WAP.cancelScheduledValues;
    WAP.set = function (value, time, rampType) {
      switch (rampType) {
        case 0:
        case undefined:
          time = (time < ctx.currentTime) ? ctx.currentTime : time;
          this.setValueAtTime(value, time);
          break;
        case 1:
          time = (time < ctx.currentTime) ? ctx.currentTime : time;
          this.linearRampToValueAtTime(value, time);
          break;
        case 2:
          time = (time < ctx.currentTime) ? ctx.currentTime : time;
          value = value <= 0.0 ? 0.00001 : value;
          this.exponentialRampToValueAtTime(value, time);
          break;
        case 3:
          time[0] = (time[0] < ctx.currentTime) ? ctx.currentTime : time[0];
          value = value <= 0.0 ? 0.00001 : value;
          this.setTargetAtTime(value, time[0], time[1]);
          break;
      }
    };


    /**
     * @function Envelope generator
     * @description Create an envelope generator function for WA audioParam
     *   - Envelope data point: [val, offsetTimes, transition_type]
     *   - transition types: { 0: step, 1: line, 2: expo, 3: target }
     * @example
     *   // build an envelope generator with relative data points
     *   var AttRelEnv = WX.Envelope([0.0, 0.0], [0.8, 0.01, 1], [0.0, 0.3, 2]);
     *   // creates an envelope starts at 2.0 sec with 1.2 amplification.
     *   var env = AttRelEnv(2.0, 1.2);
     */

    function Envelope() {
      var args = arguments;
      return function (startTime, amplifier) {
        var env = [];
        startTime = (startTime || 0);
        amplifier = (amplifier || 1.0);
        for (var i = 0; i < args.length; i++) {
          var val = args[i][0], time;
          // case: target
          if (Util.isArray(args[i][1])) {
            time = [startTime + args[i][1][0], startTime + args[i][1][1]];
            env.push([val * amplifier, time, 3]);
          }
          // case: step, line, expo
          else {
            time = startTime + args[i][1];
            env.push([val * amplifier, time, (args[i][2] || 0)]);
          }
        }
        return env;
      };
    }


    /**
     * @class Plug-in parameter abstraction
     * @type {string} parameter type:
     *       generic      all generic numbers
     *       indexed      enums (list)
     *       boolean      true | false
     *       MIDINumber   0 ~ 127
     *       custom       etc
     */

    var types = [
      'Generic',
      'Items',
      'Boolean',
      'MIDINumber',
      'Custom'
    ];

    var units = [
      '',
      'Octave',
      'Semitone',
      'Seconds',
      'Milliseconds',
      'Samples',
      'Hertz',
      'Cents',
      'Decibels',
      'LinearGain',
      'Percent',
      'BPM'
    ];


    /**
     * GenericParam: all numerical parameters
     */

    function GenericParam(options) {
      this.init(options);
    }

    GenericParam.prototype = {
      init: function (options) {
        this.type = options.type;
        this.name = (options.name || 'Parameter');
        this.unit = (options.unit || '');
        // TODO: check for case of '0.0'...
        this.default = (options.default || 1.0);
        this.value = this.default;
        this.min = (options.min || 0.0);
        this.max = (options.max || 1.0);
        // handler callback assignment
        this._parent = options._parent;
        this.$callback = options._parent['$' + options._paramId];
      },
      set: function (value, time, rampType) {
        // set value in this parameter instance
        this.value = Util.clamp(value, this.min, this.max);
        // then call hander if it's defined
        if (this.$callback) {
          this.$callback.call(this._parent, this.value, time, rampType);
        }
      },
      get: function () {
        return this.value;
      }
    };


    /**
     * ItemizedParam: itemized parameter (aka list, select)
     */

    function ItemizedParam(options) {
      this.init(options);
    }

    ItemizedParam.prototype = {
      init: function (options) {
        // assertion
        if (!Util.isArray(options.items)) {
          Log.error('Items are missing.');
        }
        this.type = options.type;
        this.label = (options.label || 'Select');
        this.unit = (options.unit || '');
        this.default = (options.default || options.items[0]);
        this.value = this.default;
        this.items = options.items;
        // handler callback assignment
        this._parent = options._parent;
        this.$callback = options._parent['$' + options._paramId];
      },
      set: function (value, time, rampType) {
        if (this.items.indexOf(value) > -1) {
          this.value = value;
          if (this.$callback) {
            this.$callback.call(this._parent, this.value, time, rampType);
          }
        }
      },
      get: function () {
        return this.value;
      },
      getItems: function () {
        return this.items.slice(0);
      }
    };


    /**
     * BooleanParam: boolean parameter
     */

    function BooleanParam(options) {
      this.init(options);
    }

    BooleanParam.prototype = {
      init: function (options) {
        // assertion
        if (!Util.isBoolean(options.default)) {
          Log.error('Invalid value for Boolean Parameter.');
        }
        this.parent = options.parent;
        this.type = options.type;
        this.name = (options.name || 'Parameter');
        this.default = (options.default || false);
        this.value = this.default;
        // handler callback assignment
        this._parent = options._parent;
        this.$callback = options._parent['$' + options._paramId];
      },
      set: function (value, time, rampType) {
        if (Util.isBoolean(value)) {
          this.value = value;
          if (this.$callback) {
            this.$callback.call(this._parent, this.value, time, rampType);
          }
        }
      },
      get: function () {
        return this.value;
      }
    };

    // TODO
    // function MIDINumberParam(options) {
    // }
    // MIDINumberParam.prototype = {
    // };
    // function CustomParam (options) {
    // }
    // CustomParam.prototype = {
    // };


    // param class factory
    function createParam(options) {
      if (types.indexOf(options.type) < 0) {
        Log.error('Invalid Parameter Type.');
      }
      switch (options.type) {
        case 'Generic':
          return new GenericParam(options);
        case 'Items':
          return new ItemizedParam(options);
        case 'Boolean':
          return new BooleanParam(options);
      }
    }


    /**
     * @function    loadClip
     * @description load audio file via xhr
     *              where clip = { name:, url:, buffer: }
     */

    function loadClip(clip, onprogress, oncomplete) {
      // setup
      var xhr = new XMLHttpRequest();
      xhr.open('GET', clip.url, true);
      xhr.responseType = 'arraybuffer';
      // EVENT: onprogress
      xhr.onprogress = function (event) {
        onprogress(event, clip);
      };
      // EVENT: onload
      xhr.onload = function (event) {
        try {
          Core.ctx.decodeAudioData(xhr.response, function (buffer) {
            clip.buffer = buffer;
            oncomplete(clip);
          });
        } catch (error) {
          Info.error('Loading clip failed. (XHR failure)', error.message, clip.url);
        }
      };
      xhr.send();
    }


    /**
     * core module public methods
     */

    return {

      // audio context
      ctx: ctx,

      // WA nodes shorthands
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
      PeriodicWave: function () {
        return ctx.createPeriodicWave.apply(ctx, arguments);
      },
      Splitter: function () {
        return ctx.createChannelSplitter.apply(ctx, arguments);
      },
      Merger: function () {
        return ctx.createChannelMerger.apply(ctx, arguments);
      },
      Buffer: function () {
        return ctx.createBuffer.apply(ctx, arguments);
      },

      // envlope generator
      Envelope: Envelope,
      // generate parameter helper for plugin
      defineParams: function (plugin, paramsOption) {
        for (var name in paramsOption) {
          paramsOption[name]._parent = plugin;
          paramsOption[name]._paramId = name;
          // paramsOption[name].$handler = plugin['$' + name];
          plugin.params[name] = createParam(paramsOption[name]);
        }
      },
      // load clip via xhr
      loadClip: loadClip

    };

  })();


  /**
   * Routing system
   *
   * plugin.set('param', arg):
   *   if (arg is val):
   *     plugin.param.set(val, 0.0, 0)
   *
   * if (arg is arr):
   *   iterate(arr) => plugin.param.set(arr[i])
   *
   * param.set(v, t, x):
   *   typeCheck(v)
   *   clamp(v) with min, max
   *   handlerCallback(v, t, x)
   *   parent.$[paramId](v, t, x)
   *
   * HOW to link handerCallback??
   *
   * plugin.$.paramHandler(v, t, x):
   *     node.param.$set(v, t, x);
   *     node1.param.$set(v, t, x);
   *     node2.param.$set(v, t, x);
   */


  /**
   * Plug-in builder
   */

  var Plugin = (function () {

    /**
     * Abstracts (as matter of facts, mixins)
     * - PluginAbstract
     * - GeneratorAbstract
     * - ProcessorAbstract
     * - AnalyzerAbstract
     */

    // plug-in types
    var types = [
      'Generator',
      'Processor',
      'Analyzer'
    ];


    /**
     * Plugin Abstract: base class
     */

    function PluginAbstract () {
      this.params = {};
    }

    PluginAbstract.prototype = {
      set: function (param, arg) {
        if (Util.hasParam(this, param)) {
          // check if arg is a value or array
          if (Util.isArray(arg)) {
            // if env is an array, iterate envelope data
            // where array is arg_i = [value, time, rampType]
            for (var i = 0; i < arg.length; i++) {
              this.params[param].set.apply(this, arg[i]);
            }
          } else {
            // otherwise change the value immediately
            this.params[param].set(arg, Core.ctx.currentTime, 0);
          }
        }
        return this;
      },
      get: function (param) {
        if (Util.hasParam(this, param)) {
          return this.params[param].get();
        } else {
          return null;
        }
      },
      setPreset: function (preset) {
        for (var param in preset) {
          // console.log(param);
          this.params[param].set(preset[param], Core.ctx.currentTime, 0);
        }
      },
      getPreset: function () {
        var preset = {};
        for (var param in this.params) {
          preset[param] = this.params[param].get();
        }
        return preset;
      }
    };


    /**
     * GeneratorAbstract: extends PluginAbstract
     */

    function GeneratorAbstract() {

      PluginAbstract.call(this);

      this._output = Core.Gain();
      this._outlet = Core.Gain();

      this._output.to(this._outlet);

      Core.defineParams(this, {
        output: {
          type: 'Generic', unit: 'LinearGain',
          default: 1.0, min: 0.0, max: 1.0
        }
      });

    }

    GeneratorAbstract.prototype = {

      to: function (input) {
        // if the target is plugin with inlet
        if (input._inlet) {
          this._outlet.to(input._inlet);
          return input;
        }
        // or it might be a WA node
        else {
          try {
            this._outlet.to(input);
            return input;
          } catch (error) {
            Log.error('Connection failed. Invalid patching.');
          }
        }
      },

      cut: function () {
        // not recommended, this will deactivate signal stream
        this._outlet.cut();
      },

      $output: function (value, time, xtype) {
        this._output.gain.set(value, time, xtype);
      }

    };

    Util.extend(GeneratorAbstract.prototype, PluginAbstract.prototype);


    /**
     * ProcessorAbstract: extends PluginAbstract
     */

    function ProcessorAbstract() {

      PluginAbstract.call(this);

      this._inlet = Core.Gain();
      this._input = Core.Gain();
      this._output = Core.Gain();
      this._active = Core.Gain();
      this._bypass = Core.Gain();
      this._outlet = Core.Gain();

      this._inlet.to(this._input, this._bypass);
      this._output.to(this._active).to(this._outlet);
      this._bypass.to(this._outlet);

      Core.defineParams(this, {
        input: {
          type: 'Generic', unit: 'LinearGain',
          default: 1.0, min: 0.0, max: 1.0
        },
        output: {
          type: 'Generic', unit: 'LinearGain',
          default: 1.0, min: 0.0, max: 1.0
        },
        bypass: {
          type: 'Boolean', default: false
        }
      });

    }

    ProcessorAbstract.prototype = {

      $input: function (value, time, xtype) {
        this._input.gain.set(value, time, xtype);
      },

      $bypass: function(value, time, xtype) {
        if (value) {
          this._active.gain.set(0.0, time, xtype);
          this._bypass.gain.set(1.0, time, xtype);
        } else {
          this._active.gain.set(1.0, time, xtype);
          this._bypass.gain.set(0.0, time, xtype);
        }
      }

    };

    Util.extend(ProcessorAbstract.prototype, GeneratorAbstract.prototype);


    /**
     * AnalyzerAbstract: extends PluginAbstract
     */

    function AnalyzerAbstract() {

      PluginAbstract.call(this);

      this._inlet = Core.Gain();
      this._input = Core.Gain();
      this._outlet = Core.Gain();

      this._inlet.to(this._input);
      this._inlet.to(this._outlet);

      Core.defineParams(this, {
        input: {
          type: 'Generic', unit: 'LinearGain',
          default: 1.0, min: 0.0, max: 1.0
        }
      });

    }

    AnalyzerAbstract.prototype = {

      to: function (input) {
        // if the target is plugin with inlet
        if (input._inlet) {
          this._outlet.to(input._inlet);
          return input;
        }
        // or it might be a WA node
        else {
          try {
            this._outlet.to(input);
            return input;
          } catch (error) {
            Log.error('Connection failed. Invalid patching.');
          }
        }
      },

      cut: function () {
        this._outlet.cut();
      },

      $input: function (value, time, xtype) {
        this._input.gain.set(value, time, xtype);
      }

    };

    Util.extend(AnalyzerAbstract.prototype, PluginAbstract.prototype);


    /**
     * @namespace WX.plugin
     */

    return {

      defineType: function (plugin, type) {
        // check: length should be less than 3
        if (types.indexOf(type) < 0) {
          Log.error('Invalid Plug-in type.');
        }
        // branch on plug-in type
        switch (type) {
          case 'Generator':
            GeneratorAbstract.call(plugin);
            break;
          case 'Processor':
            ProcessorAbstract.call(plugin);
            break;
          case 'Analyzer':
            AnalyzerAbstract.call(plugin);
            break;
        }
      },

      initPreset: function (plugin, preset) {
        var merged = Util.clone(plugin.defaultPreset);
        Util.extend(merged, preset);
        plugin.setPreset(merged);
      },

      extendPrototype: function (plugin, type) {
        // check: length should be less than 3
        if (types.indexOf(type) < 0) {
          Log.error('Invalid Plug-in type.');
        }
        // branch on plug-in type
        switch (type) {
          case 'Generator':
            Util.extend(plugin.prototype, GeneratorAbstract.prototype);
            break;
          case 'Processor':
            Util.extend(plugin.prototype, ProcessorAbstract.prototype);
            break;
          case 'Analyzer':
            Util.extend(plugin.prototype, AnalyzerAbstract.prototype);
            break;
        }
      },

      register: function (PluginConstructor) {
        // hard check version info
        var i = PluginConstructor.prototype.info;
        if (Info.getVersion() > i.api_version) {
          // FATAL: pluginConstructor is incompatible with WX Core.
          Log.error(PluginConstructor.name, ': loading failed. incompatible WAAX version.');
        }
        // register pluginConstructor in WX namespace
        window.WX[PluginConstructor.name] = function (preset) {
          return new PluginConstructor(preset);
        };
      }

      // patch: function () {
      //   for (var i = 0, i < arguments.length-1; i++) {
      //     arguments[i]._outlet.to(arguments[i+1]._inlet);
      //   }
      // }

    };

  })();


  /**
   * initialization and bootup
   */

  (function () {

    Log.info('WAAX', Info.getVersion(), '(' + Core.ctx.sampleRate + 'Hz)');

  })();


  /**
   * public methods
   */

  return {

    // Info, Log
    Info: Info,
    Log: Log,

    // Util: Object
    isObject: Util.isObject,
    isFunction: Util.isFunction,
    isArray: Util.isArray,
    isNumber: Util.isNumber,
    isBoolean: Util.isBoolean,
    hasParam: Util.hasParam,
    extend: Util.extend,
    clone: Util.clone,

    // Util: Music Math
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
    veltoamp: Util.veltoamp,

    // WAAX Core
    context: Core.ctx,
    get now () { return Core.ctx.currentTime; },
    get srate () { return Core.ctx.sampleRate; },
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
    Envelope: Core.Envelope,
    defineParams: Core.defineParams,
    loadClip: Core.loadClip,

    // Plug-in builders
    Plugin: Plugin

  };

})();


/**
 * MUI: Musical User Interface module (for Polymer integration)
 *
 * @description   This module includes some utilities for keyboard and mouse
 *                responders, because music-specific GUI elements require
 *                non-standard user interaction. The functionality might be
 *                integrated into Polymer custom element, but the code is
 *                currently used for bridging the gap between WAAX and Polymer.
 */

window.MUI = (function (WX) {

  /**
   * MouseResponder
   */

  function MouseResponder(senderID, targetElement, MUICallback) {
    this.senderId = senderID;
    this.container = targetElement;
    this.callback = MUICallback;
    // bound function references
    this.ondragged = this.dragged.bind(this);
    this.onreleased = this.released.bind(this);
    // timestamp
    this._prevTS = 0;
    // init with onclick
    this.onclicked(targetElement);
  }

  MouseResponder.prototype = {
    getEventData: function (event) {
      var r = this.container.getBoundingClientRect();
      return {
        x: event.clientX - r.left,
        y: event.clientY - r.top,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
      };
    },
    onclicked: function (target) {
      target.addEventListener('mousedown', function (event) {
        event.preventDefault();
        this._prevTS = event.timeStamp;
        var p = this.getEventData(event);
        this.callback(this.senderId, 'clicked', p);
        window.addEventListener('mousemove', this.ondragged, false);
        window.addEventListener('mouseup', this.onreleased, false);
      }.bind(this), false);
    },
    dragged: function (event) {
      event.preventDefault();
      if (event.timeStamp - this._prevTS < 16.7) {
        return;
      }
      this._prevTS = event.timeStamp;
      var p = this.getEventData(event);
      this.callback(this.senderId, 'dragged', p);
    },
    released: function (event) {
      event.preventDefault();
      var p = this.getEventData(event);
      this.callback(this.senderId, 'released', p);
      window.removeEventListener('mousemove', this.ondragged, false);
      window.removeEventListener('mouseup', this.onreleased, false);
    }
  };


  /**
   * KeyResponder
   */

  function KeyResponder(senderID, targetElement, MUICallback) {
    this.senderId = senderID;
    this.container = targetElement;
    this.callback = MUICallback;
    // bound function references
    this.onkeypress = this.keypressed.bind(this);
    this.onblur = this.finished.bind(this);
    // init with onclick
    this.onfocus(targetElement);
  }

  KeyResponder.prototype = {

    onfocus: function () {
      this.container.addEventListener('mousedown', function (event) {
        event.preventDefault();
        this.callback(this.senderId, 'clicked', null);
        this.container.addEventListener('keypress', this.onkeypress, false);
        this.container.addEventListener('blur', this.onblur, false);
      }.bind(this), false);
    },
    keypressed: function (event) {
      // event.preventDefault();
      this.callback(this.senderId, 'keypressed', event.keyCode);
    },
    finished: function (event) {
      // event.preventDefault();
      this.callback(this.senderId, 'finished', null);
      this.container.removeEventListener('keypress', this.onkeypress, false);
      this.container.removeEventListener('blur', this.onblur, false);
    }
  };


  /**
   * MUI Public Methods
   */

  return {

    // TODO: these are dupes...
    clamp: function (value, min, max) {
      return Math.max(Math.min(value, max), min);
    },

    clone: function (obj) {
      var cloned = {};
      for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
          cloned[p] = obj[p];
        }
      }
      return obj;
    },

    // TODO: collection has been changed with 0.0.1.
    //       reconsider this.
    findValueByKey: function (collection, key) {
      for (var i = 0; i < collection.length; i++) {
        if (collection[i].key === key) {
          return collection[i].value;
        }
      }
      // if key not found, just return the first item
      return collection[0].value;
    },

    findKeyByValue: function (collection, value) {
      for (var i = 0; i < collection.length; i++) {
        if (collection[i].value === value) {
          return collection[i].key;
        }
      }
    },

    MouseResponder: function (senderID, targetElement, MUICallback) {
      return new MouseResponder(senderID, targetElement, MUICallback);
    },

    KeyResponder: function (senderID, targetElement, MUICallback) {
      return new KeyResponder(senderID, targetElement, MUICallback);
    },

    $: function (elementId) {
      return document.getElementById(elementId);
    }

  };

})(WX);


/**
 * Fader: Built-in Stock Plugin
 */

(function (WX) {

  function Fader(preset) {
    // adding modules
    WX.Plugin.defineType(this, 'Processor');

    // do internal stuffs
    this._input.connect(this._output);

    WX.defineParams(this, {
      mute: {
        type: 'Boolean', default: false
      },
      dB: {
        type: 'Generic', unit: 'Decibels',
        default: 0.0, min: -90, max: 12.0
      }
    });

    // initialize preset
    WX.Plugin.initPreset(this, preset);
  }

  Fader.prototype = {

    info: {
      name: 'Fader',
      api_version: '1.0.0-alpha',
      plugin_version: '1.0.0',
      author: 'hoch',
      type: 'Processor',
      description: 'channel fader'
    },

    defaultPreset: {
      mute: false,
      dB: 0.0
    },

    $mute: function (value, time, xtype) {
      if (value) {
        this._outlet.gain.set(0.0, WX.now, 0);
      } else {
        this._outlet.gain.set(1.0, WX.now, 0);
      }
    },

    $dB: function (value, time, xtype) {
      this._output.gain.set(WX.dbtolin(value), time, xtype);
    }

  };

  WX.Plugin.extendPrototype(Fader, 'Processor');
  WX.Plugin.register(Fader);

  // built in master output fader
  WX.Master = WX.Fader();
  WX.Master.to(WX.context.destination);

})(WX);