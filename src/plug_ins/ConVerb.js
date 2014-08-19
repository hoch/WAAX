/**
 * WAPL: ConVerb
 * @author hoch
 * @description a convolution reverb effect
 */


/**
 * TODO
 * - add low/high shelving eq
 */


(function (WX) {

  'use strict';

  /** REQUIRED: plug-in constructor **/
  function ConVerb(preset) {

    // REQUIRED: adding necessary modules
    WX.Plugin.defineType(this, 'Processor');

    // patching
    this._dry = WX.nGain();
    this._wet = WX.nGain();
    this._convolver = WX.Convolver();
    this._input.to(this._dry, this._convolver);
    this._convolver.to(this._wet);
    this._dry.connect(this._output);
    this._wet.connect(this._output);

    // parameters
    WX.defineParams(this, {
      mix: {
        type: 'Generic',
        unit: '',
        default: 0.2,
        min: 0.0,
        max: 1.0
      }
    });

    // REQUIRED: initializing instance with preset
    WX.Plugin.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  ConVerb.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'ConVerb',
      api_version: '1.0.0-alpha',
      plugin_version: '0.0.1',
      author: 'hoch',
      type: 'effect',
      description: 'a convolution reverb effect'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      mix: 0.2
    },

    /** handlers **/
    $mix: function (value, time, rampType) {
      this._dry.gain.set(1.0 - value, time, rampType);
      this._wet.gain.set(value, time, rampType);
    }

  };

  // REQUIRED: extending plug-in prototype with modules
  WX.Plugin.extendPrototype(ConVerb, 'Processor');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.Plugin.register(ConVerb);

})(WX);