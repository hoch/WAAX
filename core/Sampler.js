WX.Sampler = function(url) {
  this.buffer = null;
  this.node = null;
  this.outlet = WX.context.createGainNode();

  this.outlet.gain.value = 1.0;
  this.basePitch = 60;

  // TODO: voice management, max voice
  

  if (url !== undefined) {
    this.load(url);
  }
};

WX.Sampler.prototype = {

  constructor: WX.Sampler,

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

  load: function(url) {
    if (url === undefined) {
      console.log("[WX:Sampler] invalid audio file path.");
      return;
    }
    var me = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      try {
        me.buffer = WX.context.createBuffer(xhr.response, true);
      } catch(error) {
        console.log("[WX:Sampler] file loading error: " + url + " (" + error.message + ")");
      }
    };
    xhr.send();
  },

  setBasePitch: function(pitch) {
    this.basePitch = pitch;
  },

  start: function(pitch) {
    this.node = WX.context.createBufferSource();
    this.node.buffer = this.buffer;
    this.node.connect(this.outlet);
    
    // calculate pitch and play the sound
    // (2 ^ (semitones change/12) = rate
    if (pitch !== undefined) {
      var rate = Math.pow(2, (pitch - this.basePitch)/12);
      this.node.playbackRate.setValueAtTime(rate, 0);
      console.log(pitch, rate);
    }

    this.node.start(0);
  },

  stop: function() {
    this.node.stop(0);
  }

};