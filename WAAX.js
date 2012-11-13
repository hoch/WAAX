/**
  @namespace WX
  @description project namespace
*/
var WX = WX || { REVISION:1 };

// basic variables, constants, functions
WX.context = new webkitAudioContext();
WX.SAMPLE_RATE = WX.context.sampleRate;
WX.BUFFER_SIZE = 512;

WX.PI = Math.PI;
WX.TWOPI = Math.PI * 2.0;
WX.EPS = Number.MIN_VALUE;

// midi2freq: midi to frequency
WX.midi2freq = function(midipitch) {
  return 440.0 * Math.pow(2, ((Math.floor(midipitch) - 69) / 12));
};

// freq2midi: frequency to midi
WX.freq2midi = function(freq) {
  return Math.floor(69 + 12 * Math.log(freq / 440.0) / Math.log(2));
};

// random2f: random number generator (float)
WX.random2f = function(min, max) {
  return min + Math.random() * (max - min);
};

// randdom2: random number generator (integer)
WX.random2 = function(min, max) {
  return Math.round(min + Math.random() * (max - min));
};


/**
  @class Fader
  @description a wrapper class for gainNode
*/

WX.Fader = function() {
  this.node = WX.context.createGainNode();
  this.tempGain = 1.0;
  this.status = true; // unmuted

  this.to = function(unit) {
    // TODO: type checking
    this.node.connect(unit.node);
    // method chaining
    return unit;
  };

  this.connect = function(node) {
    // TODO: type checking
    this.node.connect(node);
  };

  this.set = function(json) {
    var obj = JSON.parse(json);
    if (typeof json.gain === "number") {
      this.node.gain.value = json.gain;
    }
  };

  this.setGain = function(gain) {
    this.tempGain = gain;
    if (this.status === true ) {
      this.node.gain.value = gain;
    }
  };

  this.mute = function() {
    this.status = false;
    this.node.gain.value = 0.0;
  };

  this.unmute = function() {
    this.status = true;
    this.node.gain.value = this.tempGain;
  };

  // setDB
  // mute
  // solo??
};


/**
  @class Clock <Unit>
  @description a master clock, singlton, manages timebase
*/
WX.Clock = function() {
  this.tick = 1000/60;
  this.last = 0;
  this.status = false;
  
  this.start = function() {
    this.last = 0;
    this.status = true;
    this.loop();
  };

  this.stop = function() {
    this.status = false;
  };

  this.loop = function() {
    var self = this;
    var now = WX.context.currentTime;
    var delta = now - this.last;
    var id = -1;

    // maybe I can use onaudioprocess on ScriptProcessNode
    // to get more precise timing
    // ? : how can compare the timing? (setTimeout vs onaudioproces)

    if (this.status) {
      id = window.setTimeout(function() {
        // console.log(self.last);
        self.loop();
      }, self.tick);
      this.last = now;
    }
    return id;
  };
};

// creating a master fader
WX.MasterFader = new WX.Fader();
WX.MasterFader.connect(WX.context.destination);

// creating and starting a master clock
WX.MasterClock = new WX.Clock();
WX.MasterClock.start();