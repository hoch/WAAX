/**
 * WAAX Plug-in Boilerplate (0.0.1)
 *
 * @author        hoch (hongchan.choi@gmail.com)
 * @requires      WX namespace (waax.js)
 */

// 1 osc, sawtooth
// 1 biquad + envelope
// noteOn method (dynamic lifetime)

(function (WX) {

  'use strict';

  /** REQUIRED: plug-in constructor **/
  function TestPlugin(preset) {
    // REQUIRED: adding necessary modules
    WX.Plugin.addModule(this, ['input', 'output']);

    // Do your stuff here: such as creating a Param wrapper..
    this.params.mute = new WX.Param({
      type: 'bool', default: false, min: 0.0, max: 1.0,
      target: this._output.gain
    });
    // or connecting nodes.
    this._input.connect(this._output);

    // REQUIRED: initializing instance with preset
    WX.Plugin.initializePreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  TestPlugin.prototype = {
    // REQUIRED: plug-in info
    info: {
      name: 'TestPlugin',
      api_version: '0.0.1-alpha',
      plugin_version: '0.0.1',
      author: 'hoch',
      type: 'effect',
      description: 'a simple test plugin'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      mute: false
    },

    // REQUIRED: if you have a parameter,
    //           corresponding handler is required.
    $mute: function (val, time, xType) {
      this.params.mute.set(val);
    }
  };

  // REQUIRED: extending plug-in prototype with modules
  WX.Plugin.addPrototype(TestPlugin, ['input', 'output']);

  // REQUIRED: registering plug-in into WX ecosystem
  WX.Plugin.register(TestPlugin);

})(WX);