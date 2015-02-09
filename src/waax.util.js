// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

/**
 * Features system-wide logging utilities.
 * @namespace WX.Log
 */
WX.Log = {
  // log level. (1: info, 2: warn, 3: error)
  _LEVEL: 1
};

/**
 * Sets logging level.
 * @param {Number} level logging level { 1: info, 2: warn, 3: error }
 */
WX.Log.setLevel = function (level) {
  this._LEVEL = level;
};

/**
 * Prints an informative message on console.
 * @param {...String} message messages to be printed
 */
WX.Log.info = function () {
  if (this._LEVEL > 1) return;
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[WX:info]');
  window.console.log.apply(window.console, args);
};

/**
 * Prints a warning message on console.
 * @param {...String} message messages to be printed.
 */
WX.Log.warn = function () {
  if (this._LEVEL > 2) return;
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[WX:warn]');
  window.console.log.apply(window.console, args);
};

/**
 * Prints an error message on console and throws an error.
 * @param {...String} message messages to be printed.
 */
WX.Log.error = function () {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[WX:error]');
  window.console.log.apply(window.console, args);
  throw new Error('[WX:error]');
};

/**
 * Returns WAAX API version number. (semantic version)
 * @returns {Number} WAAX API version number
 * @see http://semver.org/
 */
WX.getVersion = function () {
  return this._VERSION;
};

// Object manipulation and music math.
// : Features utilities for object manipulation, music math and more.
//   Note that all utility methods are under WX namespace.
// References
// : http://underscorejs.org/docs/underscore.html
// : https://github.com/libpd/libpd/blob/master/pure-data/src/x_acoustics.c

/**
 * Checks if an argument is a JS object.
 * @returns {Boolean}
 */
WX.isObject = function (obj) {
  return obj === Object(obj);
};

/**
 * Checks if an argument is a JS function.
 * @returns {Boolean}
 */
WX.isFunction = function (fn) {
  return toString.call(fn) === '[object Function]';
};

/**
 * Checks if an argument is a JS array.
 * @returns {Boolean}
 */
WX.isArray = function (arr) {
  return toString.call(arr) === '[object Array]';
};

/**
 * Checks if the type of an argument is Number.
 * @returns {Boolean}
 */
WX.isNumber = function (num) {
  return toString.call(num) === '[object Number]';
};

/**
 * Checks if the type of an argument is Boolean.
 * @returns {Boolean}
 */
WX.isBoolean = function (bool) {
  return toString.call(bool) === '[object Boolean]';
};

/**
 * Checks if a WAAX plug-in has a parameter
 * @param {String} param Parameter name
 * @returns {Boolean}
 */
WX.hasParam = function(plugin, param) {
  return hasOwnProperty.call(plugin.params, param);
};

/**
 * Extends target object with the source object. If two objects have
 *   duplicates, properties in target object will be overwritten.
 * @param  {Object} target Object to be extended
 * @param  {Object} source Object to be injected
 * @returns {Object} A merged object.
 */
WX.extend = function (target, source) {
  for (var prop in source) {
    target[prop] = source[prop];
  }
  return target;
};

/**
 * Retunrs a clone of JS object. This returns shallow copy.
 * @param  {Object} source Object to be cloned
 * @returns {Object} Cloned object
 */
WX.clone = function (source) {
  var obj = {};
  for (var prop in source) {
    obj[prop] = source[prop];
  }
  return obj;
};

/**
 * Validates a WAAX model. This verifies if all the keys in the
 * model is unique. WAAX model is a collection of key-value pairs
 * that is useful for data binding or templating.
 * @param  {Array} model WAAX model
 * @returns {Boolean}
 * @example
 * // Example WAAX model for waveform types
 * var model = [
 *   { key:'Sine', value:'sine' },
 *   { key:'Sawtooth', value:'sawtooth' }
 *   ...
 * ];
 */
WX.validateModel = function (model) {
  if (model.length === 0) {
    return false;
  }
  var keys = [];
  for (var i = 0; i < model.length; i++) {
    if (keys.indexOf(model[i].key) > -1) {
      return false;
    } else {
      keys.push(model[i].key);
    }
  }
  return true;
};

/**
 * Finds a key from a model by a value.
 * @param  {Array} model WAAX model
 * @param  {*} value Value in model
 * @returns {String|null} Key or null when not found.
 * @see {@link WX.Model} for WAAX model specification.
 */
WX.findKeyByValue = function (model, value) {
  for (var i = 0; i < model.length; i++) {
    if (model[i].value === value) {
      return model[i].key;
    }
  }
  return null;
};

/**
 * Finds a value from a model by a key.
 * @param  {Array} model WAAX model
 * @param  {String} key Key in model
 * @returns {*|null} Value or null when not found.
 * @see {@link WX.validateModel} for WAAX model specification.
 */
WX.findValueByKey = function (model, key) {
  for (var i = 0; i < model.length; i++) {
    if (model[i].key === key) {
      return model[i].value;
    }
  }
  return null;
};

/**
 * Clamps a number into a range specified by min and max.
 * @param  {Number} value Value to be clamped
 * @param  {Number} min   Range minimum
 * @param  {Number} max   Range maximum
 * @return {Number}       Clamped value
 */
WX.clamp = function (value, min, max) {
  return Math.min(Math.max(value, min), max);
};

/**
 * Generates a floating point random number between min and max.
 * @param  {Number} min Range minimum
 * @param  {Number} max Range maximum
 * @return {Number}     A floating point random number
 */
WX.random2f = function (min, max) {
  return min + Math.random() * (max - min);
};

