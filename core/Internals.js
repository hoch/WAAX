/**
 * @title Internal.js
 * @description some classes used inside of units or modules:
 *              DualLevelDetector
 *              RingBuffer
 */


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



/**
 * @class Internal:RingBuffer
 * @description ring buffer with block write for faster data drawing
 * @param {int} blockSize write block size (default = 512)
 * @param {int} blockNum number of block in power of 2 (default = 8)
 */
WX._Internals.RingBuffer = function(blockSize, blockNum) {
  // pre sanity check
  var bs = (blockSize || 512);
      bn = (blockNum || 8);
  // define properties
  Object.defineProperties(this, {
    _blockSize: {
      enumerable: false,
      writable: false,
      value: bs
    },
    _bufferSize: {
      enumerable: false,
      writable: false,
      value: bs * bn
    },
    _buffer: {
      enumerable: false,
      writable: true,
      value: undefined
    },
    _writer: {
      enumerable: false,
      writable: true,
      value: 0
    },
    _reader: {
      enumerable: false,
      writable: true,
      value: 0
    }
  });
  // assign new array after the property setting
  this._buffer = new Float32Array(this._bufferSize);
};

WX._Internals.RingBuffer.prototype = Object.create(null, {

  /**
   * writeBlock
   * @description writing sample frame into buffer
   * @param {array} block(Float32Array) to write in
   */
  writeBlock: {
    enumerable: true,
    value: function(array) {
      var endBlock = this._writer + this._blockSize,
          i = 0;
      // blind writing
      while (this._writer < endBlock) {
        this._buffer[this._writer++] = array[i++];
      }
      // check pointer boundary
      if (this._writer == this._bufferSize) {
        this._writer = 0;
      }
      // update read pointer
      this._reader = this._writer;
    }
  },

  /**
   * copyBuffertoArray
   * @description fetching data from buffer to external array
   * @param {array} array(Float32Array) to update
   * @note THIS NEEDS TO BE FIXED.
   */
  // copyBuffertoArray: {
  //   enumerable: true,
  //   value: function(array) {
  //     var i = 0,
  //         b = this._bufferSize,
  //         r = this._reader;
  //     while (i < b) {
  //       array[i++] = this._buffer[r++];
  //       if (r == b) {
  //         r = 0;
  //       }
  //     }
  //   }
  // }
});