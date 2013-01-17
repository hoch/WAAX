/**
 * @class Comp
 * @description compressor abstraction
 * @param {object} json parameters in JSON notation
 *                      { threshold, ratio, knee, attack, release }
 */
WX.Comp = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _comp: {
      enumerable: false,
      writable: false,
      value: WX._context.createDynamicsCompressor()
    }
  });
  // performing unit-specific actions
  this._inlet.connect(this._comp);
  this._comp.connect(this._outlet);
  // assign (default) parameters
  this.params = json;
};


WX.Comp.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set threshold
   * @param {float} value threshold: default -24, nominal range of -100 to 0.
   */
  threshold: {
    enumerable: true,
    get: function() {
      return this._comp.threshold.value;
    },
    set: function(value) {
      this._comp.threshold.value = value;
    }
  },

  /**
   * get/set ratio
   * @param {float} value arbitrary ratio
   */
  ratio: {
    enumerable: true,
    get: function() {
      return this._comp.ratio.value;
    },
    set: function(value) {
      this._comp.ratio.value = value;
    }
  },

  /**
   * get/set knee
   * @param {float} value knee parameter in db
   */
  knee: {
    enumerable: true,
    get: function() {
      return this._comp.knee.value;
    },
    set: function(value) {
      this._comp.knee.value = value;
    }
  },

  /**
   * get/set attack
   * @param {float} value attack in seconds
   */
  attack: {
    enumerable: true,
    get: function() {
      return this._comp.attack.value;
    },
    set: function(value) {
      this._comp.attack.value = value;
    }
  },

  /**
   * get/set release
   * @param {float} value release in seconds
   */
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