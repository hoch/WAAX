/**
 * WAAX oscillator
 * @version 1
 * @author hoch (hongchan@ccrma.stanford.edu)
 */


// NOTES
// - needs phase offset or sync
// - use WX.WaveTab for wavetable synthesis


/**
 * multifunction oscillator
 * @param {object} params parameters in JSON format
 */
WX.Oscil = function(params) {
  // inlet node for FM synthesis
  this.inlet = WX.context.createGainNode();
  this.oscil = WX.context.createOscillator();
  this.outlet = WX.context.createGainNode();

  // parsing & setting parameters
  this.set(params);
  
  // start generation: stop() will disable this node permanently
  this.oscil.start(0);

  // to enable FM Synthesis: node(node)->freq(a-rate)
  this.inlet.connect(this.oscil.frequency);
  this.oscil.connect(this.outlet);
};


WX.Oscil.prototype = {

  constructor: WX.Oscil,

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
   * @param  {AudioNode} node Web Audio API node
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
    this.oscil.frequency.value = freq;
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
      this.oscil.type = 0;
      return this;
    }
    switch(type) {
      case "SINE":
      case "SIN":
        this.oscil.type = 0;
        break;
      case "SQUARE":
      case "SQR":
        this.oscil.type = 1;
        break;
      case "SAWTOOTH":
      case "SAW":
        this.oscil.type = 2;
        break;
      case "TRIANGLE":
      case "TRI":
        this.oscil.type = 3;
        break;
      default:
        this.oscil.type = 0;
        break;
    }
    return this;
  },

  /**
   * set parameters with JSON
   * @param {json} params parameters in JSON format
   */
  set: function(params) {
    if (typeof params === "object") {
      this.oscil.frequency.value = params.frequency || WX.MID_C;
      this.outlet.gain.value = params.gain || 1.0;
      this.setType(params.type || "SIN");
    } else {
      this.oscil.frequency.value = WX.MID_C;
      this.outlet.gain.value = 1.0;
      this.setType("SIN");
    }
  }
};