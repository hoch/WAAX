/**
 * @class Internal:DualLevelDetector
 * @description program-dependent level detector for dynamic processing
 */
WX._Internals.DualLevelDetector = function() {
  Object.defineProperties(this, {
    _fs: {
      enumerable: false,
      writable: false,
      value: WX._context.sampleRate
    },
    _attackFast: {
      enumerable: false,
      writable: true,
    value: 1.0
    },
    _releaseFast: {
      enumerable: false,
      writable: true,
    value: 1.0
    },
    _levelFast: {
      enumerable: false,
      writable: true,
      value: 0.0
    },
    _attackSlow: {
      enumerable: false,
      writable: true,
      value: 1.0
    },
    _releaseSlow: {
      enumerable: false,
      writable: true,
      value: 1.0
    },
    _levelSlow: {
      enumerable: false,
      writable: true,
      value: 0.0
    }
  });
  this.reset();
};

WX._Internals.DualLevelDetector.prototype = Object.create(null, {

  /**
   * attack
   * @param {float} value attack in seconds
   */
  attack: {
    enumerable: true,
    get: function() {
      return this._attackFast;
    },
    set: function(value) {
      this._attackFast = 1 - Math.exp(-1.0 / (value * this._fs));
    }
  },

  /**
   * release
   * @param {float} value release in seconds
   */
  release: {
    enumerable: true,
    get: function() {
      return this._releaseFast;
    },
    set: function(value) {
      this._releaseFast = 1 - Math.exp(-1.0 / (value * this._fs));
    }
  },

  /**
   * reset
   * @description fall back to default setting
   */
  reset: {
    enumerable: false,
    value: function() {
      this._attackFast = 1.0 - Math.exp(-1.0 / (0.125 * this._fs));
      this._releaseFast = 1.0 -Math.exp(-1.0 / (0.5 * this._fs));
      this._attackSlow = 1.0 - Math.exp(-1.0 / (0.25 * this._fs));
      this._releaseSlow = 1.0 - Math.exp(-1.0 / this._fs);
      this._levelFast = 0.0;
      this._levelSlow = 0.0;
    }
  },

  /**
   * process and return tracked level
   * @type {float} input value
   * @return {float} output value
   */
  process: {
      value: function(input) {
        // slow detector first
        var s = Math.abs(input);
        if (s > this._levelSlow) {
          this._levelSlow += this._attackSlow * (s - this._levelSlow);
        } else {
          this._levelSlow += this._releaseSlow * (s - this._levelSlow);
        }
        // fast detector
        if (s > this._levelFast) {
          this._levelFast += this._attackFast * (s - this._levelFast);
        } else {
          this._levelFast += this._releaseFast * (this._levelSlow - this._levelFast);
        }
        // write level_fast
        return this._levelFast;
      }
    }
});