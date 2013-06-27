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
 * WAAX.js
 * @file WAAX library primer, the name space
 * @author hoch (Hongchan Choi)
 * @version R8
 */


// namespace WX 
WX = (function () {
  var _version = "r8";
  var _ctx = new AudioContext();
  var _ignore_ = function () {
    return;
  };

  return Object.create(null, {

    /**
     * returns web audio API context object.
     * @type {AudioContext}
     * @readonly
     */
    context: {
      enumerable: true,
      get: function () {
        return _ctx;
      },
      set: _ignore_
    },

    /**
     * returns sample rate of the context.
     * @type {int}
     * @readonly
     */
    sampleRate: {
      enumerable: true,
      get: function () {
        return _ctx.sampleRate;
      },
      set: _ignore_
    },

    /**
     * returns the current time in the context.
     * @type {float}
     * @readonly
     */
    now: {
      enumerable: true,
      get: function () {
        return _ctx.currentTime;
      },
      set: _ignore_
    },

    /**
     * returns the version of library.
     * @type {int}
     * @readonly
     */
    version: {
      enumerable: true,
      get: function () {
        return _version;
      },
      set: _ignore_
    }
  });
})();