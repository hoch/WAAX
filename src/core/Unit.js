/**
 * unit.js: unit builder
 */

/**
 * wx._unit: unit builder container
 */
wx._unit = (function () {
  return {
    // extend prototype with maintaining the label
    // TODO: add support for multiple sources
    extend: function (target, source) {
      for (var m in source) {
        if (m === "label") {
          target[m] = source[m] + "." + target[m];
        } else {
          target[m] = source[m];
        }
      }
    },
    // bind parameter for elegant audio param control
    bindParameter: function (name, targetParam) {
      var t = this[name + "_"] = targetParam;
      // add parameter (but actualy method) to the object
      this[name] = function (val, moment, type) {
        // when undefined
        if (val === undefined) {
          return t.value;
        }
        // check moment
        var m = (moment || wx.now);
        // var endTime = startTime + (moment || 0);
        // branching upon args
        switch (type) {
          case "line":
          case "l":
            t.linearRampToValueAtTime(val, m);
            break;
          case "expo":
          case "x":
            // to avoid exception due to zero
            var v = (val === 0.0) ? 0.0001 : val;
            t.exponentialRampToValueAtTime(v, m);
            break;
          case "target":
          case "t":
            if (m.length == 2 && (m[1] - m[0]) > 0.0) {
              // TODO: pre-calculate the base. (target to 80dB)
              var tau = -(m[1] - m[0]) / Math.log(0.001);
              t.setTargetValueAtTime(val, m[0], tau);
            } else {
              wx._log.warn("invalid timespan for target mode.", this);
            }
            break;
          default:
          case undefined:
            t.cancelScheduledValues(m);
            t.setValueAtTime(val, m);
            break;
        }
        return this;
      };
    },
    // factory: register unit name into wx namespace
    factory: function(args) {
      args.map(function(n) {
        if (wx[n.name]) {
          wx._log.warn("unit name already exists. (" + n.name + ")", null);
        } else {
          wx[n.name] = function(options) {
            return new n.ref(options);
          };
        }
      });
    }
  };
})();


/**
 * unit prototype:abstract
 */
wx._unit.abstract = {
  // merging parameters with default params
  _initializeParams: function (opt, def) {
    var s = {};
    // copy props from defaults
    for (var d in def) {
      s[d] = def[d];
    }
    // overwrite value from options
    for (var o in opt) {
      s[o] = opt[o];
    }
    this.params(s);
  },
  // assign parameters
  params: function (opt) {
    if (opt) {
      for (var p in opt) {
        switch (typeof this[p]) {
          case "function":
            this[p](opt[p]);
            break;
          case "number":
            this[p] = opt[p];
            break;
          default:
          case undefined:
            wx._log.warn("invalid parameters.");
            break;
        }
      }
    } else {
      wx._log.warn("invalid parameter.");
    }
  },
  to: function (unit) {
    this._outlet.connect(unit._inlet);
    return unit;
  },
  connect: function (node) {
    this._outlet.connect(node);
  },
  control: function (audioparam) {
    this._outlet.connect(audioparam);
  },
  cut: function () {
    this._outlet.disconnect();
  }
};


/**
 * abstract: generator
 */
wx._unit.generator = function () {
  this._active = true;
  this._outputGain = wx.context.createGain();
  this._outlet = wx.context.createGain();
  this._outputGain.connect(this._outlet);
  wx._unit.bindParameter.call(this, "gain", this._outputGain.gain);
};

wx._unit.generator.prototype = {
  label: "u.gen",
  on: function () {
    this._status = true;
    this._outputGain.connect(this._outlet);
  },
  off: function () {
    this._status = false;
    this._outputGain.disconnect();
  }
};
wx._unit.extend(wx._unit.generator.prototype, wx._unit.abstract);


/**
 * abstract: processor
 */
wx._unit.processor = function () {
  this._active = true;
  this._inlet = wx.context.createGain();
  this._inputGain = wx.context.createGain();
  this._outputGain = wx.context.createGain();
  this._outlet = wx.context.createGain();
  this._inlet.connect(this._inputGain);
  this._outputGain.connect(this._outlet);
  wx._unit.bindParameter.call(this, "gain", this._outputGain.gain);
};

wx._unit.processor.prototype = {
  label: "u.pro",
  bypass: function (bool) {
    if (typeof bool !== "boolean") {
      return;
    }
    this._active = !bool;
    if (bool) {
      this._inlet.disconnect();
      this._outputGain.disconnect();
      this._inlet.connect(this._outlet);
    } else {
      this._inlet.disconnect();
      this._inlet.connect(this._inputGain);
      this._outputGain.connect(this._outlet);
    }
  }
};
wx._unit.extend(wx._unit.processor.prototype, wx._unit.abstract);


/**
 * abstract: analyzer
 */
wx._unit.analyzer = function () {
  this._active = true;
  this._inlet = wx.context.createGain();
  this._inputGain = wx.context.createGain();
  this._analyzer = wx.context.createAnalyzer();
  this._inlet.connect(this._inputGain);
  this._inputGain.connect(this._analyzer);
  wx._unit.bindParameter.call(this, "inputGain", this._inputGain.gain);
};

wx._unit.analyzer.prototype = {
  label: "u.ana",
  on: function () {
    this._status = true;
    this._inlet.connect(this._inputGain);
  },
  off: function () {
    this._status = false;
    this._inlet.disconnect();
  }
};