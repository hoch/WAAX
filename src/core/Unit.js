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
        if (m === "label") {
          target[m] = source[m] + "." + target[m];
        } else {
          target[m] = source[m];
        }
      }
    },
    // bind audio param for unified control
    bindAudioParam: function (name, targetParam) {
      var t = this[name + "_"] = targetParam;
      // add parameter (but actualy method) to the object
      this[name] = function (val, moment, type) {
        // when undefined
        if (val === undefined) {
          return t.value;
        }
        // check moment
        var m = (moment || WX.now);
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
              WX._log.warn("invalid timespan for target mode.", this);
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
    // bind normal param for unified control
    bindParam: function(name, moment) {
    },
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
WX._unit.generator = function () {
  this._active = true;
  this._outputGain = WX.context.createGain();
  this._outlet = WX.context.createGain();
  this._outputGain.connect(this._outlet);
  WX._unit.bindAudioParam.call(this, "gain", this._outputGain.gain);
};
WX._unit.generator.prototype = {
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
  this._analyzer = WX.context.createAnalyzer();
  this._inlet.connect(this._inputGain);
  this._inputGain.connect(this._analyzer);
  WX._unit.bindAudioParam.call(this, "inputGain", this._inputGain.gain);
};
WX._unit.analyzer.prototype = {
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