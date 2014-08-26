/**
 * @wapl StereoDelay
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */
(function (WX) {

  'use strict';

  /** REQUIRED: plug-in constructor **/
  function StereoDelay(preset) {

    // REQUIRED: adding necessary modules
    WX.PlugIn.defineType(this, 'Processor');

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
    this._input.to(_splitter, this._dry);
    // left channel
    _splitter.connect(this._lDelay, 0);
    this._lDelay.to(this._lFeedback);
    this._lFeedback.to(this._lDelay, this._rXtalk);
    this._lXtalk.to(this._lDelay);
    this._lDelay.connect(_merger, 0, 0);
    // right channel
    // NOTE: splitter only uses left channel feed.
    // (to be revisited)
    _splitter.connect(this._rDelay, 0);
    this._rDelay.to(this._rFeedback);
    this._rFeedback.to(this._rDelay, this._lXtalk);
    this._rXtalk.to(this._rDelay);
    this._rDelay.connect(_merger, 0, 1);
    // summing
    _merger.to(this._wet);
    this._dry.to(this._output);
    this._wet.to(this._output);

    // parameters
    WX.defineParams(this, {

      delayTimeLeft: {
        type: 'Generic',
        name: 'L Delay',
        default: 0.125,
        min: 0.025,
        max: 5,
        unit: 'Seconds'
      },

      delayTimeRight: {
        type: 'Generic',
        name: 'R Delay',
        default: 0.25,
        min: 0.025,
        max: 5,
        unit: 'Seconds'
      },

      feedbackLeft: {
        type: 'Generic',
        name: 'L FB',
        default: 0.25,
        min: 0.0,
        max: 1.0
      },

      feedbackRight: {
        type: 'Generic',
        name: 'R FB',
        default: 0.125,
        min: 0.0,
        max: 1.0
      },

      crosstalk: {
        type: 'Generic',
        name: 'Crosstalk',
        default: 0.1,
        min: 0.0,
        max: 1.0
      },

      mix: {
        type: 'Generic',
        name: 'Mix',
        default: 0.2,
        min: 0.0,
        max: 1.0
      }

    });

    // REQUIRED: initializing instance with preset
    WX.PlugIn.initPreset(this, preset);
  }

  /** REQUIRED: plug-in prototype **/
  StereoDelay.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'StereoDelay',
      version: '0.0.3',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Processor',
      description: 'Pingpong Delay with Feedback Control'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      delayTimeLeft: 0.125,
      delayTimeRight: 0.250,
      feedbackLeft: 0.250,
      feedbackRight: 0.125,
      crosstalk: 0.1,
      mix: 0.2
    },

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
  WX.PlugIn.extendPrototype(StereoDelay, 'Processor');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.PlugIn.register(StereoDelay);

})(WX);