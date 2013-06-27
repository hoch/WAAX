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
 * WX.oscil
 */
WX._unit.oscil = function (options) {
  // initiate generator wrapper : pre-build
  WX._unit.generator.call(this);
  // build unit
  this._osc = WX.context.createOscillator();
  this._osc.connect(this._outputGain);
  this._osc.start(0);
  WX._unit.bindAudioParam.call(this, "freq", this._osc.frequency);
  WX._unit.bindAudioParam.call(this, "detune", this._osc.detune);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.oscil.prototype = {
  label: "oscil",
  _default: {
    type: "sine",
    freq: 440,
    gain: 1.0,
    detune: 0.0
  },
  type: function (waveform) {
    var t;
    switch (waveform) {
      case "sine":
      case "sin":
      case 0:
        t = 0;
        break;
      case "square":
      case "sqr":
      case 1:
        t = 1;
        break;
      case "sawtooth":
      case "saw":
      case 2:
        t = 2;
        break;
      case "triangle":
      case "tri":
      case 3:
        t = 3;
        break;
      case undefined:
        t = -1;
        break;
    }
    if (t == -1) {
      return this._osc.type;
    } else {
      this._osc.type = t;
    }
  },
  stop: function(moment) {
    this._osc.stop(moment);
  }
};
WX._unit.extend(WX._unit.oscil.prototype, WX._unit.generator.prototype);