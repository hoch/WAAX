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
 * builtin.js: pre-build noise, impulse train, step func
 */
(function() {
  // builtin namespace
  WX._builtin = {};
  var sr = WX.context.sampleRate,
      l = sr * 10;

  // creating white noise buffer source
  var wn = new Float32Array(l);
  WX._builtin.whitenoise = WX.context.createBuffer(1, l, sr);
  for(var i = 0; i < l; ++i) {
    wn[i] = Math.random() * 2.0 - 1;
  }
  WX._builtin.whitenoise.getChannelData(0).set(wn, 0);

  // creating impulse
  var it = new Float32Array(l);
  WX._builtin.impulse = WX.context.createBuffer(1, l, sr);
  it[0] = 1.0;
  for(var j = 1; j < l; ++j) {
    it[j] = 0;
  }
  WX._builtin.impulse.getChannelData(0).set(it, 0);

  // impulse wavetable (for wavetable or PeriodicWave)
  var it2 = new Float32Array(4096);
  var it3 = new Float32Array(4096);
  for (var a = 0; a < 4096; ++a) {
    it2[a] = 1.0;
    it3[a] = 0.0;
  }
  // TODO: it'll be replace with PeriodicWave
  WX._builtin.impulseWavelet = WX.context.createWaveTable(it2, it3);

  // step function (sr samples of 1.0)
  var st = new Float32Array(sr);
  WX._builtin.step = WX.context.createBuffer(1, sr, sr);
  for(var k = 0; k < sr; ++k) {
    st[k] = 1.0;
  }
  WX._builtin.step.getChannelData(0).set(st, 0);
})();