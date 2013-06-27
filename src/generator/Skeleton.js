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


// Skeleton: Generator


/**
 * sample constructor
 * @param  {object} options option parameters
 */
WX._unit.internal_unitname = function (options) {

  // pre-build: generator wrapper
  WX._unit.generator.call(this);

  // build: declare parameters
  this._param1 = null;
  // build: create WAA nodes
  this._node = WX.context.createOscillator();
  // build: making connections
  this._node.connect(this._outputGain);
  // build: create callback if needed (i.e. xhr buffer loading)
  var me = this;
  this._oncomplete = function(obj) {
  };

  // post-build: bind parameters
  WX._unit.bindAudioParam.call(this, "freq", this._node.frequency);
  // post-build: initializing parameters
  this._initializeParams(options, this._default);

};


/**
 * sample prototype
 */
WX._unit.internal_unitname.prototype = {

  // label
  label: "sampler",

  // default params
  _default: {
    method1: 60
  },

  // param
  method1: function(value) {
    if (value !== undefined) {
      this._param1 = value;
    } else {
      return this._param1;
    }
  }
};


/**
 * extending unit prototype with abstract
 */
WX._unit.extend(WX._unit.sampler.prototype, WX._unit.generator.prototype);