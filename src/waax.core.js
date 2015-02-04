// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

//
// Parameter Abstractions
//

// parameter types for internal reference
var PARAM_TYPES = [
  'Generic',
  'Itemized',
  'Boolean'
];

// units for paramter
var PARAM_UNITS = [
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

// utility: check if the param arg is numeric
function wxparam_checkNumeric(arg, defaultValue) {
  if (WX.isNumber(arg)) {
    return arg;
  } else if (arg === undefined) {
    return defaultValue;
  } else {
    WX.Log.error('Invalid parameter configuration.');
  }
}

// Parameter factory. Creates an instance of paramter class.
function wxparam_create(options) {
  if (PARAM_TYPES.indexOf(options.type) < 0) {
    WX.Log.error('Invalid Parameter Type.');
  }
  switch (options.type) {
    case 'Generic':
      return new GenericParam(options);
    case 'Itemized':
      return new ItemizedParam(options);
    case 'Boolean':
      return new BooleanParam(options);
  }
}


/**
 * Generic parameter(numerical and ranged) abstraction. Usually called by
 *   {@link WX.defineParams} method.
 * @name GenericParam
 * @class
 * @param {Object} options Parameter configruation.
 * @param {String} options.name User-defined parameter name.
 * @param {String} options.unit Parameter unit.
 * @param {Number} options.default Default value.
 * @param {Number} options.value Parameter value.
 * @param {Number} options.min Minimum value.
 * @param {Number} options.max Maximum value.
 * @param {Object} options._parent Reference to associated Plug-in.
 */
function GenericParam(options) {
  this.init(options);
}

GenericParam.prototype = {

  /**
   * Initializes instance with options.
   * @memberOf GenericParam
   * @param  {Object} options Paramter configuration.
   */
  init: function (options) {
    this.type = 'Generic';
    this.name = (options.name || 'Parameter');
    this.unit = (options.unit || '');
    this.value = this.default = wxparam_checkNumeric(options.default, 0.0);
    this.min = wxparam_checkNumeric(options.min, 0.0);
    this.max = wxparam_checkNumeric(options.max, 1.0);
    // parent, reference to the plug-in
    this._parent = options._parent;
    // handler callback
    this.$callback = options._parent['$' + options._paramId];
  },

  /**
   * Sets parameter value with time and ramp type. Calls back
   *   a corresponding handler.
   * @memberOf GenericParam
   * @param {Number} value Parameter target value
   * @param {Number|Array} time time or array of [start time, time constant]
   * @param {Number} rampType WAAX ramp type
   */
  set: function (value, time, rampType) {
    // set value in this parameter instance
    this.value = WX.clamp(value, this.min, this.max);
    // then call hander if it's defined
    if (this.$callback) {
      this.$callback.call(this._parent, this.value, time, rampType);
    }
  },

  /**
   * Returns the paramter value. Note that this is not a computed value
   *   of WA AudioParam instance.
   * @memberOf GenericParam
   * @return {Number} Latest paramter value.
   */
  get: function () {
    return this.value;
  }

};

/**
 * Itemized parameter abstraction. Usually called by {@link WX.defineParams}
 *   method.
 * @name ItemizedParam
 * @class
 * @param {Object} options Parameter configruation.
 * @param {String} options.name User-defined parameter name.
 * @param {String} options.model Option items.
 * @param {Number} options.default Default item.
 * @param {Number} options.value Current item.
 * @param {Object} options._parent Reference to associated Plug-in.
 */
function ItemizedParam(options) {
  this.init(options);
}

ItemizedParam.prototype = {

  /**
   * Initializes instance with options.
   * @memberOf ItemizedParam
   * @param  {Object} options Paramter configuration.
   */
  init: function (options) {
    // assertion
    if (!WX.isArray(options.model)) {
      Log.error('Model is missing.');
    }
    if (!WX.validateModel(options.model)) {
      Log.error('Invalid Model.');
    }
    // initialization
    this.type = 'Itemized';
    this.name = (options.name || 'Select');
    this.model = options.model;
    this.default = (options.default || this.model[0].value);
    this.value = this.default;
    // caching parent
    this._parent = options._parent;
    // handler callback assignment
    this.$callback = options._parent['$' + options._paramId];
  },

  /**
   * Sets parameter value with time and ramp type. Calls back
   *   a corresponding handler.
   * @memberOf ItemizedParam
   * @param {Number} value Parameter target value
   * @param {Number|Array} time time or array of
   *   <code>[start time, time constant]</code>
   * @param {Number} rampType WAAX ramp type
   */
  set: function (value, time, rampType) {
    // check if value is valid 
    if (WX.findKeyByValue(this.model, value)) {
      this.value = value;
      if (this.$callback) {
        this.$callback.call(this._parent, this.value, time, rampType);
      }
    } else {
      WX.Log.warn('Invalid value (value not found in model).');
    }
  },

  /**
   * Returns the paramter value. Note that this is not a computed value
   *   of WA AudioParam instance.
   * @memberOf ItemizedParam
   * @return {Number} Latest paramter value.
   */
  get: function () {
    return this.value;
  },

  /**
   * Returns the reference of items (WAAX model).
   * @memberOf ItemizedParam
   * @return {Array} WAAX model associated with the parameter.
   */
  getModel: function () {
    return this.model;
  }

};

/**
 * Boolean parameter abstraction. Usually called by {@link WX.defineParams}
 *   method.
 * @name BooleanParam
 * @class
 * @param {Object} options Parameter configruation.
 * @param {String} options.name User-defined parameter name.
 * @param {Number} options.default Default value.
 * @param {Number} options.value Current value.
 * @param {Object} options._parent Reference to associated Plug-in.
 */
function BooleanParam(options) {
  this.init(options);
}

BooleanParam.prototype = {

  /**
   * Initializes instance with options.
   * @memberOf BooleanParam
   * @param {Object} options Paramter configuration.
   */
  init: function (options) {
    if (!WX.isBoolean(options.default)) {
      Log.error('Invalid value for Boolean Parameter.');
    }
    this.type = 'Boolean';
    this.name = (options.name || 'Toggle');
    this.value = this.default = options.default;
    this._parent = options._parent;
    // handler callback assignment
    this.$callback = options._parent['$' + options._paramId];
  },

  /**
   * Sets parameter value with time and ramp type. Calls back
   *   a corresponding handler.
   * @memberOf BooleanParam
   * @param {Number} value Parameter target value
   * @param {Number|Array} time time or array of
   *   <code>[start time, time constant]</code>
   * @param {Number} rampType WAAX ramp type
   */
  set: function (value, time, rampType) {
    if (WX.isBoolean(value)) {
      this.value = value;
      if (this.$callback) {
        this.$callback.call(this._parent, this.value, time, rampType);
      }
    }
  },

  /**
   * Returns the paramter value. Note that this is not a computed value
   *   of WA AudioParam instance.
   * @memberOf BooleanParam
   * @return {Number} Latest paramter value.
   */
  get: function () {
    return this.value;
  }

};

/**
 * Defines parameters by specified options.
 * @memberOf WX
 * @param {Object} plugin WAAX Plug-in
 * @param {Object} paramOptions A collection of parameter option objects
 *   . See {@link GenericParam}, {@link ItemizedParam} and
 *   {@link BooleanParam} for available parameter options.
 * @example
 * WX.defineParams(this, {
 *   oscFreq: {
 *     type: 'Generic',
 *     name: 'Freq',
 *     default: WX.mtof(60),
 *     min: 20.0,
 *     max: 5000.0,
 *     unit: 'Hertz'
 *   },
 *   ...
 * };
 */
WX.defineParams = function (plugin, paramOptions) {
  for (var key in paramOptions) {
    paramOptions[key]._parent = plugin;
    paramOptions[key]._paramId = key;
    plugin.params[key] = wxparam_create(paramOptions[key]);
  }
};


/**
 * Create an envelope generator function for WA audioParam.
 * @param {...Array} array Data points of
 *   <code>[value, offset time, ramp type]<code>
 * @returns {Function} Envelope generator function.
 *   <code>function(start time, scale factor)</code>
 * @example
 * // build an envelope generator with relative data points
 * var env = WX.Envelope([0.0, 0.0], [0.8, 0.01, 1], [0.0, 0.3, 2]);
 * // changes gain with an envelope starts at 2.0 sec with 1.2
 *   amplification.
 * synth.set('gain', env(2.0, 1.2));
 */
WX.Envelope = function () {
  var args = arguments;
  return function (startTime, amplifier) {
    var env = [];
    startTime = (startTime || 0);
    amplifier = (amplifier || 1.0);
    for (var i = 0; i < args.length; i++) {
      var val = args[i][0], time;
      // when time argument is array, branch to setTargetAtValue
      if (WX.isArray(args[i][1])) {
        time = [startTime + args[i][1][0], startTime + args[i][1][1]];
        env.push([val * amplifier, time, 3]);
      }
      // otherwise use step, linear or exponential ramp
      else {
        time = startTime + args[i][1];
        env.push([val * amplifier, time, (args[i][2] || 0)]);
      }
    }
    return env;
  };
};


//
// Plug-in Abstractions
//

// plug-in types
var PLUGIN_TYPES = [
  'Generator',
  'Processor',
  'Analyzer'
];

// registered plug-ins
var registered = {
  Generator: [],
  Processor: [],
  Analyzer: []
};

/**
 * Plug-In base class.
 * @name PlugInAbstract
 * @class
 */
function PlugInAbstract () {
  this.params = {};
}

PlugInAbstract.prototype = {

  /**
   * Connects a plug-in output to the other plug-in's input or a WA node.
   *   Note that this does not support multiple outgoing connection.
   *   (fanning-out)
   * @memberOf PlugInAbstract
   * @param {WAPL|AudioNode} target WAPL(Web Audio Plug-In)
   *   compatible plug-in or WA node.
   * @returns {WAPL|AudioNode}
   */
  to: function (target) {
    // when the target is a plug-in with inlet.
    if (target._inlet) {
      this._outlet.to(target._inlet);
      return target;
    }
    // or it might simply be a WA node.
    else {
      try {
        this._outlet.to(target);
        return target;
      } catch (error) {
        WX.Log.error('Connection failed. Invalid patching.');
      }
    }
  },

  /**
   * Disconnects all outgoing connections fomr plug-in.
   * @memberOf PlugInAbstract
   */
  cut: function () {
    this._outlet.cut();
  },

  /**
   * Sets a plug-in parameter. Supports dynamic parameter assignment.
   * @memberOf PlugInAbstract
   * @param {String} param Parameter name.
   * @param {Array|Number} arg An array of data points or a single value.
   * @return {WAPL} Self-reference for method chaining.
   * @example
   * // setting parameter with an array
   * myeffect.set('gain', [[0.0], [1.0, 0.01, 1], [0.0, 0.5, 2]]);
   * // setting parameter with a value (immediate change)
   * myeffect.set('gain', 0.0);
   */
  set: function (param, arg) {
    if (WX.hasParam(this, param)) {
      // check if arg is a value or array
      if (WX.isArray(arg)) {
        // if env is an array, iterate envelope data
        // where array is arg_i = [value, time, rampType]
        for (var i = 0; i < arg.length; i++) {
          this.params[param].set.apply(this, arg[i]);
        }
      } else {
        // otherwise change the value immediately
        this.params[param].set(arg, WX.now, 0);
      }
    }
    return this;
  },

  /**
   * Gets a paramter value.
   * @memberOf PlugInAbstract
   * @param {String} param Parameter name.
   * @return {*} Paramter value. Returns null when a paramter not found.
   */
  get: function (param) {
    if (WX.hasParam(this, param)) {
      return this.params[param].get();
    } else {
      return null;
    }
  },

  /**
   * Sets plug-in preset, which is a collection of parameters. Note that
   *   setting a preset changes all the associated parameters immediatley.
   * @memberOf PlugInAbstract
   * @param {Object} preset A collection of paramters.
   */
  setPreset: function (preset) {
    for (var param in preset) {
      this.params[param].set(preset[param], WX.now, 0);
    }
  },

  /**
   * Gets a current plug-in paramters as a collection. Note that the
   *   collection is created on the fly. It is a clone of current parameter
   *   values.
   * @memberOf PlugInAbstract
   * @return {Object} Preset.
   */
  getPreset: function () {
    var preset = {};
    for (var param in this.params) {
      preset[param] = this.params[param].get();
    }
    return preset;
  }

};


/**
 * Generator plug-in class. No audio inlet.
 * @name Generator
 * @class
 * @extends PlugInAbstract
 * @param {Object} params
 * @param {Number} params.output Plug-in output gain.
 */
function Generator() {

  // extends PlugInAbstract
  PlugInAbstract.call(this);

  // creating essential WA nodes
  this._output = WX.Gain();
  this._outlet = WX.Gain();
  // and patching
  this._output.to(this._outlet);

  // paramter definition
  WX.defineParams(this, {

    output: {
      type: 'Generic',
      name: 'Output',
      default: 1.0,
      min: 0.0,
      max: 1.0,
      unit: 'LinearGain'
    }

  });

}

Generator.prototype = {

  /**
   * Parameter handler for <code>params.output</code>
   * @memberOf Generator
   * @private
   */
  $output: function (value, time, rampType) {
    this._output.gain.set(value, time, rampType);
  }

};

// extends prototype with PlugInAbstract
WX.extend(Generator.prototype, PlugInAbstract.prototype);


/**
 * Processor plug-in class. Features both inlet and outlet.
 * @name Processor
 * @class
 * @extends PlugInAbstract
 * @param {Object} params
 * @param {Generic} params.input Input gain.
 * @param {Generic} params.output Output gain.
 * @param {Boolean} params.bypass Bypass switch.
 */
function Processor() {

  // extends PlugInAbstract
  PlugInAbstract.call(this);

  // WA nodes
  this._inlet = WX.Gain();
  this._input = WX.Gain();
  this._output = WX.Gain();
  this._active = WX.Gain();
  this._bypass = WX.Gain();
  this._outlet = WX.Gain();
  // patching
  this._inlet.to(this._input, this._bypass);
  this._output.to(this._active).to(this._outlet);
  this._bypass.to(this._outlet);

  // initialization for bypass
  this._active.gain.value = 1.0;
  this._bypass.gain.value = 0.0;

  WX.defineParams(this, {

    input: {
      type: 'Generic',
      name: 'Input',
      default: 1.0,
      min: 0.0,
      max: 1.0,
      unit: 'LinearGain'
    },

    output: {
      type: 'Generic',
      name: 'Output',
      default: 1.0,
      min: 0.0,
      max: 1.0,
      unit: 'LinearGain'
    },

    bypass: {
      type: 'Boolean',
      name: 'Bypass',
      default: false
    }

  });

}

Processor.prototype = {

  /**
   * Parameter handler for <code>params.input</code>
   * @memberOf Processor
   * @private
   */
  $input: function (value, time, rampType) {
    this._input.gain.set(value, time, rampType);
  },

  /**
   * Parameter handler for <code>params.output</code>
   * @memberOf Processor
   * @private
   */
  $output: function (value, time, rampType) {
    this._output.gain.set(value, time, rampType);
  },

  /**
   * Parameter handler for <code>params.bypass</code>
   * @memberOf Processor
   * @private
   */
  $bypass: function(value, time, rampType) {
    time = (time || WX.now);
    if (value) {
      this._active.gain.set(0.0, time, 0);
      this._bypass.gain.set(1.0, time, 0);
    } else {
      this._active.gain.set(1.0, time, 0);
      this._bypass.gain.set(0.0, time, 0);
    }
  }

};

// extends PlugInAbstract
WX.extend(Processor.prototype, Generator.prototype);


/**
 * Analyzer plug-in class. Features both inlet, outlet and analyzer.
 * @name Analyzer
 * @class
 * @extends PlugInAbstract
 * @param {Object} params
 * @param {Generic} params.input Input gain.
 */
function Analyzer() {

  PlugInAbstract.call(this);

  this._inlet = WX.Gain();
  this._input = WX.Gain();
  this._analyzer = WX.Analyzer();
  this._outlet = WX.Gain();

  this._inlet.to(this._input).to(this._analyzer);
  this._inlet.to(this._outlet);

  WX.defineParams(this, {

    input: {
      type: 'Generic',
      name: 'Input',
      default: 1.0,
      min: 0.0,
      max: 1.0,
      unit: 'LinearGain'
    }

  });

}

Analyzer.prototype = {

  /**
   * Parameter handler for <code>params.input</code>
   * @private
   * @memberOf Analyzer
   */
  $input: function (value, time, xtype) {
    this._input.gain.set(value, time, xtype);
  }

};

// extends PlugInAbstract
WX.extend(Analyzer.prototype, PlugInAbstract.prototype);


//
// Plug-in utilities
//

/**
 * @namespace WX.PlugIn
 */
WX.PlugIn = {};

/**
 * Defines type of a plug-in. Required in plug-in definition.
 * @param {WAPL} plugin Target plug-in.
 * @param {String} type Plug-in type. <code>['Generator', 'Processor',
 *   'Analyzer']</code>
 */
WX.PlugIn.defineType = function (plugin, type) {
  // check: length should be less than 3
  if (PLUGIN_TYPES.indexOf(type) < 0) {
    WX.Log.error('Invalid Plug-in type.');
  }
  // branch on plug-in type
  switch (type) {
    case 'Generator':
      Generator.call(plugin);
      break;
    case 'Processor':
      Processor.call(plugin);
      break;
    case 'Analyzer':
      Analyzer.call(plugin);
      break;
  }
};

/**
 * Initializes plug-in preset. Merges default preset with user-defined
 *   preset. Required in plug-in definition.
 * @param {WAPL} plugin Target plug-in.
 * @param {Object} preset Preset.
 */
WX.PlugIn.initPreset = function (plugin, preset) {
  var merged = WX.clone(plugin.defaultPreset);
  WX.extend(merged, preset);
  plugin.setPreset(merged);
};

/**
 * Extends plug-in prototype according to the type. Required in plug-in
 *   definition.
 * @param {WAPL} plugin Target plug-in.
 * @param {String} type Plug-in type. <code>['Generator', 'Processor',
 *   'Analyzer']</code>
 */
WX.PlugIn.extendPrototype = function (plugin, type) {
  // check: length should be less than 3
  if (PLUGIN_TYPES.indexOf(type) < 0) {
    WX.Log.error('Invalid Plug-in type.');
  }
  // branch on plug-in type
  switch (type) {
    case 'Generator':
      WX.extend(plugin.prototype, Generator.prototype);
      break;
    case 'Processor':
      WX.extend(plugin.prototype, Processor.prototype);
      break;
    case 'Analyzer':
      WX.extend(plugin.prototype, Analyzer.prototype);
      break;
  }
};

/**
 * Registers the plug-in prototype to WX namespace. Required in plug-in
 *   definition.
 * @param {Function} PlugInClass Class reference (function name) of
 *   plug-in.
 */
WX.PlugIn.register = function (PlugInClass) {
  var info = PlugInClass.prototype.info;
  // hard check version info
  if (WX.getVersion() < info.api_version) {
    // FATAL: PlugInClass is incompatible with WX Core.
    WX.Log.error(PlugInClass.name, ': FATAL. incompatible WAAX version.');
  }
  // register PlugInClass in WX namespace
  registered[info.type].push(PlugInClass.name);
  WX[PlugInClass.name] = function (preset) {
    return new PlugInClass(preset);
  };
};

/**
 * Returns a list of regsitered plug-ins of a certain type.
 * @param {String} type Plug-in Type.
 * @return {Array} A list of plug-ins.
 */
WX.PlugIn.getRegistered = function (type) {
  var plugins = null;
  if (PLUGIN_TYPES.indexOf(type) > -1) {
    switch (type) {
      case undefined:
        plugins = registered.Generator.slice(0);
        plugins = plugins.concat(registered.Processor.slice(0));
        plugins = plugins.concat(registered.Analyzer.slice(0));
        break;
      case 'Generator':
        plugins = registered.Generator.slice(0);
        break;
      case 'Processor':
        plugins = registered.Processor.slice(0);
        break;
      case 'Analyzer':
        plugins = registered.Analyzer.slice(0);
        break;
    }
  }
  return plugins;
};

// WAAX is ready to serve!
WX.Log.info('WAAX', WX.getVersion(), '(' + WX.srate + 'Hz)');