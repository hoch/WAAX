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
 * Utils.js
 * @file internal logging, math and other utilities
 */

/**
 * @ignore 
 * @description internal: logging WX
 */
WX._log = (function () {
  var _prefix = "[wx] ",
      _prefix_info = "[wx:info] ",
      _prefix_warn = "[wx:warn] ",
      _prefix_err = "[wx:err] ";
  var _verbose = true;
  function _compose(prefix, msg, ref) {
    var m = prefix + msg;
    if (ref && ref.label) {
      m += " (" + ref.label + ")";
    }
    return m;
  }
  return {
    verbose: function(bool) {
      if(typeof bool === "boolean") {
        _verbose = bool;
      }
    },
    post: function (msg) {
      console.log(_compose(_prefix, msg));
    },
    info: function (msg, ref) {
      if (_verbose) {
        console.log(_compose(_prefix_info, msg, ref));
      }
    },
    warn: function (msg, ref) {
      if (_verbose) {
        console.log(_compose(_prefix_warn, msg, ref));
      }
    },
    error: function (msg, ref) {
      throw new Error(_compose(_prefix_err, msg, ref));
    }
  };
})();


Object.defineProperties(WX, {

  /**
   * pi, equivalent to Math.PI
   * @memberOf WX
   * @type {float}
   */
  PI: {
    value: Math.PI
  },

  /**
   * 2 pi, equivalent to Math.PI * 2
   * @memberOf WX
   * @type {float}
   */
  TWOPI: {
    value: Math.PI * 2
  },

  /**
   * epsilon, equivalent to Number.MIN_VALUE
   * @memberOf WX
   * @type {float}
   */
  EPS: {
    value: Number.MIN_VALUE
  },

  /**
   * returns a float random number between (min, max)
   * @memberOf WX
   * @func
   * @param {float} min range minimum
   * @param {float} max range maximum
   * @returns {float} 
   */
  random2f: {
    value: function(min, max) {
      return min + Math.random() * (max - min);
    }
  },

  /**
   * returns an integer random number between (min, max)
   * @memberOf WX
   * @func
   * @param {float} min range minimum
   * @param {float} max range maximum
   * @returns {int}
   */
  random2: {
    value: function(min, max) {
      return Math.round(min + Math.random() * (max - min));
    }
  },

  /**
   * clamp!
   * @type {Object}
   */
  clamp: {
    value: function(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  },

  /**
   * converts a MIDI pitch to frequency(Hz)
   * @memberOf WX
   * @methods
   * @param {int} MIDI pitch (0~127)
   * @returns {float}
   */
  pitch2freq: {
    value: function(pitch) {
      return 440.0 * Math.pow(2, ((Math.floor(pitch) - 69) / 12));
    }
  },

  /**
   * converts frequency to a MIDI pitch
   * @memberOf WX
   * @methods
   * @param {float} frequency in Hz
   * @returns {float}
   */
  freq2pitch: {
    value: function(freq) {
      // Math.log(2) = 0.6931471805599453
      return Math.floor(69 + 12 * Math.log(freq / 440.0) / 0.6931471805599453);
    }
  },

  /**
   * converts linear amplitude to decibel
   * @memberOf WX
   * @methods
   * @param {float} linear amplitude
   * @returns {float}
   */
  lin2db: {
    value: function(amp) {
      // if below -100dB, set to -100dB to prevent taking log of zero
      // Math.LN10 = 2.302585092994046
      return 20.0 * (amp > 0.00001 ? (Math.log(amp) / 2.302585092994046): -5.0);
    }
  },

  /**
   * converts decibel to linear amplitude
   * @methods
   * @param {float} decibel
   * @returns {float}
   */
  db2lin: {
    value: function(db) {
     return Math.pow(10.0, db / 20.0);
    }
  }
});


/**
 * @ignore 
 * @description internal: XHR buffer loader, 
 * write the "oncomplete" callback accordingly
 */
WX._loadBuffer = function(url, oncomplete) {
  if (url === undefined || url === null) {
    WX._log.error("xhr failed (invalid url): " + url);
    // xhr failed
    return false;
  }
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function() {
    try {
      var b = WX.context.createBuffer(xhr.response, false);
      oncomplete({
        url: url,
        buffer: b,
        status: true
      });
      WX._log.post("loaded: " + url + " (" + b.numberOfChannels + "ch)");
    } catch(error) {
      WX._log.error("xhr failed (" + error.message + "): " + url);
    }
  };
  xhr.send();
  // xhr is done
  return true;
};

/**
 * @ignore 
 * @description internal: XHR buffer loader, 
 * write the "oncomplete" callback accordingly
 */
WX._loadBuffers = function(url, buffers, index, oncomplete) {
  if (url === undefined || url === null) {
    WX._log.error("xhr failed (invalid url): " + url);
    // xhr failed
    return false;
  }
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function() {
    try {
      var b = WX.context.createBuffer(xhr.response, false);
      buffers[index] = b;
      WX._log.post("loaded: " + url + " (" + b.numberOfChannels + "ch)");
      if (oncomplete) {
        oncomplete();
      }
    } catch(error) {
      WX._log.error("xhr failed (" + error.message + "): " + url);
    }
  };
  xhr.send();
  // xhr is done
  return true;
};