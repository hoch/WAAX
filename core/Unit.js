WX.Types = Object.freeze({
  // base
  Unit: "Unit.",
  // templates
  Generator: "Generator.",
  Processor: "Processor.",
  Consumer: "Consumer."
});

WX.Init.common = function() {

};

WX.Block.input = function() {

};

WX.Block.output = function() {

};

WX.Block.active = function() {
  
};

WX._init.bypass = function() {

};



// base class: Unit
WX.Unit = function() {
  // creating default nodes for all units
  Object.defineProperties(this, {
    _label: {
      value: WX.Types.Unit,
      enumerable: false,
      writable: true
    }
  });
};

WX.Unit.prototype = Object.create(null, {
  
  /**
   * get/set unit parameters
   * @param {object} unit parameters in json notation
   */
  params: {
    enumerable: false,
    // returns enumerable setter/getter (params)
    get: function() {
      var tmp = Object.create(null);
      for(var p in this) {
        tmp[p] = this[p];
      }
      return tmp;
    },
    set: function(json) {
      // sanity check
      if (typeof json !== "object") {
        WX.error(this, "invalid JSON.");
        return;
      }
      // iterate json
      for(var p in json) {
        // if json has right keys for this object
        if (this[p] !== undefined) {
          // assign parameter
          this[p] = json[p];
        } else {
          // otherwise do nothing and iterate next parameter
          WX.error(this, p + " is not available.");
        }
      }
    }
  },

  /**
   * get unit label
   */
  label: {
    enumerable: true,
    get: function() {
      return this._label;
    }
  }
});


/**
 * [Generator description]
 * @type {[type]}
 */
WX.Generator = function() {
  // super, inheritance
  WX.Unit.call(this);
  // creating default wrapper
  Object.defineProperties(this, {
    _outputGain: {
      value: WX._context.createGainNode(),
      enumerable: false,
      writable: false
    },
    _outlet: {
      value: WX._context.createGainNode(),
      enumerable: false,
      writable: false
    },
    _active: {
      value: true,
      enumerable: false,
      writable: true
    }
  });
  // making internal connection
  this._outputGain.connect(this._outlet);
  // assigning label
  this._label += WX.Type.Generator;
};

/**
 * [prototype description]
 * @type {[type]}
 */
WX.Generator.prototype = Object.create(WX.Unit, {

  /**
   * [active description]
   * @type {Object}
   */
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
  },

  /**
   * [o description]
   * @type {Object}
   */
  o: {
    enumerable: false,
    value: function(unit) {
      // NOTE: can I abstract this?
      if (Object.prototype.toString.call(unit._inlet) === "[object GainNode]") {
        this._outlet.connect(unit._inlet);
        return unit;
      } else {
        WX.error(this, "invalid inlet node.");
      }
    }
  },

  /**
   * [x description]
   * @type {Object}
   */
  x: {
    enumerable: false,
    value: function() {
      this._outlet.disconnect();
    }
  },

  /**
   * [connect description]
   * @type {Object}
   */
  connect: {
    enumerable: false,
    value: function(node) {
      if (Object.prototype.toString.call(node) === "[object GainNode]") {
        this._outlet.connect(node);
      } else {
        WX.error(this, "invalid node.");
      }
    }
  },

  /**
   * [outputGain description]
   * @type {Object}
   */
  outputGain: {
    enumerable: true,
    get: function() {
      return this._outputGain.gain.value;
    },
    set: function(value) {
      this._outputGain.gain.value = value;
    }
  }

});


/**
 * The Pattern!
 */
Mother = function () {
        Object.defineProperties(this, {
          // props
          _prop: {
            value: "a",
            writable: true,
          },
          // setter/getter
          baz: {
            enumerable: true,
            get: function() {
              return this._prop;
            },
            set: function(string) {
              this._prop = string;
            },
          },
          // functions
          foo: {
            value: function() {
              console.log(this._prop);
            },
            enumerable: true,
            writable: true
          }
        });
      }
      
      Sonny = function() {
        // inherit
        Mother.call(this);
        Object.defineProperties(this, {
          // props
          _osc: {
            value: "a",
            writable: true,
          },
          // setter/getter
          osc: {
            enumerable: true,
            get: function() {
              return this._osc;
            },
            set: function(string) {
              this._osc = string;
            },
          },
          // functions: overridding
          foo: {
            value: function() {
              console.log(this._osc);
            },
            enumerable: true
          }
        });
      }
      
      var o = new Sonny();
      console.log(o);
      
      for(var p in o) {
        console.log(p);
      }


/*

* Base
Unit
  params
  label

* templates
Generator: oscillator, sampler
  + normative
  + out
  + active
Processor: all effects
  + normative
  + in
  + out
  + bypass
Terminal: visualizer, analyzer
  + normative
  + in
  + active

Mixin:common
  params
  label
Mixin:input
  inlet
  inputGain
  inputGain()
Mixin:output
  outputGain
  outlet
  o()
  x()
  connect()
  outputGain()
Mixin:active
Mixin:bypass