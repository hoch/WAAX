/**
 * WX.Chrous
 */

// TODO: add control for LFO, rate, depth
WX._unit.chorus = function (options) {
  // pre-building: processor wrapper
  WX._unit.processor.call(this);
  // building phase
  var splitter = WX.context.createChannelSplitter();
  var merger = WX.context.createChannelMerger();
  this._dry = WX.context.createGain();
  this._wet = WX.context.createGain();
  // left stream
  this._sL = WX.context.createGain();
  this._delayVL = WX.context.createDelay();
  this._delayFL = WX.context.createDelay();
  this._fbL = WX.context.createGain();
  this._ffL = WX.context.createGain();
  this._blendL = WX.context.createGain();
  // right stream
  this._sR = WX.context.createGain();
  this._delayVR = WX.context.createDelay();
  this._delayFR = WX.context.createDelay();
  this._fbR = WX.context.createGain();
  this._ffR = WX.context.createGain();
  this._blendR = WX.context.createGain();
  // left connection
  splitter.connect(this._sL, 0, 0);
  this._sL.connect(this._delayFL);
  this._sL.connect(this._delayVL);
  this._delayFL.connect(this._fbL);
  this._fbL.connect(this._sL);
  this._delayVL.connect(this._ffL);
  this._delayVL.connect(merger, 0, 0);
  this._blendL.connect(merger, 0, 0);
  // right connection
  splitter.connect(this._sR, 1, 0);
  this._sR.connect(this._delayFR);
  this._sR.connect(this._delayVR);
  this._delayFR.connect(this._fbR);
  this._fbR.connect(this._sR);
  this._delayVR.connect(this._ffR);
  this._delayVR.connect(merger, 0, 1);
  this._blendR.connect(merger, 0, 1);
  merger.connect(this._wet);
  // delayTime modulation
  this._lfo = WX.context.createOscillator();
  this._lfo.type = "triangle";
  this._depthL = WX.context.createGain();
  this._depthR = WX.context.createGain();
  this._lfo.frequency.value = 0.15;
  this._depthL.gain.value = 0.014;
  this._depthR.gain.value = -0.014;
  this._lfo.start(0);
  this._lfo.connect(this._depthL);
  this._lfo.connect(this._depthR);
  this._depthL.connect(this._delayVL.delayTime);
  this._depthR.connect(this._delayVR.delayTime);
  this._delayVL.delayTime.value = 0.015;
  this._delayFL.delayTime.value = 0.015;
  this._delayVR.delayTime.value = 0.015;
  this._delayFR.delayTime.value = 0.015;
  // mix level control
  this._inputGain.connect(splitter);
  this._inputGain.connect(this._dry);
  this._dry.connect(this._outputGain);
  this._wet.connect(this._outputGain);
  // post-building: parameter binding
  WX._unit.bindAudioParam.call(this, "lfoFreq", this._lfo.frequency);
  WX._unit.bindAudioParam.call(this, "lfoDepthLeft", this._depthL.gain);
  WX._unit.bindAudioParam.call(this, "lfoDepthRight", this._depthR.gain);
  WX._unit.bindAudioParam.call(this, "feedbackLeft", this._fbL.gain);
  WX._unit.bindAudioParam.call(this, "feedbackRight", this._fbR.gain);
  WX._unit.bindAudioParam.call(this, "feedforwardLeft", this._ffL.gain);
  WX._unit.bindAudioParam.call(this, "feedforwardRight", this._ffR.gain);
  WX._unit.bindAudioParam.call(this, "blendLeft", this._blendL.gain);
  WX._unit.bindAudioParam.call(this, "blendRight", this._blendR.gain);
  WX._unit.bindAudioParam.call(this, "dry", this._dry.gain);
  WX._unit.bindAudioParam.call(this, "wet", this._wet.gain);
  // handling initial parameter : post-build
  this._initializeParams(options, this._default);
};

WX._unit.chorus.prototype = {
  // this label will be appended automatically
  label: "pingpong",
  _default: {
    feedback: 0.0,
    feedforward: 0.70701,
    blend: 1.0,
    mix: 0.8
  },
  rate: function (value, moment, type) {
    if (value !== undefined) {
      // value should be normalized 0~1
      return this.lfoFreq((value * 29 + 1)*0.01, moment, type);
    } else {
      return this.lfoFreq();
    }
  },
  depth: function (value, moment, type) {
    if (value !== undefined) {
      // value should be normalized 0~1
      return this
        .lfoDepthLeft(value, moment, type)
        .lfoDepthRight(-value, moment, type);
    } else {
      return [this.lfoDepthLeft(), this.lfoDepthRight()];
    }
  },
  feedback: function (value, moment, type) {
    if (value !== undefined) {
      return this
        .feedbackLeft(-value, moment, type)
        .feedbackRight(-value, moment, type);
    } else {
      return [this.feedbackLeft(), this.feedbackRight()];
    }
  },
  feedforward: function (value, moment, type) {
    if (value !== undefined) {
      return this
        .feedforwardLeft(value, moment, type)
        .feedforwardRight(value, moment, type);
    } else {
      return [this.feedforwardLeft(), this.feedforwardRight()];
    }
  },
  blend: function(value, moment, type) {
    if (value !== undefined) {
      return this
        .blendLeft(value, moment, type)
        .blendRight(value, moment, type);
    } else {
      return [this.blendLeft(), this.blendRight()];
    }
  },
  mix: function (value, moment, type) {
    if (value !== undefined) {
      return this
        .dry(1.0 - value, moment, type)
        .wet(value, moment, type);
    } else {
      return this.wet();
    }
  }
};

WX._unit.extend(WX._unit.chorus.prototype, WX._unit.processor.prototype);