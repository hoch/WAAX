/**
 * WAPL: WSX1
 * @author      hoch (hongchan.choi@gmail.com)
 * @description Stock: Monophonic Subtractive Synth
 */


(function (WX) {

  'use strict';

  /** REQUIRED: plug-in constructor **/
  function WXS1(preset) {

    // REQUIRED: adding necessary modules
    WX.Plugin.defineType(this, 'Generator');

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

    // flag
    this.BUSY = false;

    this.waveforms = ['sine', 'square', 'sawtooth', 'triangle'];

    WX.defineParams(this, {
      osc1type: { type: 'Items', label: 'Waveform',
        default: 'sawtooth', items: this.waveforms
      },
      osc1octave: { type: 'Generic', unit: 'Octave',
        default: 0, min: -5, max: 5
      },
      osc1gain: { type: 'Generic', unit: 'LinearGain',
        default: 0.5, min: 0.0, max: 1.0
      },
      osc2type: { type: 'Items', label: 'Waveform',
        default: 'sawtooth', items: this.waveforms
      },
      osc2detune: { type: 'Generic', unit: 'Semitone',
        default: 0, min: -60, max: 60
      },
      osc2gain: { type: 'Generic', unit: 'LinearGain',
        default: 0.5, min: 0.0, max: 1.0
      },
      cutoff: { type: 'Generic', unit: 'Hertz',
        default: 1000, min: 20, max: 5000
      },
      reso: { type: 'Generic', unit: '',
        default: 0.0, min: 0.0, max: 20.0
      },
      filterModAmount: { type: 'Generic', unit: '',
        default: 1.0, min: 0.25, max: 8.0
      },
      filterDetune: { type: 'Generic', unit: 'Octave',
        default: 0.0, min: 0.0, max: 5.0
      },
      filterAttack: { type: 'Generic', unit: 'Seconds',
        default: 0.02, min: 0.0, max: 5.0
      },
      filterDecay: { type: 'Generic', unit: 'Seconds',
        default: 0.04, min: 0.0, max: 5.0
      },
      filterSustain: { type: 'Generic', unit: '',
        default: 0.25, min: 0.0, max: 1.0
      },
      filterRelease: { type: 'Generic', unit: 'Seconds',
        default: 0.2, min: 0.0, max: 10.0
      },
      amp: { type: 'Generic', unit: 'LinearGain',
        default: 0.0, min: 0.0, max: 1.0
      },
      ampAttack: { type: 'Generic', unit: 'Seconds',
        default: 0.02, min: 0.0, max: 5.0
      },
      ampDecay: { type: 'Generic', unit: 'Seconds',
        default: 0.04, min: 0.0, max: 5.0
      },
      ampSustain: { type: 'Generic', unit: '',
        default: 0.25, min: 0.0, max: 1.0
      },
      ampRelease: { type: 'Generic', unit: 'Seconds',
        default: 0.2, min: 0.0, max: 10.0
      }
    });

    // REQUIRED: initializing instance with preset
    WX.Plugin.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  WXS1.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'SimpleOsc',
      api_version: '1.0.0-alpha',
      plugin_version: '0.0.2',
      author: 'hoch',
      type: 'instrument',
      description: '2 Osc Monophonic Subtractive Synth'
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
      filterModAmount: 7,
      filterDetune: 0.0,
      filterAttack: 0.01,
      filterDecay: 0.07,
      filterSustain: 0.02,
      filterRelease: 0.03,
      amp: 0.0,
      ampAttack: 0.01,
      ampDecay: 0.44,
      ampSustain: 0.07,
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

    $filterDetune: function (value, time, rampType) {
      this._lowpass.detune.set(value, time, rampType);
    },

    $amp: function (value, time, rampType) {
      this._amp.gain.set(value, time, rampType);
    },

    noteOn: function (pitch, velocity) {
      this._osc1.frequency.set(WX.mtof(pitch), WX.now + 0.01, 1);
      this._osc2.frequency.set(WX.mtof(pitch), WX.now + 0.01, 1);
      var t = WX.now,
          aAtt = this.params.ampAttack.get(),
          dDec = this.params.ampDecay.get();
      this.$amp(1.0, [t, aAtt], 3);
      this.$amp(this.params.ampSustain.get(), [t + aAtt, dDec], 3);

      var fAmt = this.params.filterModAmount.get() * 1200,
          fAtt = this.params.filterAttack.get(),
          fDec = this.params.filterDecay.get();
      this.$filterDetune(fAmt, [t, fAtt], 3);
      this.$filterDetune(fAmt * this.params.filterSustain.get(), [t + fAtt, fDec], 3);
    },

    glide: function (pitch) {
      this._osc1.frequency.set(WX.mtof(pitch), WX.now + 0.01, 1);
      this._osc2.frequency.set(WX.mtof(pitch), WX.now + 0.01, 1);
    },

    noteOff: function () {
      var t = WX.now;
      this._amp.gain.cancel(t);
      this._lowpass.frequency.cancel(t);
      this.$amp(0.0, [t, this.params.ampRelease.get()], 3);
      this.$filterDetune(0.0, [t, this.params.filterRelease.get()], 3);
    },

    // realtime input data responder
    onData: function (action, data) {
      switch (action) {
        case 'noteon':
          this.noteOn(data.pitch, data.velocity);
          break;
        case 'glide':
          this.glide(data.pitch);
          break;
        case 'noteoff':
          this.noteOff();
          break;
      }
    }
  };

  // REQUIRED: extending plug-in prototype with modules
  WX.Plugin.extendPrototype(WXS1, 'Generator');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.Plugin.register(WXS1);

})(WX);