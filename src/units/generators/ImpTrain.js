/**
 * @class ImpTrain
 * @note this unit uses ScriptProcessor node. use with your own risk.
 *       also this class is an example of a custom javascript generator unit.
 */
WX.ImpTrain = function(json) {
  WX.Unit.Generator.call(this);
  this.label += "ImpTrain";
  Object.defineProperties(this, {
    _generator: {
      enumerable: false,
      writable: false,
      value: WX._context.createScriptProcessor(256, 1, 1)
    },
    _period: {
      enumerable: false,
      writable: true,
      value: 0.0
    },
    _phase: {
      enumerable: false,
      writable: true,
      value: 0.0
    },
    _dc: {
      enumerable: false,
      writable: true,
      value: 0.0
    },
    _frequency: {
      enumerable: false,
      writable: true,
      value: 440.0
    },
    _defaults: {
      value: {
        frequency: 440,
        gain: 1.0
      }
    }
  });
  // attaching callback
  var me = this;
  this._generator.onaudioprocess = function(event) {
    me._callback(event);
  };
  // unit-specific actions
  this._generator.connect(this._outputGain);
  // default behavior
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
};

WX.ImpTrain.prototype = Object.create(WX.Unit.Generator.prototype, {
  _callback: {
    value: function(event) {
      var outputL = event.outputBuffer.getChannelData(0);
      for (var i = 0; i < 256; ++i) {
        var ir1 = 0.0, ir2 = 0.0;
        if(this._phase < 0) {
          var d = 1 + this._phase;
          ir1 = 1 - d;
          ir2 = d;
          // advance phase
          this._phase += this._period;
        }
        outputL[i] = ir1 - this._dc;
        this._phase -= 1.0;
      }
    }
  },
  frequency: {
    enumerable: true,
    get: function() {
      return this._frequency;
    },
    set: function(value) {
      this._frequency = value;
      this._period = WX._context.sampleRate / this._frequency;
      this._dc = 1.0 / this._period;
      this._phase = this._period;
    }
  }
});