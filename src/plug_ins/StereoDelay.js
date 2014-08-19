/**
 * WAPL: StereoDelay
 * @author hoch
 * @description stereo delay with feedback
 */


(function (WX) {

  'use strict';

  /** REQUIRED: plug-in constructor **/
  function StereoDelay(preset) {

    // REQUIRED: adding necessary modules
    WX.Plugin.defineType(this, 'Processor');

    // patching
    this._lDelay = WX.Delay();
    this._rDelay = WX.Delay();
    this._lFeedback = WX.Gain();
    this._rFeedback = WX.Gain();
    this._lXtalk = WX.Gain();
    this._rXtalk = WX.Gain();
    this._dry = WX.Gain();
    this._wet = WX.Gain();
    var _splitter = WX.Splitter(2);
    var _merger = WX.Merger(2);
    // source distribution
    this._input.to(_splitter);
    this._input.to(this._dry);
    // interconnection: delay, fb, Xtalk
    _splitter.connect(this._lDelay, 0, 0);
    this._nLDelay.to(this._lFeedback);
    this._lFeedback.to(this._lDelay);
    this._lFeedback.to(this._rXtalk);
    this._rXtalk.to(this._rDelay);
    this._lDelay.connect(nMerger, 0, 0);
    nSplitter.connect(this._rDelay, 1, 0);
    this._rDelay.to(this._rFeedback);
    this._rFeedback.to(this._rDelay);
    this._rFeedback.to(this._lXtalk);
    this._lXtalk.to(this._lDelay);
    this._rDelay.connect(nMerger, 0, 1);
    // summing
    nMerger.to(this._wet);
    this._dry.to(this._output);
    this._wet.to(this._output);

    // parameters
    WX.defineParams(this, {
      delayTimeLeft: {
        type: 'Generic',
        unit: 'Seconds',
        default: 0.125,
        min: 0.025,
        max: 5
      },
      delayTimeRight: {
        type: 'Generic',
        unit: 'Seconds',
        default: 0.25,
        min: 0.025,
        max: 5
      },
      feedbackLeft: {
        type: 'Generic',
        unit: '',
        default: 0.25,
        min: 0.0,
        max: 1.0
      },
      feedbackRight: {
        type: 'Generic',
        unit: '',
        default: 0.125,
        min: 0.0,
        max: 1.0
      },
      crosstalk: {
        type: 'Generic',
        unit: '',
        default: 0.1,
        min: 0.0,
        max: 1.0
      },
      mix: {
        type: 'Generic',
        unit: '',
        default: 1.0,
        min: 0.0,
        max: 1.0
      }
    });

    // REQUIRED: initializing instance with preset
    WX.Plugin.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  StereoDelay.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'StereoDelay',
      api_version: '1.0.0-alpha',
      plugin_version: '0.0.1',
      author: 'hoch',
      type: 'effect',
      description: 'stereo delay with feedback'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      delayTimeLeft: 0.125,
      delayTimeRight: 0.250,
      feedbackLeft: 0.250,
      feedbackRight: 0.125,
      crosstalk: 0.1,
      mix: 1.0
    },

    /** handlers **/

    $delayTimeLeft: function (value, time, rampType) {
      this._lDelay.delayTime.set(value, time, rampType);
    },

    $delayTimeRight: function (value, time, rampType) {
      this._rDelay.delayTime.set(value, time, rampType);
    },

    $feedbackLeft: function (value, time, rampType) {
      this._lFeedback.gain.set(value, time, rampType);
    },

    $feedbackRight: function (value, time, rampType) {
      this._rFeedback.gain.set(value, time, rampType);
    },

    $crosstalk: function (value, time, rampType) {
      this._lXtalk.gain.set(value, time, rampType);
      this._rXtalk.gain.set(value, time, rampType);
    },

    $mix: function (value, time, rampType) {
      this._dry.gain.set(1.0 - value, time, rampType);
      this._wet.gain.set(value, time, rampType);
    }

  };

  // REQUIRED: extending plug-in prototype with modules
  WX.Plugin.extendPrototype(StereoDelay, 'Processor');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.Plugin.register(StereoDelay);

})(WX);