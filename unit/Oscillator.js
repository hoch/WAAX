WX.Oscillator = function(type) {
  this.osc = WX.context.createOscillator();
  this.gain = WX.context.createGainNode();
  this.osc.start(0);
  this.osc.connect(this.gain);

  this.setType(type);
  this.osc.frequency.value = 261.626;
  this.gain.gain.value = 1.0;
};

WX.Oscillator.prototype = {

  constructor: WX.Oscillator,

  to: function(unit) {
    this.gain.connect(unit.node);
    // NOTE: this will mute this permanently
    // this.osc.start(0);
    return unit;
  },
  
  cut: function() {
    // NOTE: this will mute this permanently
    // this.osc.stop(0);
    this.gain.disconnect();
  },

  connect: function(node) {
    // this.osc.start();
    this.gain.connect(node);
  },

  setType: function(type) {
    if (type === undefined) {
      this.osc.type = 0;
      return;
    }
    switch(type) {
      case "SINE":
        this.osc.type = 0;
        break;
      case "SQUARE":
        this.osc.type = 1;
        break;
      case "SAWTOOTH":
        this.osc.type = 2;
        break;
      case "TRIANGLE":
        this.osc.type = 3;
        break;
      default:
        this.osc.type = 0;
        break;
    }
  },

  setFreq: function(freq) {
    this.osc.frequency.value = freq;
    return this;
  },

  setGain: function(freq) {
    this.gain.gain.value = freq;
    return this;
  },

  set: function(json) {
    // parse json and assign to parameter
    // NOTE: this is too slow to parse and validate parameters
    // it is not appropriate for function calls every 20ms.
  }
};