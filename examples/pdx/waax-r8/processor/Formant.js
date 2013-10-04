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
 * WX.Formant
 */
WX._unit.formant = function (options) {
  // pre-building: processor wrapper
  WX._unit.processor.call(this);
  this._f = [];
  this._g = [];
  for(var i = 0; i < 5; ++i) {
    // building phase
    this._f[i] = WX.context.createBiquadFilter();
    this._g[i] = WX.context.createGain();
    this._inputGain.connect(this._f[i]);
    this._f[i].connect(this._g[i]);
    this._g[i].connect(this._outputGain);
    this._f[i].type = "bandpass";
    // post-building: parameter binding
    WX._unit.bindAudioParam.call(this, "f"+i+"freq", this._f[i].frequency);
    WX._unit.bindAudioParam.call(this, "f"+i+"Q", this._f[i].Q);
    WX._unit.bindAudioParam.call(this, "f"+i+"gain", this._g[i].gain);
  }
  this._vowel = "a";
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.formant.prototype = {
  // this label will be appended automatically
  label: "formant",
  _default: {
    vowel: "a"
  },
  // alto formant preset: Synthesis of the Singing Voice, pp.36
  _presets: {
    a: {
      freq: [800, 1150, 2800, 3500, 4950],
      bw: [80, 90, 120, 130, 140],
      amp: [0, -4, -20, -36, -60]
    },
    e: {
      freq: [400, 1600, 2700, 3300, 4950],
      bw: [60, 80, 120, 150, 200],
      amp: [0, -24, -30, -35, -60]
    },
    i: {
      freq: [350, 1700, 2700, 3700, 4950],
      bw: [50, 100, 120, 150, 200],
      amp: [0, -20, -30, -36, -60]
    },
    o: {
      freq: [450, 800, 2830, 3500, 4950],
      bw: [70, 80, 100, 130, 135],
      amp: [0, -9, -16, -28, -55]
    },
    u: {
      freq: [325, 700, 2530, 3500, 4950],
      bw: [50, 60, 170, 180, 200],
      amp: [0, -12, -30, -40, -64]
    }
  },
  _changeFormants: function (preset, moment, type) {
    for(var i = 0; i < 5; ++i) {
      this["f"+i+"freq"](preset.freq[i], moment, type);
      this["f"+i+"Q"](preset.freq[i]/preset.bw[i], moment, type);
      this["f"+i+"gain"](WX.db2lin(preset.amp[i]), moment, type);
    }
  },
  // type
  vowel: function (value, moment, type) {
    if (value !== undefined) {
      if (value == "a" || value == "e" || value == "i" || value == "o" || value == "u") {
        this._changeFormants(this._presets[value], moment, type);
        this._vowel = value;
        return this;
      }
    } else {
      return this._vowel;
    }
  }
};

WX._unit.extend(WX._unit.formant.prototype, WX._unit.processor.prototype);