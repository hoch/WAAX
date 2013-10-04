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
 * WX.step : WX.Step
 * @file generates DC offset from pre-built buffer source
 * @see Builtin.js
 */
WX._unit.step = function (options) {
  // pre-building: initiate generator wrapper
  WX._unit.generator.call(this);
  // building
  this._step = WX.context.createBufferSource();
  this._step.buffer = WX._builtin.dcOffset;
  this._step.connect(this._outputGain);
  this._step.start(0);
  // internal initialization
  this._step.loop = 1;
  this._step.loopEnd = 1.0;
  // post-building: handling initial parameter
  this._initializeParams(options, this._default);
};

WX._unit.step.prototype = {
  label: "step",
  _default: {
    gain: 1.0
  },

  /**
   * stops generation. (returns nothing.)
   * @param  {float} moment stop time in second. stops immediately when the time is undefined.
   */
  stop: function (moment) {
    this._step.stop(moment || WX.now);
  }
};

WX._unit.extend(WX._unit.step.prototype, WX._unit.generator.prototype);