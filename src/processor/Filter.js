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
 * WX.Filter
 */
WX._unit.filter = function (options) {
  // pre-building: processor wrapper
  WX._unit.processor.call(this);
  // building phase
  this._filter = WX.context.createBiquadFilter();
  this._inputGain.connect(this._filter);
  this._filter.connect(this._outputGain);
  this._filter.type = "lowpass";
  // post-building: parameter binding
  WX._unit.bindAudioParam.call(this, "cutoff", this._filter.frequency);
  WX._unit.bindAudioParam.call(this, "Q", this._filter.Q);
  WX._unit.bindAudioParam.call(this, "detune", this._filter.detune);
  // NOTE: this overriding processor-default gain method with filter's
  // which uses "dB" metric
  // NOTE: this is not working
  WX._unit.bindAudioParam.call(this, "gain", this._filter.gain);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.filter.prototype = {
  // this label will be appended automatically
  label: "filter",
  _default: {
    cutoff: 1000,
    Q: 1
  },
  // type
  type: function (type) {
    if (type !== undefined) {
      // TODO: need a switch for shortcuts
      this._filter.type = type;
      return this;
    } else {
      return this._filter.type;
    }
  }
};

WX._unit.extend(WX._unit.filter.prototype, WX._unit.processor.prototype);