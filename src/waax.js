// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

// AudioContext detection and minimum monkey-patching. Inline execution.
(function () {
  var _audioContextFlagWebKit = window.hasOwnProperty('webkitAudioContext'),
      _audioContextFlagNonPrefixed = window.hasOwnProperty('AudioContext');
  if (!_audioContextFlagWebKit && !_audioContextFlagNonPrefixed) {
    throw new Error('FATAL: Web Audio API is not supported on your browser.');
  } else {
    if (_audioContextFlagWebKit && !_audioContextFlagNonPrefixed) {
      window.AudioContext = window.webkitAudioContext;
    }
  }
})();

'use strict';

/**
 * @namespace WX
 */
window.WX = {
  _VERSION: '1.0.0-alpha3'
};

WX.WAVEFORMS = [
  { key: 'Sine', value: 'sine' },
  { key: 'Square', value: 'square' },
  { key: 'Sawtooth', value: 'sawtooth' },
  { key: 'Triangle', value: 'triangle' }
];

WX.FILTER_TYPES = [
  { key:'LP' , value: 'lowpass' },
  { key:'HP' , value: 'highpass' },
  { key:'BP' , value: 'bandpass' },
  { key:'LS' , value: 'lowshelf' },
  { key:'HS' , value: 'highshelf' },
  { key:'PK' , value: 'peaking' },
  { key:'BR' , value: 'notch' },
  { key:'AP' , value: 'allpass' }
];

// WAAX internal audio context
WX._ctx = new AudioContext();