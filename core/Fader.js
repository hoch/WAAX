/**
 * WAAX abstraction of Gain node, simulates fader
 * @version 1
 * @author hoch (hongchan@ccrma)
 */
WX.Fader = function() {
  // NOTE: by using two gain nodes, pre/post fader
  // structure will be possible.
  this.inlet = WX.context.createGainNode();
  this.outlet = WX.context.createGainNode();
  this.inlet.connect(this.outlet);
  this.muted = false;
};

WX.Fader.prototype = {

  constructor: WX.Fader,

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
   * set gain of this fader
   * @param {float} gain gain of fader
   */
  setGain: function(gain) {
    this.outlet.gain.value = gain;
  },

  /**
   * set loudness in dB of this fader
   * @param {float} db loudness in decibels
   */
  setDB: function(db) {
    this.outlet.gain.value = WX.db2rms(db);
  },

  mute: function() {
    this.muted = true;
    this.inlet.gain.value = 0.0;
  },

  unmute: function() {
    this.muted = false;
    this.inlet.gain.value = 1.0;
  }
};

// creating a master fader
WX.Out = new WX.Fader();
WX.Out.toNode(WX.context.destination);