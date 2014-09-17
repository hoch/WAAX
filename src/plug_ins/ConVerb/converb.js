/**
 * @wapl ConVerb
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */
(function (WX) {

  'use strict';

  /** REQUIRED: plug-in constructor **/
  function ConVerb(preset) {

    // REQUIRED: define plug-in type
    WX.PlugIn.defineType(this, 'Processor');

    // any flags or instance variables
    this.ready = false;
    this.clip = null;

    // node creation and patching
    this._dry = WX.Gain();
    this._wet = WX.Gain();
    this._convolver = WX.Convolver();
    this._input.to(this._dry, this._convolver);
    this._convolver.to(this._wet);
    this._dry.to(this._output);
    this._wet.to(this._output);

    // define parameters
    WX.defineParams(this, {

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
  ConVerb.prototype = {

    // REQUIRED: plug-in info
    info: {
      name: 'ConVerb',
      version: '0.0.1',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Processor',
      description: 'Convolution Reverb'
    },

    // REQUIRED: plug-in default preset
    defaultPreset: {
      mix: 0.2
    },

    /** handlers **/
    $mix: function (value, time, rampType) {
      this._dry.gain.set(1.0 - value, time, rampType);
      this._wet.gain.set(value, time, rampType);
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
      this._convolver.buffer = this.clip.buffer;
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
  WX.PlugIn.extendPrototype(ConVerb, 'Processor');

  // REQUIRED: registering plug-in into WX ecosystem
  WX.PlugIn.register(ConVerb);

})(WX);