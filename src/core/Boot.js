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
 * Boot.js
 * @file the last step: initializing, routing prototype units to factory.
 */
(function () {

  // inject units into the namespace
  WX._log.info("building unit factory...");
  WX._unit.factory([
    // generators
    { name: "Oscil", ref: WX._unit.oscil },
    { name: "Fmop", ref: WX._unit.fmop },
    { name: "Noise", ref: WX._unit.noise },
    { name: "ITrain", ref: WX._unit.itrain },
    { name: "Sampler", ref: WX._unit.sampler },
    { name: "Step", ref: WX._unit.step },
    // processors
    { name: "Fader", ref: WX._unit.fader },
    { name: "Spatter", ref: WX._unit.spatter },
    { name: "ADSR", ref: WX._unit.adsr },
    { name: "Filter", ref: WX._unit.filter },
    { name: "Formant", ref: WX._unit.formant },
    { name: "FormantV", ref: WX._unit.formantv },
    { name: "Pingpong", ref: WX._unit.pingpong },
    { name: "Chorus", ref: WX._unit.chorus },
    { name: "Phasor", ref: WX._unit.phasor },
    { name: "Comp", ref: WX._unit.comp },
    { name: "Converb", ref: WX._unit.converb },
    // analyzers
    { name: "Waveform", ref: WX._unit.waveform },
    { name: "Spectrum", ref: WX._unit.spectrum },
    // midi
    { name: "Streamer", ref: WX.streamer }
  ]);

  // create master fader
  // TODO: multichannel support??
  WX.DAC = WX.Fader();
  WX.DAC.connect(WX.context.destination);
  WX._log.info("master fader created. (WX.DAC)");

  // splash message and shut logging off
  WX._log.post("waax (" + WX.version + ") is ready.");
  WX._log.verbose(false);

})();