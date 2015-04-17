/**
 * @wapl Impulse
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */
(function (WX) {

  'use strict';

  // pre-generation of impulse data
  // NOTE: static data for all Impulse instances
  var binSize = 2048,
      mag = new Float32Array(binSize),
      phase = new Float32Array(binSize);
  for (var i = 0; i < binSize; ++i) {
    mag[i] = 1.0;
    phase[i] = 0.0;
  }
  var DATA = WX.PeriodicWave(mag, phase);

  /** REQUIRED: plug-in constructor **/
  function Impulse(preset) {

    // REQUIRED: adding necessary modules
    WX.PlugIn.defineType(this, 'Generator');

    this._impulse = WX.OSC();
    this._impulse.to(this._output);
    this._impulse.start(0);

    this._impulse.setPeriodicWave(DATA);

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
    WX.PlugIn.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  Impulse.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'Impulse',
      version: '0.0.1',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Generator',
      description: 'Impulse (train) Generator'
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
  WX.PlugIn.extendPrototype(Impulse, 'Generator');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.PlugIn.register(Impulse);

})(WX);