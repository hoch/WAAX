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
 * WX.FormantV: vector-controlled formant filter.
 * note: setPosition(x, y) => where (x, y) should be on the unit circle for full formant effect.
 */
WX._unit.formantv = function (options) {
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
  this._tFreq = [];
  this._tQ = [];
  this._tAmp = [];
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.formantv.prototype = {
  // this label will be appended automatically
  label: "formant",
  _default: {
    vowel: "a"
  },
  // alto formant preset: Synthesis of the Singing Voice, pp.36
  _formants: {
    a: {
      freq: [800, 1150, 2800, 3500, 4950],
      bw: [80, 90, 120, 130, 140],
      amp: [1, 0.6309573444801932, 0.1, 0.015848931924611134, 0.001]
    },
    e: {
      freq: [400, 1600, 2700, 3300, 4950],
      bw: [60, 80, 120, 150, 200],
      amp: [1, 0.06309573444801933, 0.03162277660168379, 0.01778279410038923, 0.001]
    },
    i: {
      freq: [350, 1700, 2700, 3700, 4950],
      bw: [50, 100, 120, 150, 200],
      amp: [1, 0.1, 0.03162277660168379, 0.015848931924611134, 0.001]
    },
    o: {
      freq: [450, 800, 2830, 3500, 4950],
      bw: [70, 80, 100, 130, 135],
      amp: [1, 0.35481338923357547, 0.15848931924611134, 0.039810717055349734, 0.0017782794100389228]
    },
    u: {
      freq: [325, 700, 2530, 3500, 4950],
      bw: [50, 60, 170, 180, 200],
      amp: [1, 0.251188643150958, 0.03162277660168379, 0.01, 0.000630957344480193]
    }
  },
  // data points on a unit circle (a, e, i, o, u)
  _points: [
    [0.0, 1],
    [-0.9510565162951535, 0.3090169943749475],
    [-0.5877852522924732, -0.8090169943749473],
    [0.5877852522924729, -0.8090169943749476],
    [0.9510565162951536, 0.3090169943749472]
  ],
  _calculateVector: function (x, y) {
    var w = [];
    var norm = 0.0;
    for (var i = 0; i < 5; ++i) {
      var dx = x - this._points[i][0], dy = y - this._points[i][1];
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d === 0) {
        d = 0.0001;
      } else {
        w[i] = 1 / d;
        norm += w[i];
      }
    }
    norm = 1 / norm;
    //interpolateFormants(weight, norm, formant);
    for (var j = 0; j < 5; ++j) {
      this._tFreq[j] = 
        w[0] * this._formants.a.freq[j] + 
        w[1] * this._formants.e.freq[j] + 
        w[2] * this._formants.i.freq[j] + 
        w[3] * this._formants.o.freq[j] + 
        w[4] * this._formants.u.freq[j];
      this._tFreq[j] *= norm;
      this._tQ[j] = 
        w[0] * this._formants.a.freq[j] / this._formants.a.bw[j] + 
        w[1] * this._formants.e.freq[j] / this._formants.e.bw[j] + 
        w[2] * this._formants.i.freq[j] / this._formants.i.bw[j] + 
        w[3] * this._formants.o.freq[j] / this._formants.o.bw[j] + 
        w[4] * this._formants.u.freq[j] / this._formants.u.bw[j];
      this._tQ[j] *= norm;
      this._tAmp[j] = 
        w[0] * this._formants.a.amp[j] +
        w[1] * this._formants.e.amp[j] +
        w[2] * this._formants.i.amp[j] +
        w[3] * this._formants.o.amp[j] +
        w[4] * this._formants.u.amp[j]
      this._tAmp[j] *= norm;
    }
  },
  _changeFormants: function (preset, moment, type) {
    for(var i = 0; i < 5; ++i) {
      this["f"+i+"freq"](preset.freq[i], moment, type);
      this["f"+i+"Q"](preset.freq[i]/preset.bw[i], moment, type);
      this["f"+i+"gain"](preset.amp[i], moment, type);
    }
  },
  setPosition: function(x, y, slew) {
    this._calculateVector(x, y);
    for(var i = 0; i < 5; ++i) {
      this["f"+i+"freq"](this._tFreq[i], WX.now + slew, "x");
      this["f"+i+"Q"](this._tQ[i], WX.now + slew, "l");
      this["f"+i+"gain"](this._tAmp[i], WX.now + slew, "l");
    }
  },
  // type
  vowel: function (value, moment, type) {
    if (value !== undefined) {
      if (value == "a" || value == "e" || value == "i" || value == "o" || value == "u") {
        this._changeFormants(this._formants[value], moment, type);
        this._vowel = value;
        return this;
      }
    } else {
      return this._vowel;
    }
  }
};

WX._unit.extend(WX._unit.formantv.prototype, WX._unit.processor.prototype);