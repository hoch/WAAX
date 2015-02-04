// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

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
 * @param {...AudioNode} nodes WA nodes.
 * @return {AudioNode} The first target WA node.
 */
AudioNode.prototype.to = function () {
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
AudioNode.prototype.cut = function () {
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
AudioParam.prototype.cancel = AudioParam.prototype.cancelScheduledValues;

/**
 * Manipulates AudioParam dynamically.
 * @memberOf AudioParam
 * @param {Number} value Target parameter value
 * @param {Number|Array} time Automation start time. With rampType 3, this
 *   argument must be an array specifying [start time, time constant].
 * @param {Number} rampType Automation ramp type. 0 = step, 1 = linear,
 *   2 = exponential, 3 = target value [start, time constant].
 * @see  http://www.w3.org/TR/webaudio/#methodsandparams-AudioParam-section
 */
AudioParam.prototype.set = function (value, time, rampType) {
  var now = WX.now;
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

// ECMA Script 5 getter for current time and srate.
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