WX.Osc2 = function() {
  this.oscA = new WX.Oscillator("TRIANGLE");
  this.oscB = new WX.Oscillator("SAWTOOTH");

  // octave: 8, 16, 32
  // detune
  this.rangeA = 1;
  this.rangeB = 2;
  this.lastPitch = 36;
  this.setPitch(36);
  this.oscA.setGain(0.8);
  this.oscB.setGain(0.2);
};

WX.Osc2.prototype = {

  constructor: WX.Osc2,

  to: function(unit) {
    this.oscA.to(unit);
    this.oscB.to(unit);
    return unit;
  },

  cut: function() {
    this.oscA.cut();
    this.oscB.cut();
  },

  setGainA: function(gain) {
    this.oscA.setGain(gain);
  },

  setGainB: function(gain) {
    this.oscB.setGain(gain);
  },

  setRangeA: function(range) {
    this.rangeA = range;
    this.oscA.setFreq(WX.midi2freq(this.lastPitch) * this.rangeA);
  },

  setRangeB: function(range) {
    this.rangeB = range;
    this.oscB.setFreq(WX.midi2freq(this.lastPitch) * this.rangeB);
  },

  setPitch: function(pitch) {
    this.lastPitch = pitch;
    this.oscA.setFreq(WX.midi2freq(this.lastPitch) * this.rangeA);
    this.oscB.setFreq(WX.midi2freq(this.lastPitch) * this.rangeB);
  }

  // glide?
  // continuous pitch movement?
  // no polyphonic

};
