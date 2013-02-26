/**
 * @class Sampler
 */

// TODO: loop, loopStart, loopEnd
// TODO: voice management, max voice
// TODO: pitch modulation
// TODO: play with time scheduling

WX.Sampler = function(json) {
  WX.Unit.Generator.call(this);
  Object.defineProperties(this, {
    _buffer: {
      writable: true,
      value: undefined
    },
    _player: {
      writable: true,
      value: undefined
    },
    _url: {
      writable: true,
      value: ""
    },
    _basePitch: {
      writable: true,
      value: 60
    },
    _loaded: {
      writable: true,
      value: false
    },
    _defaults: {
      value: {
        basePitch: 60
      }
    }
  });
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
  this.label += "Sampler";
};

WX.Sampler.prototype = Object.create(WX.Unit.Generator.prototype, {
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
          me._loaded = true;
          WX.info(me, "loaded: " + url);
        } catch(error) {
          WX.error(me, "file loading error: " + url + " (" + error.message + ")");
        }
      };
      xhr.send();
      this._url = url;
      return true;
    }
  },
  basePitch: {
    enumerable: true,
    get: function() {
      return this._basePitch;
    },
    set: function(pitch) {
      this._basePitch = pitch;
    }
  },
  noteOn: {
    value: function(pitch) {
      if (!this._loaded) {
        WX.error(this, "sampler is not ready.");
        return;
      }
      // is this efficient?
      this._player = WX._context.createBufferSource();
      this._player.buffer = this._buffer;
      this._player.connect(this._outputGain);
      // NOTE: calculate pitch and play the sound
      // (2 ^ (semitones change/12) = rate
      if (pitch !== undefined) {
        var rate = Math.pow(2, (pitch - this._basePitch) / 12);
        this._player.playbackRate.setValueAtTime(rate, 0);
      }
      // new method name, noteOn() is deprecated
      this._player.start(0);
    }
  },
  noteOff: {
    value: function(interval) {
      if (this._player) {
        // new method name, noteOff() is deprecated
        this._player.stop(interval || 0);
      }
    }
  }
});