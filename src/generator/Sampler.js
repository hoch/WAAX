/**
 * WX.Sampler
 */

WX._unit.sampler = function (options) {
  // initiate generator wrapper : pre-build
  WX._unit.generator.call(this);
  // parameters
  this._buffer = null;
  this._player = null;
  this._basePitch = 60;
  this._ready = false;
  this._url = null;
  this._loop = false;
  // callback in constructor
  var me = this;
  this._oncomplete = function(obj) {
    me._url = obj.url;
    me._buffer = obj.buffer;
    me._ready = obj.status;
  };
  // bind parameters
  // none here
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.sampler.prototype = {
  label: "sampler",
  _default: {
    basePitch: 60,
    loop: false
  },
  source: function(url) {
    if (url) {
      WX._loadBuffer(url, this._oncomplete);
    } else {
      return this._url;
    }
  },
  basePitch: function(pitch) {
    if (pitch) {
      this._basePitch = pitch;
    } else {
      return this._basePitch;
    }
  },
  loop: function(bool) {
    this._loop = bool;
  },
  start: function(pitch, moment) {
    // TODO: checking ready status!
    this._player = WX.context.createBufferSource();
    this._player.buffer = this._buffer;
    if (this._loop) {
      this._player.loop = 1;
    }
    this._player.connect(this._outputGain);
    // NOTE: calculate pitch and play the sound
    // (2 ^ (semitones change/12) = rate
    if (pitch !== undefined) {
      var rate = Math.pow(2, (pitch - this._basePitch) / 12);
      this._player.playbackRate.setValueAtTime(rate, (moment || WX.now));
    }
    this._player.start(moment || WX.now);
    return this;
  },
  stop: function(moment) {
    if (this._player) {
      this._player.stop(moment || WX.now);
    }
  }
};

WX._unit.extend(WX._unit.sampler.prototype, WX._unit.generator.prototype);