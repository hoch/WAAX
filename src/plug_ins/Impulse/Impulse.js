/**
 * @module Impulse
 * @author Hongchan Choi (hoch)
 * @description Impulse (train) generator
 * @version 0.0.1
 */

(function (WX) {

  'use strict';

  // pre-generation of impulse data
  // NOTE: static data for all Impulse instances
  var data = null,
      binSize = 4096,
      mag = new Float32Array(binSize),
      phase = new Float32Array(binSize);
  for (var i = 0; i < binSize; ++i) {
    mag[i] = 1.0;
    phase[i] = 0.0;
  }
  data = WX.PeriodicWave(mag, phase);

  /** REQUIRED: plug-in constructor **/
  function Impulse(preset) {

    // REQUIRED: adding necessary modules
    WX.Plugin.defineType(this, 'Generator');

    this._impulse = WX.OSC();
    this._impulse.to(this._output);
    this._impulse.start(0);

    this._impulse.setPeriodicWave(data);

    WX.defineParams(this, {

      freq: {
        type: 'Generic',
        name: 'Freq',
        default: 1.0,
        min: 0.1,
        max: 60.0,
        unit: 'Hertz'
      }

    });

    // REQUIRED: initializing instance with preset
    WX.Plugin.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  Impulse.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'Impulse',
      api_version: '1.0.0-alpha',
      plugin_version: '0.0.1',
      author: 'hoch',
      type: 'instrument',
      description: 'a simple impulse (train) generator'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      freq: 1.0
    },

    // REQUIRED: if you have a parameter,
    //           corresponding handler is required.
    $freq: function (value, time, rampType) {
      this._impulse.frequency.set(value, time, rampType);
    }

  };

  // REQUIRED: extending plug-in prototype with modules
  WX.Plugin.extendPrototype(Impulse, 'Generator');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.Plugin.register(Impulse);

})(WX);