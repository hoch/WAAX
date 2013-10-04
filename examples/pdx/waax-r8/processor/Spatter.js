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
 * WX.Spatter
 * - PannerNode abstraction, phase inverter, delay, panning
 */
WX._unit.spatter = function (options) {
  // pre-building
  WX._unit.processor.call(this);
  // building
  this._inverter = WX.context.createGain();
  this._delay = WX.context.createDelay();
  this._panner = WX.context.createPanner();
  // connection
  this._inputGain.connect(this._inverter);
  this._inverter.connect(this._delay);
  this._delay.connect(this._panner);
  this._panner.connect(this._outputGain);
  // setting params
  this._delay.delayTime = 0.010;
  this._position = { x:0.0, y:1.0, z:0.0 };
  // bind parameter
  WX._unit.bindAudioParam.call(this, "delayTime", this._delay.delayTime);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.spatter.prototype = {
  label: "spatter",
  _default: {
    panner: { x:0.0 , y:1.0 , z:0.0 },
    gain: 1.0
  },
  invert: function(bool, moment) {
    if (typeof bool === "boolean") {
      var phi = (bool) ? -1.0 : 1.0;
      this._inverter.gain.setValueAtTime(phi, (moment || WX.now));
      return this;
    } else {
      return (this._inverter.gain.value == -1.0) ? true : false;
    }
  },
  panner: function(vec3) {
    if (vec3 !== undefined) {
      this._panner.setPosition(vec3.x, vec3.y, vec3.z);
      this._position = vec3;
      return this;
    } else {
      return this._position;
    }
  }
};

WX._unit.extend(WX._unit.spatter.prototype, WX._unit.processor.prototype);