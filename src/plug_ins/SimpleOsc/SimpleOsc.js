// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

(function (WX) {

  'use strict';

  /**
   * Implements SimpleOsc insturment.
   * @type {WAPL}
   * @name SimpleOsc
   * @class
   * @memberOf WX
   * @param {Object} preset Parameter preset.
   * @param {GenericParam} preset.oscType Oscillator type.
   * @param {GenericParam} preset.oscFreq Oscillator frequency.
   * @param {ItermizedParam} preset.lfoType LFO type.
   * @param {GenericParam} preset.lfoRate LFO rate.
   * @param {GenericParam} preset.lfoDepth LFO depth.
   */
  function SimpleOsc(preset) {

    // REQUIRED: adding necessary modules
    WX.PlugIn.defineType(this, 'Generator');

    // patching, lfo frequency modulation
    this._lfo = WX.OSC();
    this._lfoGain = WX.Gain();
    this._osc = WX.OSC();
    this._amp = WX.Gain();
    this._osc.to(this._amp).to(this._output);
    this._lfo.to(this._lfoGain).to(this._osc.detune);
    this._lfo.start(0);
    this._osc.start(0);

    this._amp.gain.value = 0.0;

    // parameter definition
    WX.defineParams(this, {

      oscType: {
        type: 'Itemized',
        name: 'Waveform',
        default: 'sine', // all code-side representation should be 'value'
        model: WX.WAVEFORMS
      },

      oscFreq: {
        type: 'Generic',
        name: 'Freq',
        default: WX.mtof(60),
        min: 20.0,
        max: 5000.0,
        unit: 'Hertz'
      },

      lfoType: {
        type: 'Itemized',
        name: 'LFO Type',
        default: 'sine',
        model: WX.WAVEFORMS
      },

      lfoRate: {
        type: 'Generic',
        name: 'Rate',
        default: 1.0,
        min: 0.0,
        max: 20.0,
        unit: 'Hertz'
      },

      lfoDepth: {
        type: 'Generic',
        name: 'Depth',
        default: 1.0,
        min: 0.0,
        max: 500.0,
        unit: 'LinearGain'
      }

    });

    WX.PlugIn.initPreset(this, preset);
  }

  SimpleOsc.prototype = {

    info: {
      name: 'SimpleOsc',
      version: '0.0.2',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Generator',
      description: '1 OSC with LFO'
    },

    defaultPreset: {
      oscType: 'sine',
      oscFreq: WX.mtof(60),
      lfoType: 'sine',
      lfoRate: 1.0,
      lfoDepth: 1.0
    },

    $oscType: function (value, time, rampType) {
      this._osc.type = value;
    },

    $oscFreq: function (value, time, rampType) {
      this._osc.frequency.set(value, time, rampType);
    },

    $lfoType: function (value, time, rampType) {
      this._lfo.type = value;
    },

    $lfoRate: function (value, time, rampType) {
      this._lfo.frequency.set(value, time, rampType);
    },

    $lfoDepth: function (value, time, rampType) {
      this._lfoGain.gain.set(value, time, rampType);
    },

    /**
     * Start a note with pitch, velocity at time in seconds.
     * @param  {Number} pitch    MIDI pitch
     * @param  {Number} velocity MIDI velocity.
     * @param  {Number} time     Time in seconds.
     */
    noteOn: function (pitch, velocity, time) {
      time = (time || WX.now);
      this._amp.gain.set(velocity / 127, [time, 0.02], 3);
      this.params.oscFreq.set(WX.mtof(pitch), time + 0.02, 0);
      // this.$oscFreq(WX.mtof(pitch), time + 0.02, 0);
    },

    /**
     * Stop a note at time in seconds.
     * @param  {Number} time     Time in seconds.
     */
    noteOff: function (time) {
      time = (time || WX.now);
      this._amp.gain.set(0.0, [time, 0.2], 3);
    },

    /**
     * Route incoming event data from other WAAX input devices.
     * @param  {String} action Action type: ['noteon', 'noteoff']
     * @param  {Object} data   Event data.
     * @param  {Object} data.pitch   MIDI Pitch
     * @param  {Object} data.velocity   MIDI Velocity.
     */
    onData: function (action, data) {
      switch (action) {
        case 'noteon':
          this.noteOn(data.pitch, data.velocity);
          break;
        case 'noteoff':
          this.noteOff();
          break;
      }
    }
  };

  WX.PlugIn.extendPrototype(SimpleOsc, 'Generator');
  WX.PlugIn.register(SimpleOsc);

})(WX);