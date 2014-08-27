/**
 * @wapl SP1
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */
(function (WX) {

  'use strict';

  // constant filter types

  // internal abstraction for polyphony impl
  function SP1Voice(sampler) {

    this.parent = sampler;
    this.params = sampler.params;
    this.voiceKey = null;
    this.minDur = null;

    this._src = WX.Source();
    this._srcGain = WX.Gain();
    this._src.to(this._srcGain).to(this.parent._filter);

    this._src.buffer = this.parent.buffer;
    this._src.onended = function () {
      this.parent.voiceEndedCallback(this.voiceKey);
    }.bind(this);

  }

  SP1Voice.prototype = {

    noteOn: function (pitch, velocity, time) {
      var p = this.params,
          basePitch = p.tune.get(),
          att = p.ampAttack.get(),
          dec = p.ampDecay.get(),
          sus = p.ampSustain.get(),
          scale = WX.veltoamp(velocity);
      console.log(att);
      this._src.playbackRate.value = Math.pow(2, (pitch - basePitch) / 12);
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
        // TODO TODO TODO TODO TODO
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
    this.voices = {};
    this.buffer = null;

    // patching
    this._filter = WX.Filter();
    this._panner = WX.Panner();
    this._filter.to(this._panner).to(this._output);

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
        default: 'LP',
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
      },

      filterMod: {
        type: 'Generic',
        name: 'FiltMod',
        default: 1.0,
        min: 0.25,
        max: 8.0
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
        max: 1.0,
        unit: 'LinearGain'
      },

      filterRelease: {
        type: 'Generic',
        name: 'FiltRel',
        default: 0.2,
        min: 0.0,
        max: 10.0,
        unit: 'Seconds'
      },

      pan: {
        type: 'Generic',
        name: 'Pan',
        default: 0.0,
        min: -1.0,
        max: 1.0,
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
      filterFrequency: 2500,
      filterQ: 18.0,
      filterGain: 0.0,
      filterMod: 7,
      filterAttack: 0.01,
      filterDecay: 0.07,
      filterSustain: 0.07,
      filterRelease: 0.03,
      pan: 0.0,
      output: 0.8
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

    $filterDetune: function (value, time, rampType) {
      this._filter.detune.set(value, time, rampType);
    },

    // play: function (pitch, velocity, time) {
    //   if (!this.ready) return;
    //   time = (time || WX.now);
    //   var _buffer = WX.Source(),
    //       _env = WX.Gain();
    //   _buffer.to(_env).to(this._filter);
    //   _buffer.buffer = this.bufferRef;
    //   _buffer.playbackRate = Math.pow(2, (this.params.tune.get() + pitch) / 1200);
    //   var p = this.params,
    //       aAtt = p.ampAttack.get(),
    //       aHld = p.ampHold.get(),
    //       aRls = p.ampRelease.get(),
    //       fAmt = p.filterModAmount.get() * 1200,
    //       fAtt = p.filterAttack.get(),
    //       fHld = p.filterHold.get(),
    //       fRls = p.filterRelease.get();
    //   // start sample
    //   _buffer.start(time);
    //   // attack
    //   _env.gain.set(1.0, [time, aAtt], 3);
    //   this.$filterDetune(fAmt, [time, fAtt], 3);
    //   // hold
    //   _env.gain.set(1.0, [time + aAtt, aHld], 3);
    //   this.$filterDetune(fAmt, [time + fAtt, fHld], 3);
    //   // release
    //   _env.gain.set(0.0, [time + aAtt + aHld, aRls], 3);
    //   this.$filterDetune(0.0, [time + fAtt + fHld, fRls], 3);
    //   // stop sample
    //   _buffer.stop(time + fAtt + fHld + fRls);
    // },

    noteOn: function (pitch, velocity, time) {
      time = (time || WX.now);
      var voice = new SP1Voice(this);
      if (this.voices.hasOwnProperty(pitch)) {
        this.voices[pitch].push(voice);
      } else {
        this.voices[pitch] = [voice];
      }
      voice.noteOn(pitch, velocity, time);
    },

    noteOff: function (pitch, velocity, time) {
      if (this.voices.hasOwnProperty(pitch)) {
        time = (time || WX.now);
        var playing = this.voices[pitch];
        for (var i = 0; i < playing.length; i++) {
          playing[i].noteOff(pitch, velocity, time);
        }
      }
    },

    voiceEndedCallback: function (pitch) {
      if (this.voices.hasOwnProperty(pitch)) {
        delete this.voices[pitch];
      }
    },

    // realtime input data responder
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

    },

    _onloaded: function (clip) {
      this.setClip(clip);
    },

    isReady: function () {
      return this.ready;
    },

    setClip: function (clip) {
      this.clip = clip;
      this.buffer = this.clip.buffer;
      this.ready = true;
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