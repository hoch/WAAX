/**
 * WAPL: SP1
 * @author hoch (hongchan.choi@gmail.com)
 * @description stock plug-in, monotonic one-shot sampler (for drums)
 */


(function (WX) {

  'use strict';

  var filterTypes = [
    'lowpass', 'highpass', 'bandpass',
    'lowshelf', 'highshelf', 'peaking', 'notch'
  ];

  /** REQUIRED: plug-in constructor **/
  function SP1(preset) {

    // REQUIRED: adding necessary modules
    WX.Plugin.defineType(this, 'Generator');

    this.ready = false;
    this.bufferRef = null;
    this.playbackRate = 1.0;

    // patching
    this._filter = WX.Filter();
    this._panner = WX.Panner();
    this._filter.to(this._panner).to(this._output);

    // parameter definition
    WX.defineParams(this, {
      tune: {
        type: 'Generic',
        default: 0,
        min: -48,
        max: 48,
        unit: 'Semitone'
      },
      pitchMod: {
        type: 'Boolean',
        default: true
      },
      velocityMod: {
        type: 'Boolean',
        default: true
      },
      ampAttack: {
        type: 'Generic',
        default: 0.02,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },
      ampDecay: {
        type: 'Generic',
        default: 0.04,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },
      ampSustain: {
        type: 'Generic',
        default: 0.25,
        min: 0.0,
        max: 1.0,
        unit: 'LinearGain'
      },
      ampRelease: {
        type: 'Generic',
        default: 0.2,
        min: 0.0,
        max: 10.0,
        unit: 'Seconds'
      },
      filterType: {
        type: 'Items',
        default: 'lowpass',
        items: filterTypes,
        label: 'Filter Type'
      },
      filterFrequency: {
        type: 'Generic',
        default: 1000,
        min: 20,
        max: 5000,
        unit: 'Hertz'
      },
      filterQ: {
        type: 'Generic',
        default: 0.0,
        min: 0.0,
        max: 40.0
      },
      filterGain: {
        type: 'Generic',
        default: 0.0,
        min: -40.0,
        max: 40.0,
        unit: 'LinearGain'
      },
      filterModAmount: {
        type: 'Generic',
        default: 1.0,
        min: 0.25,
        max: 8.0
      },
      filterDetune: {
        type: 'Generic',
        default: 0.0,
        min: 0.0,
        max: 5.0,
        unit: 'Octave'
      },
      filterAttack: {
        type: 'Generic',
        default: 0.02,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },
      filterHold: {
        type: 'Generic',
        default: 0.04,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },
      filterRelease: {
        type: 'Generic',
        default: 0.2,
        min: 0.0,
        max: 10.0,
        unit: 'Seconds'
      },
      pan: {
        type: 'Generic',
        default: 0.5,
        min: 0.0,
        max: 1.0,
      }
    });

    // REQUIRED: initializing instance with preset
    WX.Plugin.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  SP1.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'SP1',
      api_version: '1.0.0-alpha',
      plugin_version: '0.0.1',
      author: 'hoch',
      type: 'instrument',
      description: 'monotonic one-shot sampler (1 sample)'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      tune: 0,
      pitchMod: true,
      velocityMod: true,
      ampAttack: 0.01,
      ampHold: 0.44,
      ampRelease: 0.06,
      filterFrequency: 140,
      filterQ: 18.0,
      filterGain: 0.0,
      filterModAmount: 7,
      filterDetune: 0.0,
      filterAttack: 0.01,
      filterHold: 0.07,
      filterRelease: 0.03,
      output: 0.8
    },

    // REQUIRED: if you have a parameter,
    //           corresponding handler is required.
    $filterFrequency: function (value, time, rampType) {
      this._filter.frequency.set(value, time, rampType);
    },

    $filterQ: function (value, time, rampType) {
      this._filter.Q.set(value, time, rampType);
    },

    $filterGain: function (value, time, rampType) {
      this._filter.gain.set(value, time, rampType);
    },

    $filterDetune: function (value, time, rampType) {
      this._filter.detune.set(value, time, rampType);
    },

    play: function (pitch, velocity, time) {
      if (!this.ready) return;
      time = (time || WX.now);

      var _buffer = WX.Source(),
          _env = WX.Gain();
      _buffer.to(_env).to(this._filter);
      _buffer.buffer = this.bufferRef;
      _buffer.playbackRate = Math.pow(2, (this.params.tune.get() + pitch) / 1200);

      var p = this.params,
          aAtt = p.ampAttack.get(),
          aHld = p.ampHold.get(),
          aRls = p.ampRelease.get(),
          fAmt = p.filterModAmount.get() * 1200,
          fAtt = p.filterAttack.get(),
          fHld = p.filterHold.get(),
          fRls = p.filterRelease.get();

      _buffer.start(time);

      _env.gain.set(1.0, [time, aAtt], 3);
      this.$filterDetune(fAmt, [time, fAtt], 3);

      _env.gain.set(1.0, [t + aAtt, dHld], 3);
      _env.gain.set(0.0, [t + aAtt, dDec], 3);

      this.$filterDetune(fAmt * p.filterSustain.get(), [t + fAtt, fHld], 3);
      this.$filterDetune(0.0, [t + fAtt + fHld, fRls], 3);

    },

    noteOff: function () {
      var t = WX.now;
      this._amp.gain.cancel(t);
      this._lowpass.frequency.cancel(t);
      this.$amp(0.0, [t, this.params.ampRelease.get()], 3);
      this.$filterDetune(0.0, [t, this.params.filterRelease.get()], 3);
    },

    // realtime event handler from router
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
  WX.Plugin.extendPrototype(SP1, 'Generator');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.Plugin.register(SP1);

})(WX);