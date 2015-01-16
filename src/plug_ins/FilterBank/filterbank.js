// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

(function (WX) {

  'use strict';

  // Pre-defined scales: ionian, lydian, aeolian, and mixolydian.
  var SCALES = [
    { key: 'Ionian', value: 'ionian' },
    { key: 'Lydian', value: 'lydian' },
    { key: 'Mixolydian', value: 'mixolydian' },
    { key: 'Aeolian', value: 'aeolian' }
  ];

  // Pitch class for scales.
  var PITCHES = {
    'ionian': [0, 7, 14, 21, 28, 35, 43, 48],
    'lydian': [0, 6, 16, 21, 26, 35, 42, 48],
    'mixolydian': [0, 5, 16, 23, 26, 33, 41, 48],
    'aeolian': [0, 7, 15, 22, 26, 34, 39, 48]
  };

  // Number of bands. A band is consist of cascaded two bandpass filters.
  var NUM_BANDS = 8;

  /**
   * Implements harmonized 8-band filterbank.
   * @type {WAPL}
   * @param {Object} preset Parameter preset.
   * @param {Number} preset.pitch
   * @param {Number} preset.scale
   * @param {Number} preset.slope
   * @param {Number} preset.width
   * @param {Number} preset.detune
   */
  function FilterBank(preset) {

    WX.PlugIn.defineType(this, 'Processor');

    // Cascading 2 filters (serial connection) for sharp resonance.
    this._filters1 = [];
    this._filters2 = [];
    this._gains = [];
    this._summing = WX.Gain();
    for (var i = 0; i < NUM_BANDS; ++i) {
      this._filters1[i] = WX.Filter();
      this._filters2[i] = WX.Filter();
      this._gains[i] = WX.Gain();
      this._filters1[i].type = 'bandpass';
      this._filters2[i].type = 'bandpass';
      this._input.to(this._filters1[i]);
      this._filters1[i].to(this._filters2[i]).to(this._gains[i]);
      this._gains[i].to(this._summing);
    }
    this._summing.to(this._output);

    // Gain compensation. The resulting loudness of filterbank is fairly small.
    this._summing.gain.value = 35.0;

    // Parameter definition
    WX.defineParams(this, {

      pitch: {
        type: 'Generic',
        name: 'Pitch',
        default: 24,
        min: 12,
        max: 48
      },

      scale: {
        type: 'Itemized',
        name: 'Scale',
        default: 'lydian',
        model: SCALES
      },

      slope: {
        type: 'Generic',
        name: 'Harmonics',
        default: 0.26,
        min: 0.1,
        max: 0.75
      },

      width: {
        type: 'Generic',
        name: 'Width',
        default: 0.49,
        min: 0.0,
        max: 1.0
      },

      detune: {
        type: 'Generic',
        name: 'Detune',
        default: 0.0,
        min: 0.0,
        max: 1.0
      }

    });

    WX.PlugIn.initPreset(this, preset);
  }

  FilterBank.prototype = {

    info: {
      name: 'FilterBank',
      version: '0.0.1',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Processor',
      description: 'Harmonized 8-band filterbank'
    },

    defaultPreset: {
      pitch: 34,
      scale: 'lydian',
      slope: 0.65,
      width: 0.15,
      detune: 0.0
    },

    // Change frequency of filters
    $pitch: function (value, time, rampType) {
      var f0 = WX.mtof(value);
      for (var i = 0; i < NUM_BANDS; i++) {
        this._filters1[i].frequency.set(f0, time, rampType);
        this._filters2[i].frequency.set(f0, time, rampType);
      }
    },

    // Change detune of filters. (Note that this is in cents.)
    $scale: function (value, time, rampType) {
      time = (WX.now || time);
      var pitches = PITCHES[value];
      for (var i = 1; i < NUM_BANDS; i++) {
        this._filters1[i].detune.set(pitches[i] * 100, time, rampType);
        this._filters2[i].detune.set(pitches[i] * 100, time, rampType);
      }
    },

    $slope: function (value, time, rampType) {
      for (var i = 0; i < NUM_BANDS; i++) {
        // Gain balancing formula.
        var gain = 1.0 + Math.sin(Math.PI + (Math.PI/2 * (value + i/NUM_BANDS)));
        this._gains[i].gain.set(gain, time, rampType);
      }
    },

    $width: function (value, time, rampType) {
      for (var i = 1; i < NUM_BANDS; i++) {
        // Q formula.
        var q = 2 + 90 * Math.pow((1 - i / NUM_BANDS), value);
        this._filters1[i].Q.set(q, time, rampType);
        this._filters2[i].Q.set(q, time, rampType);
      }
    },

    // TO FIX: detune handler
    $detune: function (value, time, rampType) {

    },

    getScaleModel: function () {
      return SCALES.slice(0);
    }

    // TO FIX: noteon, noteoff. Interactive features.

  };

  WX.PlugIn.extendPrototype(FilterBank, 'Processor');
  WX.PlugIn.register(FilterBank);

})(WX);