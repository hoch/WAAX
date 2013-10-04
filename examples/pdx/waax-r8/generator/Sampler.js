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
 * WX.sampler : WX.Sampler
 * @file a buffer source abstraction, dynamic buffer source player
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
  // oncomplete callback for XHR file loader
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
  duration: function() {
    return this._buffer.duration;
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
    // TODO: take care of (undefined, undefined)
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