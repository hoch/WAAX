/**
 * WAAX abstraction of delay (with feedback)
 * @param {float} delayTime delay time in ms
 * @param {float} mix mix between dry and wet
 */
WX.Delay = function(delayTime, mix) {
  this.inlet = WX.context.createGain();
  this.delay = WX.context.createDelay();
  this.feedback = WX.context.createGain();
  this.outlet = WX.context.createGain();
  this.dry = WX.context.createGain();
  this.wet = WX.context.createGain();

  this.inlet.connect(this.delay);
  this.delay.connect(this.feedback);
  this.feedback.connect(this.delay);
  this.inlet.connect(this.dry);
  this.delay.connect(this.wet);
  this.dry.connect(this.outlet);
  this.wet.connect(this.outlet);

  // TODO: mix should be between (0.0~1.0)
  this.mix = mix;

  // TODO: delayTime should be positive
  this.delay.delayTime.value = delayTime / 1000.0;
  this.feedback.gain.value = 0.0;
  this.wet.gain.value = this.mix;
  this.dry.gain.value = 1.0 - this.mix;
};

WX.Delay.prototype = {

  constructor: WX.Delay,

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
   * set delay time
   * @param {float} delayTime delay time in ms
   */
  setDelayTime: function(delayTime) {
    this.delay.delayTime.value = delayTime / 1000.0;
  },

  /**
   * set feedback gain
   * @param {float} gain feedback gain
   */
  setFeedbackGain: function(gain) {
    this.feedback.gain.value = gain;
  },

  /**
   * set mix between wet and dry (wet only when mix = 1.0)
   * @param {float} mix mix between wet and dry
   */
  setMix: function(mix) {
    this.mix = mix;
    this.wet.gain.value = this.mix;
    this.dry.gain.value = 1.0 - this.mix;
  },

  /**
   * set output gain of this unit
   * @param {float} gain output gain
   */
  setGain: function(gain) {
    this.outlet.gain.value = gain;
  }
};