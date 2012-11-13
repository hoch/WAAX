/**
 * WAAX abstraction of Gain node, simulates fader
 * @version 1
 * @author hoch (hongchan@ccrma)
 */
WX.Fader = function() {
  // this unit only has one inlet
  this.inlet = WX.context.createGainNode();
  this.tempGain = 1.0;
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
   * set gain of this fader
   * @param {float} gain gain of fader
   */
  setGain: function(gain) {
    this.tempGain = gain;
    if (this.muted === false) {
      this.inlet.gain.value = gain;
    }
  },

  /**
   * set loudness in dB of this fader
   * @param {float} db loudness in decibels
   */
  setDB: function(db) {
    var rms = WX.db2rms(db);
    this.tempGain = rms;
    if (this.muted === false) {
      this.inlet.gain.value = rms;
    }
  },

  mute: function() {
    this.muted = true;
    this.inlet.gain.value = 0.0;
  },

  unmute: function() {
    this.muted = false;
    this.inlet.gain.value = this.tempGain;
  }
};

// creating a master fader
WX.Out = new WX.Fader();
WX.Out.toNode(WX.context.destination);