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
 * WX.Converb
 */
WX._unit.converb = function (options) {
  // pre-building: processor wrapper
  WX._unit.processor.call(this);
  // building phase
  this._convolver = WX.context.createConvolver();
  this._dry = WX.context.createGain();
  this._wet = WX.context.createGain();
  this._inputGain.connect(this._convolver);
  this._inputGain.connect(this._dry);
  this._convolver.connect(this._wet);
  this._dry.connect(this._outputGain);
  this._wet.connect(this._outputGain);
  this._ready = false;
  this._url = null;
  // callback in constructor
  var me = this;
  this._oncomplete = function(obj) {
    me._url = obj.url;
    me._convolver.buffer = obj.buffer;
    me._ready = obj.status;
  };
  // post-building: parameter binding and initialization
  WX._unit.bindAudioParam.call(this, "dry", this._dry.gain);
  WX._unit.bindAudioParam.call(this, "wet", this._wet.gain);
  // initializing (final phase)
  this._initializeParams(options, this._default);
};

WX._unit.converb.prototype = {
  // this label will be appended automatically
  label: "converb",
  _default: {
    source: "../data/ir/hall.wav",
    mix: 0.1
  },
  // type
  source: function (url) {
    if (url) {
      WX._loadBuffer(url, this._oncomplete);
    } else {
      return this._url;
    }
  },
  mix: function (mix, moment, type) {
    if (mix !== undefined) {
      this.dry(1.0 - mix, moment, type);
      return this.wet(mix, moment, type);
    } else {
      return this.wet();
    }
  }
};

WX._unit.extend(WX._unit.converb.prototype, WX._unit.processor.prototype);