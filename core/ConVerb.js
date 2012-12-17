/**
 * WAAX abstraction of convolution reverberation
 * @param {string} url url of IR file
 */
WX.ConVerb = function(url) {

  this.id = "ConVerb";

  this.inlet = WX.context.createGainNode();
  this.convolver = WX.context.createConvolver();
  this.dry = WX.context.createGainNode();
  this.wet = WX.context.createGainNode();
  this.outlet = WX.context.createGainNode();

  this.inlet.connect(this.dry);
  this.inlet.connect(this.convolver);
  this.convolver.connect(this.wet);
  this.dry.connect(this.outlet);
  this.wet.connect(this.outlet);

  this.mix = 0.2;

  this.wet.gain.val = this.mix;
  this.dry.gain.val = 1.0 - this.mix;

  if (url !== undefined) {
    this.loadIR(url);
  } else {
    WX.error(this.id, "invalid url");
  }
};

WX.ConVerb.prototype = {

  constructor: WX.ConVerb,

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
   * load ir file from url
   * @param  {string} url url of IR file
   */
  loadIR: function(url) {
    if (url === undefined) {
      console.log("[WX:ConVerb] invalid IR file path.");
      return;
    }
    var me = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      try {
        me.convolver.buffer = WX.context.createBuffer(xhr.response, false);
      } catch(error) {
        WX.error(me.id, "error: invalid url, " + url + " (" + error.message + ")");
      }
    };
    xhr.send();
  },

  /**
   * set mix between wet and dry (wet only when mix = 1.0)
   * @param {float} mix mix between wet and dry
   */
  setMix: function(mix) {
    this.mix = mix;
    this.wet.gain.value = this.mix;
    this.dry.gain.value = 1.0 - this.mix;
  }
};