/**
 * Generates an integer random number between min and max.
 * @param  {Number} min Range minimum
 * @param  {Number} max Range maximum
 * @return {Number}     An integer random number
 */
WX.random2 = function (min, max) {
  return Math.round(min + Math.random() * (max - min));
};

/**
 * Converts a MIDI pitch number to frequency.
 * @param  {Number} midi MIDI pitch (0 ~ 127)
 * @return {Number}      Frequency (Hz)
 */
WX.mtof = function (midi) {
  if (midi <= -1500) return 0;
  else if (midi > 1499) return 3.282417553401589e+38;
  else return 440.0 * Math.pow(2, (Math.floor(midi) - 69) / 12.0);
};

/**
 * Converts frequency to MIDI pitch.
 * @param  {Number} freq Frequency
 * @return {Number}      MIDI pitch
 */
WX.ftom = function (freq) {
  return Math.floor(
    freq > 0 ?
    Math.log(freq/440.0) / Math.LN2 * 12 + 69 : -1500
  );
};

/**
 * Converts power to decibel. Note that it is off by 100dB to make it
 *   easy to use MIDI velocity to change volume. This is the same
 *   convention that PureData uses. This behaviour might change in the
 *   future.
 * @param  {Number} power Power
 * @return {Number}       Decibel
 */
WX.powtodb = function (power) {
  if (power <= 0) return 0;
  else {
    var db = 100 + 10.0 / Math.LN10 * Math.log(power);
    return db < 0 ? 0 : db;
  }
};

/**
 * Converts decibel to power. Note that it is off by 100dB to make it
 *   easy to use MIDI velocity to change volume. This is the same
 *   convention that PureData uses. This behaviour might change in the
 *   future.
 * @param  {Number} db Decibel
 * @return {Number}    Power
 */
WX.dbtopow = function (db) {
  if (db <= 0) return 0;
  else {
    // TODO: what is 870?
    if (db > 870) db = 870;
    return Math.exp(Math.LN10 * 0.1 * (db - 100.0));
  }
};

/**
 * Converts RMS(root-mean-square) to decibel.
 * @param  {Number} rms RMS value
 * @return {Number}     Decibel
 */
WX.rmstodb = function (rms) {
  if (rms <= 0) return 0;
  else {
    var db = 100 + 20.0 / Math.LN10 * Math.log(rms);
    return db < 0 ? 0 : db;
  }
};

/**
 * Converts decibel to RMS(root-mean-square).
 * @param  {Number} db  Decibel
 * @return {Number}     RMS value
 */
WX.dbtorms = function (db) {
  if (db <= 0) return 0;
  else {
    // TO FIX: what is 485?
    if (db > 485) db = 485;
    return Math.exp(Math.LN10 * 0.05 * (db - 100.0));
  }
};

/**
 * Converts linear amplitude to decibel.
 * @param  {Number} lin Linear amplitude
 * @return {Number}     Decibel
 */
WX.lintodb = function (lin) {
  // if below -100dB, set to -100dB to prevent taking log of zero
  return 20.0 * (lin > 0.00001 ? (Math.log(lin) / Math.LN10) : -5.0);
};

/**
 * Converts decibel to linear amplitude. Useful for dBFS conversion.
 * @param  {Number} db  Decibel
 * @return {Number}     Linear amplitude
 */
WX.dbtolin = function (db) {
  return Math.pow(10.0, db / 20.0);
};

/**
 * Converts MIDI velocity to linear amplitude.
 * @param  {Number} velocity MIDI velocity
 * @return {Number}     Linear amplitude
 */
WX.veltoamp = function (velocity) {
  // TODO: velocity curve here?
  return velocity / 127;
};

/**
 * Loads WAAX clip by XHR loading
 * @param  {Object} clip WAAX Clip
 * @param  {callback_loadClip_oncomplete} oncomplete Function called when
 *   completed.
 * @param  {callback_loadClip_onprogress} onprogress <i>Optional.</i>
 *   Callback for progress report.
 * @example
 * // Creates a WAAX clip on the fly.
 * var clip = {
 *   name: 'Cool Sample',
 *   url: 'http://mystaticdata.com/samples/coolsample.wav',
 *   buffer: null
 * };
 * // Loads the clip and assign the buffer to a sampler plug-in.
 * WX.loadClip(clip, function (clip) {
 *   mySampler.setBuffer(clip.buffer);
 * });
 */
WX.loadClip = function (clip, oncomplete, onprogress) {
  if (!oncomplete) {
    WX.Log.error('Specify `oncomplete` action.');
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', clip.url, true);
  xhr.responseType = 'arraybuffer';
  xhr.onprogress = function (event) {
    if (onprogress) {
      onprogress(event, clip);
    }
  };
  xhr.onload = function (event) {
    try {
      WX._ctx.decodeAudioData(
        xhr.response,
        function (buffer) {
          clip.buffer = buffer;
          oncomplete(clip);
        }
      );
    } catch (error) {
      WX.Log.error('Loading clip failed. (XHR failure)', error.message, clip.url);
    }
  };
  xhr.send();
};

/**
 * Callback for clip loading completion. Called by {@link WX.loadClip}.
 * @callback callback_loadclip_oncomplete
 * @param {Object} clip WAAX clip
 * @see WX.loadClip
 */

/**
 * Callback for clip loading progress report. called by {@link WX.loadClip}.
 * @callback callback_loadclip_onprogress
 * @param {Object} event XHR progress event object
 * @param {Object} clip WAAX clip
 * @see WX.loadClip
 * @see https://dvcs.w3.org/hg/progress/raw-file/tip/Overview.html
 */