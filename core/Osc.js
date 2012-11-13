/**
 * WAAX abstraction of oscillator
 * @param {unit} oscType type of waveform
 * @version 1
 * @author hoch (hongchan@ccrma)
 */
WX.Osc = function(oscType) {
  this.inlet = WX.context.createGainNode();
  this.osc = WX.context.createOscillator();
  this.outlet = WX.context.createGainNode();
  
  this.inlet.connect(this.osc.frequency);
  this.osc.connect(this.outlet);
  this.osc.start(0);

  this.osc.frequency.value = 261.626;
  this.outlet.gain.value = 1.0;
  this.setType(oscType);
};

WX.Osc.prototype = {

  constructor: WX.Osc,

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
   * set frequency of oscillator (AudioParam)
   * @param {float} freq frequency of oscillator
   * @return {unit} reference to this unit
   */
  setFreq: function(freq) {
    this.osc.frequency.value = freq;
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
   * set oscillator type
   * @param {string} type type of oscillator (SIN/SQR/SAW/TRI)
   * @return {unit} reference to this unit
   */
  setType: function(type) {
    if (type === undefined) {
      this.osc.type = 0;
      return this;
    }
    switch(type) {
      case "SINE":
      case "SIN":
        this.osc.type = 0;
        break;
      case "SQUARE":
      case "SQR":
        this.osc.type = 1;
        break;
      case "SAWTOOTH":
      case "SAW":
        this.osc.type = 2;
        break;
      case "TRIANGLE":
      case "TRI":
        this.osc.type = 3;
        break;
      default:
        this.osc.type = 0;
        break;
    }
    return this;
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