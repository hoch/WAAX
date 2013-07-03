/*
  Copyright 2013, Google Inc.
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are
  met:

      * Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the following disclaimer
  in the documentation and/or other materials provided with the
  distribution.
      * Neither the name of Google Inc. nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


/**
 * unit.js: unit builder
 */

/**
 * WX._unit: unit builder container
 */
WX._unit = (function () {
  return {
    // extend prototype with maintaining the label
    // TODO: add support for multiple sources
    extend: function (target, source) {
      for (var m in source) {
        // append label to target with "."
        if (m === "label") {
          target[m] = source[m] + "." + target[m];
        } else {
          target[m] = source[m];
        }
      }
    },

    /**
     * bindAudioParam
     * @desc unified parameter control method, the core of r8
     *
     * @usage
     * WX._unit.bindAudioParam("name", target_audio_param)
     *
     * @example
     * freq_                returns target AudioParam object for custom control.
     * freq()               returns current freq parameter value.
     * freq(60)             set freq parameter value to 60 immediately (at WX.now)
     * freq(60, 1.0)        set freq parameter value to 60 at 1.0 Audio Context time.
     * freq(60, 1.0, "l")   runs linear ramp to 60 at 1.0 Audio Context time.
     * freq(60, 1.0, "x")   runs exponential ramp to 60 at 1.0 Audio Context time.
     *
     * @note
     * Currently this method is being added on runtime to the instance itself,
     * not the prototype. This should be added into its prototype for the optimum
     * performance.
     */
    bindAudioParam: function (name, targetParam) {
      var t = this[name + "_"] = targetParam;
      // add parameter (but actually method) to the object
      this[name] = function (val, moment, type) {
        // when undefined
        if (typeof val === 'undefined') {
          return t.value;
        }
        // check moment: time context feature should be implemented here.
        var m = (moment || WX.now);
        // check type: set param immediately when type is undefined.
        if (typeof type === 'undefined') {
          t.cancelScheduledValues(m);
          t.setValueAtTime(val, m);
          return this;
        }
        // otherwise, branch upon types
        switch (type) {
          case "line":
          case "l":
            t.linearRampToValueAtTime(val, m);
            break;
          case "expo":
          case "x":
            // to avoid exception due to zero
            val = (val === 0.0) ? 0.0001 : val;
            t.exponentialRampToValueAtTime(v, m);
            break;
          /*
          case "target":
          case "t":
            if (m.length == 2 && (m[1] - m[0]) > 0.0) {
              // TODO: pre-calculate the base. (target to 80dB)
              var tau = -(m[1] - m[0]) / Math.log(0.001);
              t.setTargetValueAtTime(val, m[0], tau);
            } else {
              WX._log.warn("invalid timespan for target mode.", this);
            }
            break;
          */
          default:
            WX._log.warn("invalid transition type. (use 'l' or 'x')", this);
            break;
        }
        return this;
      };
    },

    // bind normal param for unified control
    /*
    bindParam: function(name, moment) {
    },
    */

    // factory: register unit name into wx namespace
    factory: function(args) {
      args.map(function(n) {
        if (WX[n.name]) {
          WX._log.warn("unit name already exists. (" + n.name + ")", null);
        } else {
          WX[n.name] = function(options) {
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
WX._unit.abstract = {
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
            WX._log.warn("invalid parameters.");
            break;
        }
      }
    } else {
      WX._log.warn("invalid parameter.");
    }
  },
  to: function (unit) {
    if (unit.label.substr(0, 2) !== "u.") {
      WX._log.error("invalid argument. (must be WAAX Unit)", this);
      return;
    }
    this._outlet.connect(unit._inlet);
    return unit;
  },
  connect: function (node) {
    if (node.constructor.name.substr(-4) !== "Node") {
      WX._log.error("invalid argument. (must be Node)", this);
      return;
    }
    this._outlet.connect(node);
  },
  control: function (audioparam) {
    if (audioparam.constructor.name !== "AudioParam") {
      WX._log.error("invalid argument. (must be AudioParam)", this);
      return;
    }
    this._outlet.connect(audioparam);
  },
  cut: function () {
    this._outlet.disconnect();
  }
};

/**
 * abstract: generator
 */
WX._unit.generator = function () {
  this._active = true;
  this._outputGain = WX.context.createGain();
  this._outlet = WX.context.createGain();
  this._outputGain.connect(this._outlet);
  WX._unit.bindAudioParam.call(this, "gain", this._outputGain.gain);
};

WX._unit.generator.prototype = {
  label: "u.gen",

  /**
   * activate unit. (unit-generator-specific)
   */
  on: function () {
    this._status = true;
    this._outputGain.connect(this._outlet);
  },

  /**
   * deactivate unit. (take out of audio graph)
   */
  off: function () {
    this._status = false;
    this._outputGain.disconnect();
  }
};

WX._unit.extend(WX._unit.generator.prototype, WX._unit.abstract);


/**
 * abstract: processor
 */
WX._unit.processor = function () {
  this._active = true;
  this._inlet = WX.context.createGain();
  this._inputGain = WX.context.createGain();
  this._outputGain = WX.context.createGain();
  this._outlet = WX.context.createGain();
  this._inlet.connect(this._inputGain);
  this._outputGain.connect(this._outlet);
  WX._unit.bindAudioParam.call(this, "gain", this._outputGain.gain);
};

WX._unit.processor.prototype = {
  label: "u.pro",

  /**
   * bypass core audio graph (unit-processor-specific)
   * @param  {boolean} bool bypass processing when true.
   */
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

WX._unit.extend(WX._unit.processor.prototype, WX._unit.abstract);


/**
 * abstract: analyzer
 */
WX._unit.analyzer = function () {
  this._active = true;
  this._inlet = WX.context.createGain();
  this._inputGain = WX.context.createGain();
  this._analyzer = WX.context.createAnalyser();
  this._inlet.connect(this._inputGain);
  this._inputGain.connect(this._analyzer);
  WX._unit.bindAudioParam.call(this, "inputGain", this._inputGain.gain);
};

WX._unit.analyzer.prototype = {
  label: "u.ana",

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

  /**
   * activate unit. (unit-generator-specific)
   */
  on: function () {
    this._status = true;
    this._inlet.connect(this._inputGain);
  },

  /**
   * deactivate unit. (take out of audio graph)
   */
  off: function () {
    this._status = false;
    this._inlet.disconnect();
  }
};

// WX._unit.extend(WX._unit.analyzer.prototype, WX._unit.abstract);