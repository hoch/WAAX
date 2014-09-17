/**
 * @wapl CMP1
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */
(function (WX) {

  'use strict';

  /** REQUIRED: plug-in constructor **/
  function CMP1(preset) {

    // REQUIRED: define plug-in type
    WX.PlugIn.defineType(this, 'Processor');

    // node creation and patching
    this._comp = WX.Comp();
    this._makeup = WX.Gain();
    this._input.to(this._comp).to(this._makeup).to(this._output);

    // define parameters
    WX.defineParams(this, {

      threshold: {
        type: 'Generic',
        name: 'Threshold',
        default: -8.0,
        min: -60.0,
        max: 0.0,
        unit: 'Decibels'
      },

      knee: {
        type: 'Generic',
        name: 'Knee',
        default: 20,
        min: 0,
        max: 40,
        unit: 'Decibels'
      },

      ratio: {
        type: 'Generic',
        name: 'Ratio',
        default: 4,
        min: 1,
        max: 20
      },

      attack: {
        type: 'Generic',
        name: 'Attack',
        default: 0.025,
        min: 0,
        max: 1,
        unit: 'Seconds'
      },

      release: {
        type: 'Generic',
        name: 'Release',
        default: 0.25,
        min: 0.0,
        max: 1.0,
        unit: 'Seconds'
      },

      makeup: {
        type: 'Generic',
        name: 'Makeup',
        default: 0.0,
        min: 0.0,
        max: 24.0,
        unit: 'Decibels'
      }

    });

    // REQUIRED: initializing instance with preset
    WX.PlugIn.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  CMP1.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'CMP1',
      version: '0.0.1',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Processor',
      description: 'Basic compressor'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      threshold: -8,
      knee: 20,
      ratio: 4,
      attack: 0.025,
      release: 0.25,
      makeup: 0,
    },

    $threshold: function (value, time, rampType) {
      this._comp.threshold.set(value, time, rampType);
    },

    $knee: function (value, time, rampType) {
      this._comp.knee.set(value, time, rampType);
    },

    $ratio: function (value, time, rampType) {
      this._comp.ratio.set(value, time, rampType);
    },

    $attack: function (value, time, rampType) {
      this._comp.attack.set(value, time, rampType);
    },

    $release: function (value, time, rampType) {
      this._comp.release.set(value, time, rampType);
    },

    $makeup: function (value, time, rampType) {
      this._makeup.gain.set(WX.dbtolin(value), time, rampType);
    }

  };

  // REQUIRED: extending plug-in prototype with modules
  WX.PlugIn.extendPrototype(CMP1, 'Processor');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.PlugIn.register(CMP1);

})(WX);