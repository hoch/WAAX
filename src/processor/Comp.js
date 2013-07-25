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
 * WX.Comp
 */
WX._unit.comp = function (options) {
  // pre-building
  WX._unit.processor.call(this);
  // building
  this._comp = WX.context.createDynamicsCompressor();
  this._inputGain.connect(this._comp);
  this._comp.connect(this._outputGain);
  // bind parameter
  WX._unit.bindAudioParam.call(this, "inputGain", this._inputGain.gain);
  WX._unit.bindAudioParam.call(this, "threshold", this._comp.threshold);
  WX._unit.bindAudioParam.call(this, "knee", this._comp.knee);
  WX._unit.bindAudioParam.call(this, "ratio", this._comp.ratio);
  WX._unit.bindAudioParam.call(this, "attack", this._comp.attack);
  WX._unit.bindAudioParam.call(this, "release", this._comp.release);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.comp.prototype = {
  // label
  label: "comp",
  // default
  _default: {
    threshold: -24,
    knee: 0.0,
    ratio: 4.0,
    attack: 0.003,
    release: 0.250,
    gain: 1.0
  },
  makeup: function(value, moment, type) {
    if (typeof value === 'undefined') {
      return WX.lin2db(this.gain());
    } else {
      this.gain(WX.db2lin(value), moment, type);
    }
  }
};

WX._unit.extend(WX._unit.comp.prototype, WX._unit.processor.prototype);