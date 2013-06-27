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
 * WX.Itrain2
 * note: wavetable version, going to be replaced with "PeriodicWave" mode
 */
WX._unit.itrain2 = function (options) {
  // pre-building: initiate generator wrapper
  WX._unit.generator.call(this);
  // building: phase
  this._impulse = WX.context.createOscillator();
  this._impulse.connect(this._outputGain);
  this._impulse.setWaveTable(WX._builtin.impulseWavelet);
  this._impulse.start(0);
  WX._unit.bindAudioParam.call(this, "freq", this._impulse.frequency);
  WX._unit.bindAudioParam.call(this, "detune", this._impulse.detune);
  // post-building: handling initial parameter
  this._initializeParams(options, this._default);
};

WX._unit.itrain2.prototype = {
  label: "itrain2",
  _default: {
    freq: 1,
    gain: 1.0
  },
  stop: function (moment) {
    this._impulse.stop(moment || WX.now);
  }
};

WX._unit.extend(WX._unit.itrain2.prototype, WX._unit.generator.prototype);

/*
  NOTE: between frequency 0.1 ~ 10, the harmonics can be found...
 */