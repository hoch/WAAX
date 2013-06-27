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
 * WX.noise
 */
WX._unit.noise = function (options) {
  // initiate generator wrapper : pre-build
  WX._unit.generator.call(this);
  // build unit
  this._noise = WX.context.createBufferSource();
  this._noise.connect(this._outputGain);
  this._noise.buffer = WX._builtin.whitenoise;
  this._noise.loop = 1;
  this._noise.loopStart = Math.random() * this._noise.buffer.duration;
  this._noise.start(0);
  WX._unit.bindAudioParam.call(this, "rate", this._noise.playbackRate);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.noise.prototype = {
  label: "noise",
  _default: {
    type: "white",
    gain: 1.0
  },
  type: function (noisetype) {
    // TODO: pink/brown noise
  },
  stop: function (moment) {
    this._noise.stop(moment);
  }
};
WX._unit.extend(WX._unit.noise.prototype, WX._unit.generator.prototype);