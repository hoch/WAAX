// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

(function (WX) {

  'use strict';

  // Internal unit biqual filter
  function UnitFilter(filterType, frequency) {
    this._input = WX.Gain();
    this._bypass = WX.Gain();
    this._biquad = WX.Filter();
    this._input.to(this._biquad);
    this._bypass.gain.value = 0.0;
    this._biquad.type = filterType;
    this._biquad.frequency.value = frequency;
    this._active = true;
  }

  UnitFilter.prototype = {

    setInput: function (inputNode) {
      inputNode.to(this._input, this._bypass);
    },

    setOutput: function (outputNode) {
      this._biquad.to(outputNode);
      this._bypass.to(outputNode);
    },

    cascade: function (unitFilter) {
      this._biquad.to(unitFilter._input, unitFilter._bypass);
      this._bypass.to(unitFilter._input, unitFilter._bypass);
    },

    toggle: function (bool) {
      this._active = bool;
      if (this._active) {
        this._input.gain.value = 1.0;
        this._bypass.gain.value = 0.0;
      } else {
        this._input.gain.value = 0.0;
        this._bypass.gain.value = 1.0;
      }
    },

    setFilterType: function (filterType) {
      this._biquad.type = filterType;
    },

    setAll: function (freq, Q, gain, time, rampType) {
      this._biquad.frequency.set(freq, time, rampType);
      this._biquad.Q.set(Q, time, rampType);
      this._biquad.gain.set(gain, time, rampType);
    },

    setFrequency: function (value, time, rampType) {
      this._biquad.frequency.set(value, time, rampType);
    },

    setQ: function (value, time, rampType) {
      this._biquad.Q.set(value, time, rampType);
    },

    setGain: function (value, time, rampType) {
      this._biquad.gain.set(value, time, rampType);
    },

    // TO FIX: for filter graph drawing.
    getFrequencyResponse: function (canvasWidth, numOctaves) {
      var frequencyHz = new Float32Array(canvasWidth);
      var magResponse = new Float32Array(canvasWidth);
      var phaseResponse = new Float32Array(canvasWidth);
      var nyquist = 0.5 * WX.srate;
      for (var i = 0; i < width; ++i) {
        // Convert to log frequency scale (octaves).
        frequencyHz[i] = nyquist * Math.pow(2.0, noctaves * (i / width - 1.0));
      }
      filter.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);

      return {
        freq: frequencyHz,
        mag: magResponse
      };
    }

  };


  /**
   * Implements a standard 4-band parametric equalizer.
   * @type {WAPL}
   * @param {Object} preset Parameter preset.
   * @param {Boolean} preset.band1Active Band 1 active switch.
   * @param {Itemized} preset.band1Type Band 1 filter type.
   * @param {Number} preset.band1Freq Band 1 frequency.
   * @param {Number} preset.band1Q Band 1 Q.
   * @param {Number} preset.band1Gain Band 1 gain (decibels).
   * @param {Boolean} preset.band2Active Band 2 active switch.
   * @param {Itemized} preset.band2Type Band 2 filter type.
   * @param {Number} preset.band2Freq Band 2 frequency.
   * @param {Number} preset.band2Q Band 2 Q.
   * @param {Number} preset.band2Gain Band 2 gain (decibels).
   * @param {Boolean} preset.band3Active Band 3 active switch.
   * @param {Itemized} preset.band3Type Band 3 filter type.
   * @param {Number} preset.band3Freq Band 3 frequency.
   * @param {Number} preset.band3Q Band 3 Q.
   * @param {Number} preset.band3Gain Band 3 gain (decibels).
   * @param {Boolean} preset.band4Active Band 4 active switch.
   * @param {Itemized} preset.band4Type Band 4 filter type.
   * @param {Number} preset.band4Freq Band 4 frequency.
   * @param {Number} preset.band4Q Band 4 Q.
   * @param {Number} preset.band4Gain Band 4 gain (decibels).
   */
  function EQ4(preset) {

    WX.PlugIn.defineType(this, 'Processor');

    this._band1 = new UnitFilter('lowshelf', 80);
    this._band2 = new UnitFilter('peaking', 500);
    this._band3 = new UnitFilter('peaking', 3500);
    this._band4 = new UnitFilter('highshelf', 10000);

    this._band1.setInput(this._input);
    this._band1.cascade(this._band2);
    this._band2.cascade(this._band3);
    this._band3.cascade(this._band4);
    this._band4.setOutput(this._output);

    // define parameters
    WX.defineParams(this, {

      band1Active: {
        type: 'Boolean',
        name: 'On 1',
        default: true
      },

      band1Type: {
        type: 'Itemized',
        name: 'Type 1',
        default: 'lowshelf',
        model: WX.FILTER_TYPES
      },

      band1Freq: {
        type: 'Generic',
        name: 'Freq 1',
        default: 80,
        min: 10,
        max: WX.srate * 0.5,
        unit: 'Hertz'
      },

      band1Q: {
        type: 'Generic',
        name: 'Q 1',
        default: 0.0,
        min: 0.01,
        max: 1000
      },

      band1Gain: {
        type: 'Generic',
        name: 'Gain 1',
        default: 0.0,
        min: -40,
        max: 40,
        unit: 'Decibels'
      },

      band2Active: {
        type: 'Boolean',
        name: 'On 2',
        default: true
      },

      band2Type: {
        type: 'Itemized',
        name: 'Type 2',
        default: 'peaking',
        model: WX.FILTER_TYPES
      },

      band2Freq: {
        type: 'Generic',
        name: 'Freq 2',
        default: 500,
        min: 10,
        max: WX.srate * 0.5,
        unit: 'Hertz'
      },

      band2Q: {
        type: 'Generic',
        name: 'Q 2',
        default: 0.0,
        min: 0.01,
        max: 1000
      },

      band2Gain: {
        type: 'Generic',
        name: 'Gain 2',
        default: 0.0,
        min: -40,
        max: 40,
        unit: 'Decibels'
      },

      band3Active: {
        type: 'Boolean',
        name: 'On 3',
        default: true
      },

      band3Type: {
        type: 'Itemized',
        name: 'Type 3',
        default: 'peaking',
        model: WX.FILTER_TYPES
      },

      band3Freq: {
        type: 'Generic',
        name: 'Freq 3',
        default: 3500,
        min: 10,
        max: WX.srate * 0.5,
        unit: 'Hertz'
      },

      band3Q: {
        type: 'Generic',
        name: 'Q 3',
        default: 0.0,
        min: 0.01,
        max: 1000
      },

      band3Gain: {
        type: 'Generic',
        name: 'Gain 3',
        default: 0.0,
        min: -40,
        max: 40,
        unit: 'Decibels'
      },

      band4Active: {
        type: 'Boolean',
        name: 'On 4',
        default: true
      },

      band4Type: {
        type: 'Itemized',
        name: 'Type 4',
        default: 'highshelf',
        model: WX.FILTER_TYPES
      },

      band4Freq: {
        type: 'Generic',
        name: 'Freq 4',
        default: 12000,
        min: 10,
        max: WX.srate * 0.5,
        unit: 'Hertz'
      },

      band4Q: {
        type: 'Generic',
        name: 'Q 4',
        default: 0.0,
        min: 0.01,
        max: 1000
      },

      band4Gain: {
        type: 'Generic',
        name: 'Gain 4',
        default: 0.0,
        min: -40,
        max: 40,
        unit: 'Decibels'
      }

    });

    WX.PlugIn.initPreset(this, preset);
  }

  EQ4.prototype = {

    info: {
      name: 'EQ4',
      version: '0.0.1',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Processor',
      description: '4-band Parametric Equalizer'
    },

    defaultPreset: {
      band1Active: true,
      band1Type: 'lowshelf',
      band1Freq: 80,
      band1Q: 0.0,
      band1Gain: 0.0,
      band2Active: true,
      band2Type: 'peaking',
      band2Freq: 500,
      band2Q: 0.0,
      band2Gain: 0.0,
      band3Active: true,
      band3Type: 'peaking',
      band3Freq: 3500,
      band3Q: 0.0,
      band3Gain: 0.0,
      band4Active: true,
      band4Type: 'highshelf',
      band4Freq: 12000,
      band4Q: 0.0,
      band4Gain: 0.0
    },

    $band1Active: function (value, time, rampType) {
      this._band1.toggle(value);
    },

    $band1Type: function (value, time, rampType) {
      this._band1.setFilterType(value);
    },

    $band1Freq: function (value, time, rampType) {
      this._band1.setFrequency(value, time, rampType);
    },

    $band1Q: function (value, time, rampType) {
      this._band1.setQ(value, time, rampType);
    },

    $band1Gain: function (value, time, rampType) {
      this._band1.setGain(value, time, rampType);
    },

    $band2Active: function (value, time, rampType) {
      this._band2.toggle(value);
    },

    $band2Type: function (value, time, rampType) {
      this._band2.setFilterType(value);
    },

    $band2Freq: function (value, time, rampType) {
      this._band2.setFrequency(value, time, rampType);
    },

    $band2Q: function (value, time, rampType) {
      this._band2.setQ(value, time, rampType);
    },

    $band2Gain: function (value, time, rampType) {
      this._band2.setGain(value, time, rampType);
    },

    $band3Active: function (value, time, rampType) {
      this._band3.toggle(value);
    },

    $band3Type: function (value, time, rampType) {
      this._band3.setFilterType(value);
    },

    $band3Freq: function (value, time, rampType) {
      this._band3.setFrequency(value, time, rampType);
    },

    $band3Q: function (value, time, rampType) {
      this._band3.setQ(value, time, rampType);
    },

    $band3Gain: function (value, time, rampType) {
      this._band3.setGain(value, time, rampType);
    },

    $band4Active: function (value, time, rampType) {
      this._band4.toggle(value);
    },

    $band4Type: function (value, time, rampType) {
      this._band4.setFilterType(value);
    },

    $band4Freq: function (value, time, rampType) {
      this._band4.setFrequency(value, time, rampType);
    },

    $band4Q: function (value, time, rampType) {
      this._band4.setQ(value, time, rampType);
    },

    $band4Gain: function (value, time, rampType) {
      this._band4.setGain(value, time, rampType);
    }

  };

  WX.PlugIn.extendPrototype(EQ4, 'Processor');
  WX.PlugIn.register(EQ4);

})(WX);