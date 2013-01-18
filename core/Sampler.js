/**
 * @class Sampler
 * @description basic sampler abstraction based on buffer source node
 * @param {object} json parameters in JSON notation
 *                      { source: url, basePitch: pitch }
 */

// TODO: loop, loopStart, loopEnd
// TODO: voice management, max voice
// TODO: pitch modulation from inlet
// TODO: how to delete unused inlet

WX.Sampler = function(json) {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _buffer: {
      enumerable: false,
      writable: true,
      value: undefined
    },
    _node: {
      enumerable: false,
      writable: true,
      value: undefined
    },
    _url: {
      enumerable: false,
      writable: true,
      value: ""
    },
    _basePitch: {
      enumerable: false,
      writable: true,
      value: 60
    },
    _label: {
      enumerable: false,
      writable: false,
      value: WX._Dictionary.Sampler
    }
  });
  // assign (default) parameters
  this.params = json;
};

WX.Sampler.prototype = Object.create(WX._Unit.prototype, {

  /**
   * get/set source location URL of sample
   * @param {string} url location of sample
   */
  source: {
    enumerable: true,
    get: function() {
      return this._url;
    },
    set: function(url) {
      if (url === undefined) {
        WX.error(this, "invalid audio file path.");
        return false;
      }
      var me = this;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = function() {
        try {
          me._buffer = WX._context.createBuffer(xhr.response, true);
        } catch(error) {
          WX.error(me, "file loading error: " + url + " (" + error.message + ")");
        }
      };
      xhr.send();
      this._url = url;
      return true;
    }
  },

  /**
   * get/set base pitch of sample (original pitch)
   * @type {Object}
   */
  basePitch: {
    enumerable: true,
    get: function() {
      return this._basePitch;
    },
    set: function(pitch) {
      this._basePitch = pitch;
    }
  },

  /**
   * fire sampler
   * @param {float} pitch playing pitch of sample
   */
  noteOn: {
    value: function(pitch) {
      // is this efficient?
      this._node = WX._context.createBufferSource();
      this._node.buffer = this._buffer;
      this._node.connect(this._outlet);
      // NOTE: calculate pitch and play the sound
      // (2 ^ (semitones change/12) = rate
      if (pitch !== undefined) {
        var rate = Math.pow(2, (pitch - this._basePitch) / 12);
        this._node.playbackRate.setValueAtTime(rate, 0);
      }
      // new method name, noteOn() is deprecated
      this._node.start(0);
    }
  },

  /**
   * stop sampler
   */
  noteOff: {
    value: function() {
      if (this._node) {
        // new method name, noteOff() is deprecated
        this._node.stop(0);
      }
    }
  }
});