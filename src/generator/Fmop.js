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
 * WX.fmop: WX.Fmop
 * @file single FM Operator (2 oscillators)
 */
WX._unit.fmop = function (options) {
  // initiate generator wrapper : pre-build
  WX._unit.generator.call(this);
  // build unit
  this._mod = WX.context.createOscillator();
  this._car = WX.context.createOscillator();
  this._modGain = WX.context.createGain();
  this._mod.connect(this._modGain);
  this._modGain.connect(this._car.frequency);
  this._car.connect(this._outputGain);
  this._carFreq = 220;
  this._harmRatio = 1.0;
  this._modIndex = 1.0;
  this._mod.start(0);
  this._car.start(0);
  // bind AudioParam
  WX._unit.bindAudioParam.call(this, "modFreq", this._mod.frequency);
  WX._unit.bindAudioParam.call(this, "carFreq", this._car.frequency);
  WX._unit.bindAudioParam.call(this, "modDetune", this._mod.detune);
  WX._unit.bindAudioParam.call(this, "carDetune", this._car.detune);
  WX._unit.bindAudioParam.call(this, "modGain", this._modGain.gain);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.fmop.prototype = {
  label: "fmop",
  _default: {
    freq: 220,
    harmRatio: 4,
    modIndex: 0.1
  },
  freq: function(value, moment, type) {
    if (value !== undefined) {
      this._carFreq = value;
      return this.carFreq(value, moment, type);
    } else {
      return this._carFreq;
    }
  },
  harmRatio: function(value, moment, type) {
    if (value !== undefined) {
      this._harmRatio = value;
      var v = this._carFreq * this._harmRatio;
      return this.modFreq(v, moment, type);
    } else {
      return this._harmRatio;
    }
  },
  modIndex: function(value, moment, type) {
    if (value !== undefined) {
      this._modIndex = value;
      var v = this._carFreq * this._harmRatio * this._modIndex;
      return this.modGain(v, moment, type);
    } else {
      return this._modIndex;
    }
  },
  stop: function(moment) {
    this._mod.stop(moment);
    this._car.stop(moment);
  }
};

WX._unit.extend(WX._unit.fmop.prototype, WX._unit.generator.prototype);