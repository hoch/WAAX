/**
 * @class Comp
 * @description compressor abstraction
 */

// TODO: auto makeup is possible?
// TODO: return gain reduction to visualize

WX.Comp = function(json) {
  WX.Unit.Processor.call(this);
  this.label += "Comp";
  Object.defineProperties(this, {
    _comp: {
      enumerable: false,
      writable: false,
      value: WX._context.createDynamicsCompressor()
    },
    _defaults: {
      value: {
        threshold: -12,
        ratio: 4,
        knee: 0.5,
        attack: 0.01,
        release: 0.25
      }
    }
  });
  // performing unit-specific actions
  this._inputGain.connect(this._comp);
  this._comp.connect(this._outputGain);
  // assign (default) parameters
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
};

WX.Comp.prototype = Object.create(WX.Unit.Processor.prototype, {
  threshold: {
    enumerable: true,
    get: function() {
      return this._comp.threshold.value;
    },
    set: function(value) {
      this._comp.threshold.value = value;
    }
  },
  ratio: {
    enumerable: true,
    get: function() {
      return this._comp.ratio.value;
    },
    set: function(value) {
      this._comp.ratio.value = value;
    }
  },
  knee: {
    enumerable: true,
    get: function() {
      return this._comp.knee.value;
    },
    set: function(value) {
      this._comp.knee.value = value;
    }
  },
  attack: {
    enumerable: true,
    get: function() {
      return this._comp.attack.value;
    },
    set: function(value) {
      this._comp.attack.value = value;
    }
  },
  release: {
    enumerable: true,
    get: function() {
      return this._comp.release.value;
    },
    set: function(value) {
      this._comp.release.value = value;
    }
  }
});