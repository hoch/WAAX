/**
 * WAAX abstraction of low pass filter
 * @param {float} cutoff cutoff frequency of filter
 * @param {float} Q      quality
 * @version 1
 * @author hoch (hongchan@ccrma)
 */
WX.LPF = function(cutoff, Q) {
  this.inlet = WX.context.createGainNode();
  this.lpf = WX.context.createBiquadFilter();
  this.outlet = WX.context.createGainNode();
  
  this.inlet.connect(this.lpf);
  this.lpf.connect(this.outlet);

  this.lpf.type = 0;
  this.lpf.frequency.value = 1000.0;
  this.lpf.Q.value = 1.0;
  this.outlet.gain.value = 1.0;
};

WX.LPF.prototype = {

  constructor: WX.LPF,

  /**
   * connection to other unit
   * @param  {unit} unit destination unit
   * @return {unit} reference to destination for method chaining
   */
  to: function(unit) {
    this.outlet.connect(unit.inlet);
    return unit;
  },
  
  /**
   * cutting connection from its destination
   */
  cut: function() {
    // NOTE: this will mute this permanently
    // this.osc.stop(0);
    this.outlet.disconnect();
  },

  /**
   * connection to Web Audio API node
   * @param  {Audionode} node Web Audio API node
   */
  toNode: function(node) {
    this.outlet.connect(node);
  },

  /**
   * set cutoff frequency of filter (AudioParam)
   * @param {float} cutoff frequency of filter
   * @return {unit} reference to this unit
   */
  setCutoff: function(cutoff) {
    this.lpf.frequency.value = cutoff;
    return this;
  },

  /**
   * set quality factor of filter
   * @param {float} quality quality of filter
   * @return {unit} reference to this unit
   */
  setQ: function(quality) {
    this.lpf.Q.value = quality;
    return this;
  },

  /**
   * set gain of oscillator (AudioParam)
   * @param {float} gain gain of oscillator
   * @return {unit} reference to this unit
   */
  setGain: function(gain) {
    this.outlet.gain.value = gain;
    return this;
  },

  /**
   * TODO: get frequency response of filter
   */
  getFrequencyResponse: function() {
    // no contents
  },

  /**
   * set parameters with JSON
   * @param {json} json various parameters
   * @description deprecated for slow performance
   */
  set: function(json) {
    // no contents
  }
};