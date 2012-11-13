/**
 * WAAX abstraction of linear ADSR envelope
 * @param {float} attack  attack time in ms
 * @param {float} decay   decay time in ms
 * @param {float} sustain sustain time in ms
 * @param {float} release release time in ms
 */
WX.ADSR = function(attack, decay, sustain, release) {
  // this unit has inlet only
  this.inlet = WX.context.createGainNode();
  // TODO: validate the parameters and map them
  this.setADSR(attack, decay, sustain, release);
  this.inlet.gain.value = 0.0;
  this.running = false;
};

WX.ADSR.prototype = {

  constructor: WX.ADSR,

  /**
   * connection to other unit
   * @param  {unit} unit destination unit
   * @return {unit} reference to destination for method chaining
   */
  to: function(unit) {
    this.inlet.connect(unit.inlet);
    return unit;
  },
  
  /**
   * cutting connection from its destination
   */
  cut: function() {
    this.inlet.disconnect();
  },

  /**
   * connection to Web Audio API node
   * @param  {Audionode} node Web Audio API node
   */
  toNode: function(node) {
    this.inlet.connect(node);
  },

  /**
   * set attack
   * @param {float} attack attack time
   */
  setAttack: function(attack) {
    this.att = attack / 1000.0;
  },

  /**
   * set decay
   * @param {float} decay decay time
   */
  setDecay: function(decay) {
    this.dec = decay / 1000.0;
  },

  /**
   * set sustain
   * @param {float} sustain sustain gain
   */
  setSustain: function(sustain) {
    this.sus = sustain;
  },

  /**
   * set release
   * @param {float} release release time
   */
  setRelease: function(release) {
    this.rel = release / 1000.0;
  },

  /**
   * set envelope time
   * @param {float} attack  attack time in ms
   * @param {float} decay   decay time in ms
   * @param {float} sustain sustain time in ms
   * @param {float} release release time in ms
   */
  setADSR: function(attack, decay, sustain, release) {
    this.att = attack / 1000.0;
    this.dec = decay / 1000.0;
    this.sus = sustain;
    this.rel = release / 1000.0;
  },

  /**
   * start ADSR envelope
   */
  start: function() {
    if (this.running === true) {
      return;
    }
    var now = WX.context.currentTime;
    // schedule event for attack, decay and sustain
    this.inlet.gain.linearRampToValueAtTime(0.0, now);
    this.inlet.gain.linearRampToValueAtTime(1.0, now + this.att);
    this.inlet.gain.linearRampToValueAtTime(this.sus, now + this.att + this.dec);
    this.running = true;
  },

  /**
   * release ADSR envelope from sustain phase
   */
  release: function() {
    if (this.running === false) {
      return;
    }
    var now = WX.context.currentTime;
    // cancel progress and force it into release phase
    this.inlet.gain.cancelScheduledValues(now);
    this.inlet.gain.setValueAtTime(this.inlet.gain.value, now);
    this.inlet.gain.linearRampToValueAtTime(0.0, now + this.rel);
    this.running = false;
  }
};