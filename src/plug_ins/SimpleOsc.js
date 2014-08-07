/**
 * WAPL: SimpleOsc
 * @author      hoch (hongchan.choi@gmail.com)
 * @description a simple plug-in with 1 oscillator
 */


(function (WX) {

  'use strict';

  /** REQUIRED: plug-in constructor **/
  function SimpleOsc(preset) {

    // REQUIRED: adding necessary modules
    WX.Plugin.defineType(this, 'Generator');

    this._osc = WX.OSC();
    this._env = WX.Gain();
    this._osc.to(this._env).to(this._output);
    this._osc.start(0);

    WX.defineParams(this, {
      freq: { type: 'Generic', unit: 'Hertz',
        default: WX.mtof(60), min: 20.0, max: 5000.0
      },
      env: { type: 'Generic', unit: 'LinearGain',
        default: 0.0, min: 0.0, max: 1.0
      }
    });

    // REQUIRED: initializing instance with preset
    WX.Plugin.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  SimpleOsc.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'SimpleOsc',
      api_version: '1.0.0-alpha',
      plugin_version: '0.0.1',
      author: 'hoch',
      type: 'instrument',
      description: '1 oscillator synth'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      freq: WX.mtof(60),
      env: 0.0
    },

    // REQUIRED: if you have a parameter,
    //           corresponding handler is required.
    $freq: function (value, time, rampType) {
      this._osc.frequency.set(value, time, rampType);
    },

    $env: function (value, time, rampType) {
      this._env.gain.set(value, time, rampType);
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
    },

    noteOn: function (pitch, velocity) {
      this.$env(velocity / 127, [WX.now, 0.02], 3);
      this.$freq(WX.mtof(pitch), WX.now + 0.01, 1);
    },

    glide: function (pitch) {
      this.$freq(WX.mtof(pitch), WX.now + 0.01, 1);
    },

    noteOff: function () {
      this.$env(0.0, [WX.now, 0.1], 3);
    }
  };

  // REQUIRED: extending plug-in prototype with modules
  WX.Plugin.extendPrototype(SimpleOsc, 'Generator');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.Plugin.register(SimpleOsc);

})(WX);