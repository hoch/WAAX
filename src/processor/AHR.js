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
 * WX.AHR
 */
WX._unit.ahr = function (options) {
  // pre-building
  WX._unit.processor.call(this);
  // building  
  this._inputGain.connect(this._outputGain);
  this._attack = 0.005;
  this._hold = 0.015;
  this._release = 0.05;
  // bind parameter
  WX._unit.bindAudioParam.call(this, "envelope", this._inputGain.gain);
  // handling initial parameter : post-build
  this.envelope(0.0);
  this._initializeParams(options, this._default);
};

WX._unit.ahr.prototype = {
  // label
  label: "ahr",
  // time constant (-60dB)
  _tau: Math.log(0.01),
  // default
  _default: {
    attack: 0.015,
    hold: 0.015,
    release: 0.1
  },
  // methods
  attack: function (value) {
    if (value !== undefined) {
      this._attack = value;
    } else {
      return this._attack;
    }
  },
  hold: function (value) {
    if (value !== undefined) {
      this._hold = value;
    } else {
      return this._hold;
    }
  },
  release: function (value) {
    if (value !== undefined) {
      this._release = value;
      this._releaseTau = -this._release / this._tau;
    } else {
      return this._release;
    }
  },
  ahr: function (a, h, r) {
    this.attack(a);
    this.hold(h);
    this.release(r);
    return this;
  },
  noteOn: function(intensity, moment) {
    var t = (moment || WX.now),
        g = this._inputGain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t); // this only works when t = now;
    //g.setValueAtTime(0.0, t); // this will produce pop with previous release env
    g.linearRampToValueAtTime(intensity, t + this._attack);
    g.setValueAtTime(intensity, t + this._attack + this._hold);
    g.exponentialRampToValueAtTime(0.0, t + this._attack + this._hold + this._release);
    return this;
  }
};

WX._unit.extend(WX._unit.ahr.prototype, WX._unit.processor.prototype);