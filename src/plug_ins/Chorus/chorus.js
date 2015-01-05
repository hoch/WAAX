// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

(function (WX) {

  'use strict';

  /**
   * Implements chorus effect by Jon Dattorro.
   * @type {WAPL}
   * @param {Object} preset Parameter preset.
   * @param {Number} preset.rate Chorus rate.
   * @param {Number} preset.depth Chorus depth.
   * @param {Number} preset.intensity Chorus intesity.
   * @param {Number} preset.blend Chorus blend.
   * @param {Number} preset.mix Mix between wet and dry signal.
   */
  function Chorus(preset) {

    WX.PlugIn.defineType(this, 'Processor');

    this._dry = WX.Gain();
    this._wet = WX.Gain();
    var _splitter = WX.Splitter(2);
    var _merger = WX.Merger(2);

    // left stream
    this._LStream = WX.Gain();
    this._LDelayVibrato = WX.Delay();
    this._LDelayFixed = WX.Delay();
    this._LFeedback = WX.Gain();
    this._LFeedforward = WX.Gain();
    this._LBlend = WX.Gain();

    // right stream
    this._RStream = WX.Gain();
    this._RDelayVibrato = WX.Delay();
    this._RDelayFixed = WX.Delay();
    this._RFeedback = WX.Gain();
    this._RFeedforward = WX.Gain();
    this._RBlend = WX.Gain();

    // input
    this._input.to(_splitter, this._dry);

    // left connection
    _splitter.connect(this._LStream, 0, 0);
    this._LStream.to(this._LDelayVibrato);
    this._LStream.to(this._LDelayFixed);
    this._LDelayVibrato.to(this._LFeedforward);
    this._LDelayVibrato.connect(_merger, 0, 0);
    this._LDelayFixed.to(this._LFeedback);
    this._LFeedback.to(this._LStream);
    this._LBlend.connect(_merger, 0, 0);

    // right connection
    _splitter.connect(this._RStream, 1, 0);
    this._RStream.to(this._RDelayVibrato);
    this._RStream.to(this._RDelayFixed);
    this._RDelayVibrato.to(this._RFeedforward);
    this._RDelayVibrato.connect(_merger, 0, 1);
    this._RDelayFixed.to(this._RFeedback);
    this._RFeedback.to(this._RStream);
    this._RBlend.connect(_merger, 0, 1);

    // output
    _merger.to(this._wet);
    this._dry.to(this._output);
    this._wet.to(this._output);

    // LFO modulation
    this._lfo = WX.OSC();
    this._LDepth = WX.Gain();
    this._RDepth = WX.Gain();
    this._lfo.to(this._LDepth, this._RDepth);
    this._LDepth.to(this._LDelayVibrato.delayTime);
    this._RDepth.to(this._RDelayVibrato.delayTime);
    this._lfo.start(0);

    // unexposed initial settings
    this._lfo.type = 'sine';
    this._lfo.frequency.value = 0.15;

    // dtime setting
    this._LDepth.gain.value = 0.013;
    this._RDepth.gain.value = -0.017;
    this._LDelayVibrato.delayTime.value = 0.013;
    this._LDelayFixed.delayTime.value = 0.005;
    this._RDelayVibrato.delayTime.value = 0.017;
    this._RDelayFixed.delayTime.value = 0.007;

    // define parameters
    WX.defineParams(this, {

      rate: {
        type: 'Generic',
        name: 'Rate',
        default: 0.1,
        min: 0.1,
        max: 1.0,
        unit: 'Hertz'
      },

      intensity: {
        type: 'Generic',
        name: 'Intensity',
        default: 0.1,
        min: 0.01,
        max: 1.0
      },

      mix: {
        type: 'Generic',
        name: 'Mix',
        default: 0.6,
        min: 0.0,
        max: 1.0,
      }

    });

    WX.PlugIn.initPreset(this, preset);
  }

  Chorus.prototype = {

    info: {
      name: 'Chorus',
      version: '0.0.1',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Processor',
      description: 'Basic chorus effect'
    },

    defaultPreset: {
      rate: 0.5,
      intensity: 0.0,
      mix: 0.75
    },

    $rate: function (value, time, rampType) {
      value = WX.clamp(value, 0.0, 1.0) * 0.29 + 0.01;
      this._lfo.frequency.set(value, time, rampType);
    },

    $intensity: function (value, time, rampType) {
      value = WX.clamp(value, 0.0, 1.0);
      var blend = 1.0 - (value * 0.2929);
      var feedforward = value * 0.2929 + 0.7071;
      var feedback = value * 0.7071;
      this._LBlend.gain.set(blend, time, rampType);
      this._RBlend.gain.set(blend, time, rampType);
      this._LFeedforward.gain.set(feedforward, time, rampType);
      this._RFeedforward.gain.set(feedforward, time, rampType);
      this._LFeedback.gain.set(feedback, time, rampType);
      this._RFeedback.gain.set(feedback, time, rampType);
    },

    $mix: function (value, time, rampType) {
      this._dry.gain.set(1.0 - value, time, rampType);
      this._dry.gain.set(value, time, rampType);
    }

  };

  WX.PlugIn.extendPrototype(Chorus, 'Processor');
  WX.PlugIn.register(Chorus);

})(WX);