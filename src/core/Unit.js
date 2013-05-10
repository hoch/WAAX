/**
 * @class WX.Unit.Common
 * @classdesc a base class for WAAX units
 */
WX.Unit.Common = function() {
  Object.defineProperties(this, {
    _label: {
      value: WX.Types.Unit,
      enumerable: false,
      writable: true
    }
  });
};


WX.Unit.Common.prototype = Object.create(null, {

  /**
   * gets/sets unit label. (types)
   * @memberOf WX.Unit.Common
   * @param {string} set unit type label (setter)
   * @returns {string} label of unit (getter)
   */
  label: {
    enumerable: false,
    get: function() {
      return this._label;
    },
    set: function(type) {
      this._label = type;
    }
  },

  /**
   * gets/sets parameters of units.
   * @memberOf WX.Unit.Common
   * @param {json} parameters as json (setter)
   * @returns {json} parameters as json (getter)
   */
  params: {
    enumerable: false,
    get: function() {
      var tmp = Object.create(null);
      // this iterates enumerables only
      for(var p in this) {
        tmp[p] = this[p];
      }
      return tmp;
    },
    set: function(json) {
      if (typeof json !== "object") {
        WX.error(this, "invalid JSON.");
      }
      for(var p in json) {
        if (this[p] !== undefined) {
          this[p] = json[p];
        } else {
          // otherwise do nothing and iterate next parameter
          WX.warn(this, p + " is not an available property.");
        }
      }
    }
  },

  /**
   * returns unit as string
   * @memberOf WX.Unit.Common
   * @returns {string} unit as stringified json
   */
  toString: {
    value: function() {
      var s = this.label;
      s += " <pre>" + JSON.stringify(this.params, null, 2) + "</pre>";
      return s;
    }
  }
});


/**
 * Unit.Generator
 */
WX.Unit.Generator = function() {
  WX.Unit.Common.call(this);
  Object.defineProperties(this, {
    _outputGain: {
      value: WX._context.createGain()
    },
    _outlet: {
      value: WX._context.createGain()
    },
    _active: {
      value: true,
      writable: true
    }
  });
  this._outputGain.connect(this._outlet);
  this.label += WX.Types.Generator;
  // NOTE: exp feature
  WX.bindParam.call(this, "mgain", this._outputGain.gain);
};

WX.Unit.Generator.prototype = Object.create(WX.Unit.Common.prototype, {
  to: {
    value: function(unit) {
      if (Object.prototype.toString.call(unit._inlet) === "[object GainNode]") {
        this._outlet.connect(unit._inlet);
        return unit;
      } else {
        WX.error(this, "invalid inlet node in target unit.");
      }
    }
  },
  cut: {
    value: function() {
      this._outlet.disconnect();
    }
  },
  connect: {
    value: function(node) {
      // TODO: sanity check?
      this._outlet.connect(node);
    }
  },
  gain: {
    enumerable: true,
    get: function() {
      return this._outputGain.gain.value;
    },
    set: function(value) {
      this._outputGain.gain.value = value;
    }
  },
  active: {
    enumerable: true,
    get: function() {
      return this._active;
    },
    set: function(bool) {
      // sanity check
      if (typeof bool !== "boolean") {
        return;
      }
      // flip it
      this._active = bool;
      // do things
      if (this._active) {
        this._outputGain.connect(this._outlet);
      } else {
        this._outputGain.disconnect();
      }
    }
  }
});


/**
 * Unit.Processor
 */
WX.Unit.Processor = function() {
  WX.Unit.Common.call(this);
  Object.defineProperties(this, {
    _inlet: {
      value: WX._context.createGain()
    },
    _inputGain: {
      value: WX._context.createGain()
    },
    _outputGain: {
      value: WX._context.createGain()
    },
    _outlet: {
      value: WX._context.createGain()
    },
    _bypass: {
      value: false,
      writable: true
    }
  });
  this._inlet.connect(this._inputGain);
  this._outputGain.connect(this._outlet);
  this.label += WX.Types.Processor;
  // NOTE: exp feature
  WX.bindParam.call(this, "mgain", this._outputGain.gain);
};

