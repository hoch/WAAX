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
 * WX.Phasor
 * : implements Chris' idea on multiple notches with modulating center freq
 */

// parameter: spacing
// parameter: mix
// parameter: lfo freq = rate
// parameter: lfo freq = depth

WX._unit.phasor = function (options) {
  // pre-building: processor wrapper
  WX._unit.processor.call(this);
  // building phase
  var splitter = WX.context.createChannelSplitter();
  var merger = WX.context.createChannelMerger();
  this._dry = WX.context.createGain();
  this._wet = WX.context.createGain();
  // notches
  var maxNotch = 12;
  var baseFreq = 60;
  this._notch = [];
  for (var i = 0; i < maxNotch; ++i) {
    this._notch[i] = WX.context.createBiquadFilter();
    this._notch[i].type = "notch";
    this._notch[i].frequency = baseFreq + Math.pow(2, i);
    // console.log(baseFreq + spacing * Math.pow(2, i));
  }
  // split stereo
  splitter.connect(this._notch[0], 0, 0);
  splitter.connect(this._notch[1], 1, 0);
  for (var j = 0; j < maxNotch - 2; j += 2) {
    this._notch[j].connect(this._notch[j+2]);
    this._notch[j+1].connect(this._notch[j+3]);
  }
  this._notch[maxNotch-2].connect(merger, 0, 0);
  this._notch[maxNotch-1].connect(merger, 0, 1);
  merger.connect(this._wet);
  // delayTime modulation
  this._lfo = WX.context.createOscillator();
  this._depthL = WX.context.createGain();
  this._depthR = WX.context.createGain();
  this._lfo.type = "triangle";
  this._lfo.start(0);
  this._lfo.frequency.value = 4.0;
  this._depthL.gain.value = 200.0;
  this._depthR.gain.value = -200.0;
  this._lfo.connect(this._depthL);
  this._lfo.connect(this._depthR);
  for (var k = 0; k < maxNotch; ++k) {
    if (k % 2 === 0) {
      this._depthL.connect(this._notch[k].frequency);
    } else {
      this._depthR.connect(this._notch[k].frequency);
    }
  }
  // mix level control
  this._inputGain.connect(splitter);
  this._inputGain.connect(this._dry);
  this._dry.connect(this._outputGain);
  this._wet.connect(this._outputGain);
  // post-building: parameter binding
  WX._unit.bindAudioParam.call(this, "lfoFreq", this._lfo.frequency);
  WX._unit.bindAudioParam.call(this, "lfoDepthLeft", this._depthL.gain);
  WX._unit.bindAudioParam.call(this, "lfoDepthRight", this._depthR.gain);
  WX._unit.bindAudioParam.call(this, "dry", this._dry.gain);
  WX._unit.bindAudioParam.call(this, "wet", this._wet.gain);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.phasor.prototype = {
  // this label will be appended automatically
  label: "phasor",
  _default: {
    mix: 0.8
  },
  rate: function (value, moment, type) {
    if (value !== undefined) {
      // value should be normalized 0~1
      return this.lfoFreq((value * 29 + 1)*0.01, moment, type);
    } else {
      return this.lfoFreq();
    }
  },
  depth: function (value, moment, type) {
    if (value !== undefined) {
      // value should be normalized 0~1
      return this
        .lfoDepthLeft(value, moment, type)
        .lfoDepthRight(-value, moment, type);
    } else {
      return [this.lfoDepthLeft(), this.lfoDepthRight()];
    }
  },
  /*
  feedback: function (value, moment, type) {
    if (value !== undefined) {
      return this
        .feedbackLeft(-value, moment, type)
        .feedbackRight(-value, moment, type);
    } else {
      return [this.feedbackLeft(), this.feedbackRight()];
    }
  },
  feedforward: function (value, moment, type) {
    if (value !== undefined) {
      return this
        .feedforwardLeft(value, moment, type)
        .feedforwardRight(value, moment, type);
    } else {
      return [this.feedforwardLeft(), this.feedforwardRight()];
    }
  },
  blend: function(value, moment, type) {
    if (value !== undefined) {
      return this
        .blendLeft(value, moment, type)
        .blendRight(value, moment, type);
    } else {
      return [this.blendLeft(), this.blendRight()];
    }
  },
  */
  mix: function (value, moment, type) {
    if (value !== undefined) {
      return this
        .dry(1.0 - value, moment, type)
        .wet(value, moment, type);
    } else {
      return this.wet();
    }
  }
};

WX._unit.extend(WX._unit.phasor.prototype, WX._unit.processor.prototype);