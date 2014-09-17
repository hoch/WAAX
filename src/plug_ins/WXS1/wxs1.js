/**
 * @wapl WXS1
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */
(function (WX) {

  'use strict';

  /** REQUIRED: plug-in constructor **/
  function WXS1(preset) {

    // REQUIRED: adding necessary modules
    WX.PlugIn.defineType(this, 'Generator');

    // 2 oscs
    this._osc1 = WX.OSC();
    this._osc2 = WX.OSC();
    // 2 osc gains
    this._osc1gain = WX.Gain();
    this._osc2gain = WX.Gain();
    // 1 lowpass (-12dB/oct)
    this._lowpass = WX.Filter();
    // 1 amplifier
    this._amp = WX.Gain();
    // patching
    this._osc1.to(this._osc1gain).to(this._lowpass);
    this._osc2.to(this._osc2gain).to(this._lowpass);
    this._lowpass.to(this._amp);
    this._amp.to(this._output);
    // start generation
    this._osc1.start(0);
    this._osc2.start(0);

    // close envelope
    this._amp.gain.value = 0.0;

    // flag
    this.BUSY = false;

    // parameter definition
    WX.defineParams(this, {

      osc1type: {
        type: 'Itemized',
        name: 'Waveform',
        default: 'square',
        model: WX.WAVEFORMS
      },

      osc1octave: {
        type: 'Generic',
        name: 'Octave',
        default: 0,
        min: -5,
        max: 5,
        unit: 'Octave'
      },

      osc1gain: {
        type: 'Generic',
        name: 'Gain',
        default: 0.5,
        min: 0.0,
        max: 1.0,
        unit: 'LinearGain'
      },

      osc2type: {
        type: 'Itemized',
        name: 'Waveform',
        default: 'square',
        model: WX.WAVEFORMS
      },

      osc2detune: {
        type: 'Generic',
        name: 'Semitone',
        default: 0,
        min: -60,
        max: 60,
        unit: 'Semitone'
      },

      osc2gain: {
        type: 'Generic',
        name: 'Gain',
        default: 0.5,
        min: 0.0,
        max: 1.0,
        unit: 'LinearGain'
      },

      cutoff: {
        type: 'Generic',
        name: 'Cutoff',
        default: 1000,
        min: 20,
        max: 5000,
        unit: 'Hertz'
      },

      reso: {
        type: 'Generic',
        name: 'Reso',
        default: 0.0,
        min: 0.0,
        max: 20.0,
        unit: ''
      },

      filterMod: {
        type: 'Generic',
        name: 'FiltMod',
        default: 1.0,
        min: 0.25,
        max: 8.0,
        unit: ''
      },

      filterAttack: {
        type: 'Generic',
        name: 'FiltAtt',
        default: 0.02,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },

      filterDecay: {
        type: 'Generic',
        name: 'FiltDec',
        default: 0.04,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },

      filterSustain: {
        type: 'Generic',
        name: 'FiltSus',
        default: 0.25,
        min: 0.0,
        max: 1.0
      },

      filterRelease: {
        type: 'Generic',
        name: 'FiltRel',
        default: 0.2,
        min: 0.0,
        max: 10.0,
        unit: 'Seconds'
      },

      ampAttack: {
        type: 'Generic',
        name: 'Att',
        default: 0.02,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },

      ampDecay: {
        type: 'Generic',
        name: 'Dec',
        default: 0.04,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },

      ampSustain: {
        type: 'Generic',
        name: 'Sus',
        default: 0.25,
        min: 0.0,
        max: 1.0
      },

      ampRelease: {
        type: 'Generic',
        name: 'Rel',
        default: 0.2,
        min: 0.0,
        max: 10.0,
        unit: 'Seconds'
      }
    });

    // REQUIRED: initializing instance with preset
    WX.PlugIn.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  WXS1.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'WXS1',
      version: '0.0.2',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Generator',
      description: '2 OSC Monophonic Subtractive Synth'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      osc1type: 'square',
      osc1octave: -1,
      osc1gain: 0.6,
      osc2type: 'square',
      osc2detune: 7.0,
      osc2gain: 0.6,
      cutoff: 140,
      reso: 18.0,
      filterMod: 7,
      filterAttack: 0.01,
      filterDecay: 0.07,
      filterSustain: 0.5,
      filterRelease: 0.03,
      ampAttack: 0.01,
      ampDecay: 0.44,
      ampSustain: 0.2,
      ampRelease: 0.06,
      output: 0.8
    },

    // REQUIRED: if you have a parameter,
    //           corresponding handler is required.

    $osc1type: function (value, time, rampType) {
      this._osc1.type = value;
    },

    $osc1octave: function (value, time, rampType) {
      this._osc1.detune.set(value * 1200, time, rampType);
    },

    $osc1gain: function (value, time, rampType) {
      this._osc1gain.gain.set(value, time, rampType);
    },

    $osc2type: function (value, time, rampType) {
      this._osc2.type = value;
    },

    $osc2detune: function (value, time, rampType) {
      this._osc2.detune.set(value * 100, time, rampType);
    },

    $osc2gain: function (value, time, rampType) {
      this._osc2gain.gain.set(value, time, rampType);
    },

    $cutoff: function (value, time, rampType) {
      this._lowpass.frequency.set(value, time, rampType);
    },

    $reso: function (value, time, rampType) {
      this._lowpass.Q.set(value, time, rampType);
    },

    noteOn: function (pitch, velocity, time) {
      time = (time || WX.now);
      var p = this.params,
          aAtt = p.ampAttack.get(),
          aDec = p.ampDecay.get(),
          fAmt = p.filterMod.get() * 1200,
          fAtt = p.filterAttack.get(),
          fDec = p.filterDecay.get(),
          fSus = p.filterSustain.get();
      // sets frequency
      this._osc1.frequency.set(WX.mtof(pitch), time + 0.02, 1);
      this._osc2.frequency.set(WX.mtof(pitch), time + 0.02, 1);
      // attack
      this._amp.gain.set(1.0, [time, aAtt], 3);
      this._lowpass.detune.set(fAmt, [time, fAtt], 3);
      // decay
      this._amp.gain.set(fSus, [time + aAtt, aDec], 3);
      this._lowpass.detune.set(fAmt * fSus, [time + fAtt, fDec], 3);
      // for chaining
      return this;
    },

    glide: function (pitch, time) {
      time = (time || WX.now) + 0.04;
      this._osc1.frequency.set(WX.mtof(pitch), time, 1);
      this._osc2.frequency.set(WX.mtof(pitch), time, 1);
    },

    noteOff: function (time) {
      time = (time || WX.now);
      var p = this.params;
      // cancel pre-programmed envelope data points
      this._amp.gain.cancel(time);
      this._lowpass.detune.cancel(time);
      // release
      this._amp.gain.set(0.0, [time, p.ampRelease.get()], 3);
      this._lowpass.detune.set(0.0, [time, p.filterRelease.get()], 3);
      // for chaining
      return this;
    },

    // realtime input data responder
    onData: function (action, data) {
      // console.log('wxs1', action, data);
      switch (action) {
        case 'noteon':
          this.noteOn(data.pitch, data.velocity, data.time);
          break;
        case 'glide':
          this.glide(data.pitch);
          break;
        case 'noteoff':
          this.noteOff(data.time);
          break;
      }
    }
  };

  // REQUIRED: extending plug-in prototype with modules
  WX.PlugIn.extendPrototype(WXS1, 'Generator');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.PlugIn.register(WXS1);

})(WX);