WX.Unit.Processor.prototype = Object.create(WX.Unit.Common.prototype, {
  to: {
    value: function(unit) {
      if (Object.prototype.toString.call(unit._inlet) === "[object GainNode]") {
        this._outlet.connect(unit._inlet);
        return unit;
      } else {
        WX.error(this, "invalid inlet node in target unit.");
      }
    }
  },
  cut: {
    value: function() {
      this._outlet.disconnect();
    }
  },
  connect: {
    value: function(node) {
      // TODO: sanity check?
      this._outlet.connect(node);
    }
  },
  gain: {
    enumerable: true,
    get: function() {
      return this._outputGain.gain.value;
    },
    set: function(value) {
      this._outputGain.gain.value = value;
    }
  },
  bypass: {
    enumerable: true,
    get: function() {
      return this._bypass;
    },
    set: function(bool) {
      // sanity check
      if (typeof bool !== "boolean") {
        return;
      }
      // flip it
      this._bypass = bool;
      // do things
      if (this._bypass) {
        this._outputGain.disconnect();
        this._inlet.connect(this._outlet);
      } else {
        this._inlet.disconnect();
        this._inlet.connect(this._inputGain);
        this._outputGain.connect(this._outlet);
      }
    }
  }
});


/**
 * Unit.Analyzer
 */
WX.Unit.Analyzer = function() {
  WX.Unit.Common.call(this);
  Object.defineProperties(this, {
    _inlet: {
      value: WX._context.createGain()
    },
    _inputGain: {
      value: WX._context.createGain()
    },
    _analyzer: {
      value: WX._context.createAnalyser()
    },
    _active: {
      value: true,
      writable: true
    }
  });
  this._inlet.connect(this._inputGain);
  this._inputGain.connect(this._analyzer);
  this.label += WX.Types.Analyzer;
  // NOTE: exp feature
  this.xBuild();
};

WX.Unit.Analyzer.prototype = Object.create(WX.Unit.Common.prototype, {
  // NOTE: this is experimental feature
  xBuild: function() {
    WX.bindParam.call(this, "mgain", this._inputGain.gain);
  },
  // NOTE: this gain is pre-node gain
  gain: {
    enumerable: true,
    get: function() {
      return this._inputGain.gain.value;
    },
    set: function(value) {
      this._inputGain.gain.value = value;
    }
  },
  active: {
    enumerable: true,
    get: function() {
      return this._active;
    },
    set: function(bool) {
      // sanity check
      if (typeof bool !== "boolean") {
        return;
      }
      // flip it
      this._active = bool;
      // do things
      if (this._active) {
        this._inlet.connect(this._inputGain);
      } else {
        this._inlet.disconnect();
      }
    }
  }
});

/**
 * TODO: context setter: need to be moved to somewhere
 */
WX._at = null;
WX.at = function(moment, fn) {
    WX._at = moment + WX.now;
    fn.call();
    WX._at = null;
};

/**
 * TODO: bind parameters
 */
WX.bindParam = function(name, targetParam) {
  var t = this[name + "_"] = targetParam;
  // add function name
  this[name] = function(val, dur, type) {
    // when undefined
    if (val === undefined) {
        return t.value;
    }
    // setup starting moment
    var m = (WX._at) ? WX._at : WX.now;
    // branching upon args
    switch(type) {
      case undefined:
        t.setValueAtTime(val, m);
        break;
      case "line":
        // time: endTime
        t.linearRampToValueAtTime(val, m + dur);
        break;
      case "expo":
        t.exponentialRampToValueAtTime(val, m + dur);
        break;
      default:
        t.setValueAtTime(val, m);
        break;
    }
    return this;
  };
};

/**
 * unit linker and cutter helper functions
 */
WX.link = function() {
  for(var i = arguments.length-1; i >= 1; --i) {
    arguments[i-1].to(arguments[i]);
  }
};

WX.cut = function() {
  for(var i = arguments.length-1; i >= 0; --i) {
    arguments[i].cut();
  }
};