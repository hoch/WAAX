/**
 * @wapl SP1
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */

// TODO
// - filter? mod?
// -

(function (WX) {

  'use strict';

  // internal abstraction for polyphony impl
  function SP1Voice(sampler) {

    this.parent = sampler;
    this.params = sampler.params;
    this.voiceKey = null;
    this.minDur = null;

    this._src = WX.Source();
    this._srcGain = WX.Gain();
    this._src.to(this._srcGain).to(this.parent._filter);
    this._src.loop = true;
    this._src.buffer = this.parent.clip.buffer;
    // this._src.onended = function () {
    //   // DO SOMETHING
    // }.bind(this);

  }

  SP1Voice.prototype = {

    noteOn: function (pitch, velocity, time) {
      var p = this.params,
          basePitch = p.tune.get(),
          att = p.ampAttack.get(),
          dec = p.ampDecay.get(),
          sus = p.ampSustain.get(),
          scale = p.velocityMod.get() ? WX.veltoamp(velocity) : 1.0;
      if (p.pitchMod.get()) {
        this._src.playbackRate.value = Math.pow(2, (pitch - basePitch) / 12);
      }
      this._src.start(time);
      this._srcGain.gain.set(0.0, time, 0);
      this._srcGain.gain.set(scale, time + att, 1);
      this._srcGain.gain.set(sus * scale, [time + att, dec], 3);
      // calculate minimum duration
      // if noteOff comes after minDur, cancel AParam is not needed
      this.minDur = time + att + dec;
    },

    noteOff: function (pitch, velocity, time) {
      if (this.minDur) {
        time = time < WX.now ? WX.now : time;
        var p = this.params,
            rel = p.ampRelease.get();
        this.voiceKey = pitch;
        this._src.stop(this.minDur + rel + 1.0);
        // if noteOff happens before minDur
        // : cancel scheduled ADS envelope and then start releasing
        if (time < this.minDur) {
          this._srcGain.gain.cancel(this.minDur);
          this._srcGain.gain.set(0.0, [this.minDur, rel], 3);
        } else {
          this._srcGain.gain.set(0.0, [time, rel], 3);
        }
      }
    }

  };


  /** REQUIRED: plug-in constructor **/
  function SP1(preset) {

    // REQUIRED: adding necessary modules
    WX.PlugIn.defineType(this, 'Generator');

    this.ready = false;
    this.clip = null;
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

      tune: {
        type: 'Generic',
        name: 'Tune',
        default: 48,
        min: 0,
        max: 127,
        unit: 'Semitone'
      },

      pitchMod: {
        type: 'Boolean',
        name: 'PitchMod',
        default: true
      },

      velocityMod: {
        type: 'Boolean',
        name: 'VeloMod',
        default: true
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
        max: 1.0,
        unit: 'LinearGain'
      },

      ampRelease: {
        type: 'Generic',
        name: 'Rel',
        default: 0.2,
        min: 0.0,
        max: 10.0,
        unit: 'Seconds'
      },

      filterType: {
        type: 'Itemized',
        name: 'FiltType',
        default: 'lowpass',
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
        unit: 'LinearGain'
      }

    });

    // REQUIRED: initializing instance with preset
    WX.PlugIn.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  SP1.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'SP1',
      version: '0.0.1',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Generator',
      description: 'Versatile Single-Zone Sampler'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      tune: 60,
      pitchMod: true,
      velocityMod: true,
      ampAttack: 0.01,
      ampDecay: 0.44,
      ampSustain: 0.06,
      ampRelease: 0.06,
      filterType: 'LP',
      filterFrequency: 5000,
      filterQ: 0.0,
      filterGain: 0.0,
      output: 1.0
    },

    // REQUIRED: if you have a parameter,
    //           corresponding handler is required.
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
      var voice = new SP1Voice(this);
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

    // realtime input data responder (Ktrl responder)
    onData: function (action, data) {
      switch (action) {
        case 'noteon':
          this.noteOn(data.pitch, data.velocity);
          break;
        case 'noteoff':
          this.noteOff(data.pitch, data.velocity);
          break;
      }
    },

    _onprogress: function (event, clip) {
      // TODO
    },

    _onloaded: function (clip) {
      this.setClip(clip);
      WX.Log.info('Clip loaded:', clip.name);
    },

    onReady: null,

    isReady: function () {
      return this.ready;
    },

    setClip: function (clip) {
      this.clip = clip;
      this.ready = true;
      if (this.onReady) {
        this.onReady();
      }
    },

    loadClip: function (clip) {
      WX.loadClip(
        clip,
        this._onloaded.bind(this),
        this._onprogress.bind(this)
      );
    }
  };

  // REQUIRED: extending plug-in prototype with modules
  WX.PlugIn.extendPrototype(SP1, 'Generator');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.PlugIn.register(SP1);

})(WX);