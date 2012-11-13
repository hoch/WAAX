WX.Osc2 = function() {
  this.oscA = new WX.Oscillator("TRIANGLE");
  this.oscB = new WX.Oscillator("SAWTOOTH");
  this.outlet = new WX.Outlet();
  this.oscA.to(this.outlet);
  this.oscB.to(this.outlet);

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

  to: function(block) {
    this.outlet.to(block.inlet);
    return block;
  },

  cut: function() {
    this.outlet.cut();
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