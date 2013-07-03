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
 * Builtin.js: pre-build noise, impulse train, step func
 * @file pre-build necessary assets; white noise, impulse, step(DC offset) and more
 */
(function() {

  WX._log.info("building assets...");

  // namespace: builtin 
  WX._builtin = {};

  // creating white noise buffer (10s) : Noise.js
  var bufferLength = WX.context.sampleRate * 10;
  var whiteNoise = new Float32Array(bufferLength);
  WX._builtin.whiteNoise = WX.context.createBuffer(1, bufferLength, WX.context.sampleRate);
  for(var i = 0; i < bufferLength; ++i) {
    // gaussian white noise
    // http://www.musicdsp.org/showone.php?id=113
    var r1 = Math.random(), r2 = Math.random();
    if (r1 === 0.0) {
      r1 = WX.EPS;
    }
    whiteNoise[i] = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2);
  }
  WX._builtin.whiteNoise.getChannelData(0).set(whiteNoise, 0);

  // DC offset of 1 second for step function: Step.js
  var dcOffset = new Float32Array(WX.context.sampleRate);
  WX._builtin.dcOffset = WX.context.createBuffer(1, WX.context.sampleRate, WX.context.sampleRate);
  for(i = 0; i < WX.context.sampleRate; ++i) {
    dcOffset[i] = 1.0;
  }
  WX._builtin.dcOffset.getChannelData(0).set(dcOffset, 0);

  // impulse periodic wave : ITrain.js
  var binSize = 4096;
  var mag = new Float32Array(binSize);
  var phase = new Float32Array(binSize);
  for (i = 0; i < binSize; ++i) {
    mag[i] = 1.0;
    phase[i] = 0.0;
  }
  // TODO: it'll be replace with PeriodicWave
  if (typeof WX.context.createWaveTable === 'undefined') {
    WX._builtin.impulse = WX.context.createPeriodicWave(mag, phase);
  } else {
    WX._builtin.impulse = WX.context.createWaveTable(mag, phase);
  }
})();