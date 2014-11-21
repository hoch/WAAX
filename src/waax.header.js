/**
 * @fileOverview WX Namespace and basic Web Audio API wrapper.
 * @version 1.0.0-alpha2
 * @author Hongchan Choi (hoch)
 * @license MIT
 */

/**
 * @namespace WX
 */
window.WX = {};

(function (WX) {

  'use strict';

  // System info
  var _API_VERSION = '1.0.0-alpha2';

  /**
   * Returns WAAX API version number. (semantic version)
   * @returns {Number} WAAX API version number
   * @see {@link http://semver.org/}
   */
  WX.getVersion = function () {
    return _API_VERSION;
  };


  // Feature detection and monkey patching: AudioContext
  var _audioContextFlagWebKit = window.hasOwnProperty('webkitAudioContext'),
      _audioContextFlagNonPrefixed = window.hasOwnProperty('AudioContext');
  if (!_audioContextFlagWebKit && !_audioContextFlagNonPrefixed) {
    // FATAL: non-supported browser. stop everything and escape.
    // console.log('FATAL: Web Audio API is not supported.');
    throw new Error('FATAL: Web Audio API is not supported.');
  } else {
    if (_audioContextFlagWebKit && !_audioContextFlagNonPrefixed) {
      window.AudioContext = window.webkitAudioContext;
    }
  }

  // WAAX internal audio context
  WX._ctx = new AudioContext();

  // ECMA Script 5 getter for current time and srate
  Object.defineProperties(WX, {

    /**
     * Returns current audio context time. (ECMA Script 5 Getter)
     * @memberOf WX
     * @return {Number} Current audio context time in seconds.
     */
    now: {
      get: function () {
        return WX._ctx.currentTime;
      }
    },

    /**
     * Returns current audio device sample rate. (ECMA Script 5 Getter)
     * @memberOf WX
     * @return {Number} Current sample rate.
     */
    srate: {
      get: function () {
        return WX._ctx.sampleRate;
      },
    }
  });

  /**
   * Injects into window.AudioNode
   * @namespace AudioNode
   */

  /**
   * Connects a WA node to the other WA nodes. Note that this method is
   *   injected to AudioNode.prototype. Supports multiple outgoing
   *   connections. (fanning out) Returns the first WA node to enable method
   *   chaining.
   * @memberOf AudioNode
   * @param {...AudioNode} target WA nodes.
   * @return {AudioNode} The first target WA node.
   */
  window.AudioNode.prototype.to = function () {
    for (var i = 0; i < arguments.length; i++) {
      this.connect(arguments[i]);
    }
    return arguments[0];
  };

  /**
   * Disconnects outgoing connection of a WA node. Note that this method is
   *   injected to AudioNode.prototype.
   * @memberOf AudioNode
   */
  window.AudioNode.prototype.cut = function () {
    this.disconnect();
  };

  /**
   * Injects into window.AudioParam
   * @namespace AudioParam
   */

  /**
   * Equivalent of AudioParam.cancelScheduledValues. Cancels scheduled value
   *   after a given starting time.
   * @memberOf AudioParam
   * @method
   * @see  http://www.w3.org/TR/webaudio/#dfn-cancelScheduledValues
   */
  window.AudioParam.prototype.cancel =
  window.AudioParam.prototype.cancelScheduledValues;

  /**
   * Manipulates AudioParam dynamically.
   * @memberOf AudioParam
   * @param {Number} value Target parameter value
   * @param {Number|Array} time Automation start time. With rampType 3, this
   *   argument must be an array specifying [start time, time constant].
   * @param {Number} rampType Automation ramp type. 0 = step, 1 = linear,
   *   2 = exponential, 3 = target value <code>start, time constant]</code>
   * @see  http://www.w3.org/TR/webaudio/#methodsandparams-AudioParam-section
   */
  window.AudioParam.prototype.set = function (value, time, rampType) {
    var now = WX._ctx.currentTime;
    switch (rampType) {
      case 0:
      case undefined:
        time = (time < now) ? now : time;
        this.setValueAtTime(value, time);
        // TO FIX: when node is not connected, automation will not work
        // this hack handles the error
        if (time <= now && value !== this.value) {
          this.value = value;
        }
        break;
      case 1:
        time = (time < now) ? now : time;
        this.linearRampToValueAtTime(value, time);
        break;
      case 2:
        time = (time < now) ? now : time;
        value = value <= 0.0 ? 0.00001 : value;
        this.exponentialRampToValueAtTime(value, time);
        break;
      case 3:
        time[0] = (time[0] < now) ? now : time[0];
        value = value <= 0.0 ? 0.00001 : value;
        this.setTargetAtTime(value, time[0], time[1]);
        break;
    }
  };

  /**
   * Creates an instance of WA Gain node.
   * @return {AudioNode} WA Gain node.
   * @see  http://www.w3.org/TR/webaudio/#GainNode
   */
  WX.Gain = function() {
    return WX._ctx.createGain();
  };

  /**
   * Creates an instance of WA Oscillator node.
   * @return {AudioNode} WA Oscillator node.
   * @see  http://www.w3.org/TR/webaudio/#OscillatorNode
   */
  WX.OSC = function() {
    return WX._ctx.createOscillator();
  };

  /**
   * Creates an instance of WA Delay node.
   * @return {AudioNode} WA Delay node.
   * @see  http://www.w3.org/TR/webaudio/#DelayNode
   */
  WX.Delay = function() {
    return WX._ctx.createDelay();
  };

  /**
   * Creates an instance of WA BiquadFilter node.
   * @return {AudioNode} WA BiquadFilter node.
   * @see  http://www.w3.org/TR/webaudio/#BiquadFilterNode
   */
  WX.Filter = function() {
    return WX._ctx.createBiquadFilter();
  };

  /**
   * Creates an instance of WA DynamicCompressor node.
   * @return {AudioNode} WA DynamicsCompressor node.
   * @see  http://www.w3.org/TR/webaudio/#DynamicsCompressorNode
   */
  WX.Comp = function() {
    return WX._ctx.createDynamicsCompressor();
  };

  /**
   * Creates an instance of WA Convolver node.
   * @return {AudioNode} WA Convolver node.
   * @see  http://www.w3.org/TR/webaudio/#ConvolverNode
   */
  WX.Convolver = function() {
    return WX._ctx.createConvolver();
  };

  /**
   * Creates an instance of WA WaveShaper node.
   * @return {AudioNode} WA WaveShaper node.
   * @see  http://www.w3.org/TR/webaudio/#WaveShaperNode
   */
  WX.WaveShaper = function() {
    return WX._ctx.createWaveShaper();
  };

  /**
   * Creates an instance of WA BufferSource node.
   * @return {AudioNode} WA BufferSource node.
   * @see  http://www.w3.org/TR/webaudio/#BufferSourceNode
   */
  WX.Source = function() {
    return WX._ctx.createBufferSource();
  };

  /**
   * Creates an instance of WA Analyzer node.
   * @return {AudioNode} WA Analyzer node.
   * @see  http://www.w3.org/TR/webaudio/#AnalyzerNode
   */
  WX.Analyzer = function() {
    return WX._ctx.createAnalyser();
  };

  /**
   * Creates an instance of WA Panner node.
   * @return {AudioNode} WA Panner node.
   * @see  http://www.w3.org/TR/webaudio/#PannerNode
   */
  WX.Panner = function() {
    return WX._ctx.createPanner();
  };

  /**
   * Creates an instance of WA PerodicWave object.
   * @return {AudioNode} WA PeriodicWave object.
   * @see  http://www.w3.org/TR/webaudio/#PeriodicWave
   */
  WX.PeriodicWave = function () {
    return WX._ctx.createPeriodicWave.apply(WX._ctx, arguments);
  };

  /**
   * Creates an instance of WA Splitter node.
   * @return {AudioNode} WA Splitter node.
   * @see  http://www.w3.org/TR/webaudio/#SplitterNode
   */
  WX.Splitter = function () {
    return WX._ctx.createChannelSplitter.apply(WX._ctx, arguments);
  };

  /**
   * Creates an instance of WA Merger node.
   * @return {AudioNode} WA Merger node.
   * @see  http://www.w3.org/TR/webaudio/#MergerNode
   */
  WX.Merger = function () {
    return WX._ctx.createChannelMerger.apply(WX._ctx, arguments);
  };

  /**
   * Creates an instance of WA Buffer object.
   * @return {AudioNode} WA Buffer object.
   * @see  http://www.w3.org/TR/webaudio/#Buffer
   */
  WX.Buffer = function () {
    return WX._ctx.createBuffer.apply(WX._ctx, arguments);
  };

  /**
   * Loads WAAX clip by XHR loading
   * @param  {Object} clip WAAX Clip
   * @param  {callback_loadClip_oncomplete} oncomplete Function called when
   *   completed.
   * @param  {callback_loadClip_onprogress} onprogress <i>Optional.</i>
   *   Callback for progress report.
   * @example
   * // Creates a WAAX clip on the fly.
   * var clip = {
   *   name: 'Cool Sample',
   *   url: 'http://mystaticdata.com/samples/coolsample.wav',
   *   buffer: null
   * };
   * // Loads the clip and assign the buffer to a sampler plug-in.
   * WX.loadClip(clip, function (clip) {
   *   mySampler.setBuffer(clip.buffer);
   * });
   */
  WX.loadClip = function (clip, oncomplete, onprogress) {
    if (!oncomplete) {
      Log.error('Specify `oncomplete` action.');
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', clip.url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onprogress = function (event) {
      if (onprogress) {
        onprogress(event, clip);
      }
    };
    xhr.onload = function (event) {
      try {
        WX._ctx.decodeAudioData(
          xhr.response,
          function (buffer) {
            clip.buffer = buffer;
            oncomplete(clip);
          }
        );
      } catch (error) {
        WX.Log.error(
          'Loading clip failed. (XHR failure)',
          error.message,
          clip.url
        );
      }
    };
    xhr.send();
  };

  /**
   * Callback for clip loading completion. Called by {@link WX.loadClip}.
   * @callback loadClip_oncomplete
   * @param {Object} clip WAAX clip
   * @see {@link WX.loadClip}
   */

  /**
   * Callback for clip loading progress report. called by {@link WX.loadClip}.
   * @callback loadClip_onprogress
   * @param {Object} event XHR progress event object
   * @param {Object} clip WAAX clip
   * @see {@link WX.loadClip}
   * @see {@link https://dvcs.w3.org/hg/progress/raw-file/tip/Overview.html}
   */


  //
  // constants
  //

  WX.WAVEFORMS = [
    { key: 'Sine', value: 'sine' },
    { key: 'Square', value: 'square' },
    { key: 'Sawtooth', value: 'sawtooth' },
    { key: 'Triangle', value: 'triangle' }
  ];

  WX.FILTER_TYPES = [
    { key:'LP' , value: 'lowpass' },
    { key:'HP' , value: 'highpass' },
    { key:'BP' , value: 'bandpass' },
    { key:'LS' , value: 'lowshelf' },
    { key:'HS' , value: 'highshelf' },
    { key:'PK' , value: 'peaking' },
    { key:'BR' , value: 'notch' },
    { key:'AP' , value: 'allpass' }
  ];

})(WX);