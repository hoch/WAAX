// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

/**
 * @namespace WX
 */
window.WX = {
  _VERSION: '1.0.0-alpha3'
};

// Monkey patching and feature detection.
var _webkitAC = window.hasOwnProperty('webkitAudioContext');
var _AC = window.hasOwnProperty('AudioContext');

if (!_webkitAC && !_AC) {
  throw new Error('Error: Web Audio API is not supported on your browser.');
} else {
  if (_webkitAC && !_AC) {
    window.AudioContext = window.webkitAudioContext;
  }
}

// Create AudioContext.
WX._ctx = new AudioContext();

// Checking the minimum dependency.
var _dependency = [
  // 'createStereoPanner',
];

for (var i = 0; i < _dependency.length; i++) {
  if (typeof WX._ctx[_dependency[i]] === 'undefined') {
    var message = 'Error: "' + _dependency + '" is not supported in AudioContext.';
    throw new Error(message);
  }
}

/**
 * @typedef WAPL
 * @description Web Audio API Plug-in Object.
 * @type {Object}
 */

/**
 * @typedef WXModel
 * @description Contains a model for data binding.
 * @type {Array}
 * @example
 * var model = [
 *   { key:'Sine', value:'sine' },
 *   { key:'Sawtooth', value:'sawtooth' }
 *   ...
 * ];
 */

/**
 * @typedef WXClip
 * @description WAAX abstraction of sample and meta data.
 * @type {Object}
 * @property {String} name User-defined name of sample.
 * @property {String} url URL of audio file.
 * @property {Object} buffer A placeholder for ArrayBuffer object.
 * @example
 * var clip = {
 *   name: 'Cool Sample',
 *   url: 'http://mystaticdata.com/samples/coolsample.wav',
 *   buffer: null
 * };
 */

/**
 * @typedef WXSampleZone
 * @description WAAX abstraction of sampler instrument data.
 * @type {Object}
 * @property {WXClip} clip WXClip object.
 * @property {Number} basePitch Original sample pitch.
 * @property {Boolean} loop Looping flag.
 * @property {Number} loopStart Loop start point in seconds.
 * @property {Number} loopEnd Loop end point in seconds.
 * @property {Number} pitchLow Low pitch bound.
 * @property {Number} pitchHigh High pitch bound.
 * @property {Number} velocityLow Low velocity bound.
 * @property {Number} velocityHigh High velocity bound.
 * @property {Boolean} pitchModulation Switch for pitch sensitivity modulation.
 * @property {Boolean} velocityModulatio Switch for velocity sensitivity modulation.
 * @example
 * var sampleZone = {
 *   clip: WXClip
 *   basePitch: 60            // samples original pitch
 *   loop: true,
 *   loopStart: 0.1,
 *   loopEnd: 0.5,
 *   pitchLow: 12,            // pitch low bound
 *   pitchHigh: 96,           // pitch high bound
 *   velocityLow: 12,         // velocity lower bound
 *   velocityHigh: 127,       // velocity high bound
 *   pitchModulation: true,   // use pitch modulation
 *   velocityModulatio: true  // use velocity moduation
 * };
 */