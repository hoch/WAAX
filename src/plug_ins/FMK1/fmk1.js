/**
 * @wapl FMK1
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */

(function (WX) {

  'use strict';

  /**
   * FMOperator class.
   * @param {[type]} outputNode [description]
   */
  function FMVoice(synth) {
    this.parent = synth;
    this.params = synth.params;
    this.voiceKey = null;
    this._minDur = null;

    this._mod = WX.OSC();
    this._modGain = WX.Gain();
    this._car = WX.OSC();
    this._carGain = WX.Gain();
    this._mod.to(this._modGain);
    this._modGain.connect(this._car.frequency);
    this._car.to(this._carGain).to(this.parent._filter);

    this._mod2 = WX.OSC();
    this._modGain2 = WX.Gain();
    this._car2 = WX.OSC();
    this._carGain2 = WX.Gain();
    this._mod2.to(this._modGain2);
    this._modGain2.connect(this._car2.frequency);
    this._car2.to(this._carGain2).to(this.parent._filter);
  }

  FMVoice.prototype = {

    noteOn: function (pitch, velocity, time) {
      var p = this.params,
          freq = WX.mtof(pitch),
          hr = p.harmonicRatio.get(),
          mi = p.modulationIndex.get(),
          att = p.attack.get(),
          dec = p.decay.get(),
          sus = p.sustain.get(),
          bal = p.balance.get(),
          scale = WX.veltoamp(velocity);
      // 1: start generation
      this._mod.start(time);
      this._car.start(time);
      // set fm parameters: freq, hr, mi-attack, mi-decay
      this._car.frequency.set(freq, time, 0);
      this._mod.frequency.set(freq * hr, time, 0);
      this._modGain.gain.set(freq * hr * mi, time, 0);
      this._modGain.gain.set(0.1, time + 1.5, 2);
      // envelope: ads
      this._carGain.gain.set(0.0, time, 0);
      this._carGain.gain.set(scale * bal, time + att, 1);
      this._carGain.gain.set(sus * scale * bal, [time + att, dec], 3);
      // 2: start generation
      this._mod2.start(time);
      this._car2.start(time);
      // set fm parameters: freq, hr, mi-attack, mi-decay
      this._car2.frequency.set(freq * 2, time, 0);
      this._mod2.frequency.set(freq * hr, time, 0);
      this._modGain2.gain.set(freq * hr * mi * 0.5, time, 0);
      this._modGain2.gain.set(0.5, time + 1.5, 2);
      // envelope: ads
      this._carGain2.gain.set(0.0, time, 0);
      this._carGain2.gain.set(scale * (1 - bal), time + att, 1);
      this._carGain2.gain.set(sus * scale * (1 - bal), [time + att, dec], 3);
      // get minDur
      this.minDur = time + att + dec;
    },

    noteOff: function (pitch, velocity, time) {
      if (this.minDur) {
        time = time < WX.now ? WX.now : time;
        var p = this.params,
            rel = p.release.get();
        this.voiceKey = pitch;
        this._mod.stop(this.minDur + rel + 2.0);
        this._car.stop(this.minDur + rel + 2.0);
        this._mod2.stop(this.minDur + rel + 2.0);
        this._car2.stop(this.minDur + rel + 2.0);
        if (time < this.minDur) {
          this._carGain.gain.cancel(this.minDur);
          this._carGain.gain.set(0.0, [this.minDur, rel], 3);
          this._carGain2.gain.cancel(this.minDur);
          this._carGain2.gain.set(0.0, [this.minDur, rel], 3);
        } else {
          this._carGain.gain.set(0.0, [time, rel], 3);
          this._carGain2.gain.set(0.0, [time, rel], 3);
        }
      }
    }

  };

  // REQUIRED: plug-in constructor
  function FMK1(preset) {

    // REQUIRED: adding necessary modules
    WX.PlugIn.defineType(this, 'Generator');

    this.numVoice = 0;
    // naive voice management
    this.voices = [];
    for (var i = 0; i < 128; i++) {
      this.voices[i] = [];
    }

    // patching
    this._filter = WX.Filter();
    this._filter.to(this._output);

    // parameter definition
    WX.defineParams(this, {

      harmonicRatio: {
        type: 'Generic',
        name: 'HRatio',
        default: 4,
        min: 1,
        max: 60
      },

      modulationIndex: {
        type: 'Generic',
        name: 'ModIdx',
        default: 1,
        min: 0.0,
        max: 2.0
      },

      attack: {
        type: 'Generic',
        name: 'Att',
        default: 0.005,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },

      decay: {
        type: 'Generic',
        name: 'Dec',
        default: 0.04,
        min: 0.0,
        max: 5.0,
        unit: 'Seconds'
      },

      sustain: {
        type: 'Generic',
        name: 'Sus',
        default: 0.25,
        min: 0.0,
        max: 1.0
      },

      release: {
        type: 'Generic',
        name: 'Rel',
        default: 0.2,
        min: 0.0,
        max: 10.0,
        unit: 'Seconds'
      },

      balance: {
        type: 'Generic',
        name: 'Balance',
        default: 0.5,
        min: 0.0,
        max: 1.0
      },

      filterType: {
        type: 'Itemized',
        name: 'FiltType',
        default: 'highshelf',
        model: WX.FILTER_TYPES
      },

      filterFrequency: {
        type: 'Generic',
        name: 'FiltFreq',
        default: 2500,
        min: 20,
        max: 20000,
        unit: 'Hertz'
      },

      filterQ: {
        type: 'Generic',
        name: 'FiltQ',
        default: 0.0,
        min: 0.0,
        max: 40.0
      },

      filterGain: {
        type: 'Generic',
        name: 'FiltGain',
        default: 0.0,
        min: -40.0,
        max: 40.0,
        unit: 'Decibels'
      }

    });

    // REQUIRED: initializing instance with preset
    WX.PlugIn.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  FMK1.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'FMK1',
      version: '0.0.1',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Generator',
      description: 'FM Bell-based Keys'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      harmonicRatio: 10,
      modulationIndex: 1.8,
      attack: 0.002,
      decay: 0.03,
      sustain: 0.65,
      release: 0.55,
      balance: 0.7165,
      filterType: 'highshelf',
      filterFrequency: 7000,
      filterQ: 0.0,
      filterGain: -3.0,
      output: 0.3
    },

    // REQUIRED: handlers for each parameter
    $balance: function (value, time, rampType) {

    },

    $filterType: function (value, time, rampType) {
      this._filter.type = value;
    },

    $filterFrequency: function (value, time, rampType) {
      this._filter.frequency.set(value, time, rampType);
    },

    $filterQ: function (value, time, rampType) {
      this._filter.Q.set(value, time, rampType);
    },

    $filterGain: function (value, time, rampType) {
      this._filter.gain.set(value, time, rampType);
    },

    noteOn: function (pitch, velocity, time) {
      time = (time || WX.now);
      var voice = new FMVoice(this);
      this.voices[pitch].push(voice);
      this.numVoice++;
      voice.noteOn(pitch, velocity, time);
    },

    noteOff: function (pitch, velocity, time) {
      time = (time || WX.now);
      var playing = this.voices[pitch];
      for (var i = 0; i < playing.length; i++) {
        playing[i].noteOff(pitch, velocity, time);
        this.numVoice--;
      }
      // TODO: is this performant enough?
      this.voices[pitch] = [];
    },

    onData: function (action, data) {
      switch (action) {
        case 'noteon':
          this.noteOn(data.pitch, data.velocity);
          break;
        case 'noteoff':
          this.noteOff(data.pitch, data.velocity);
          break;
      }
    }

  };

  // REQUIRED: extending plug-in prototype with modules
  WX.PlugIn.extendPrototype(FMK1, 'Generator');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.PlugIn.register(FMK1);

})(WX);