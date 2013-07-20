function Pad (domId) {
  this._padView = domId;
  this._buffers = [];

  this._tune = 0.0;
  this._sourceGaindB = 0.0;

  this._attack = 0.005;
  this._hold = 0.010;
  this._release = 0.75;

  this._output = WX.context.createGain();

  //this.loadAssets();
}

Pad.prototype = {

  to: function (unit) {
    this._output.connect(unit._inlet);
    return unit;
  },

  loadAssets: function () {
    // quite hacky.. need some elegant solution
    for (var i = 0; i < this._filenames.length; i++) {
      if (i === this._filenames.length - 1) {
        WX._loadBuffers(this._path + this._filenames[i], this._buffers, i, this.onloaded.bind(this));
      } else {
        WX._loadBuffers(this._path + this._filenames[i], this._buffers, i);
      }
    }
  },

  noteOn: function (intensity, moment) {
    var source = WX.context.createBufferSource();
    var env = WX.context.createGain();
    source.connect(env);
    env.connect(this._output);

    source.buffer = this._buffers[this._currentBufferIndex];
    moment = (moment || WX.now);
    var prate = Math.pow(2, this._tune / 1200);
    source.playbackRate.setValueAtTime(prate, moment);

    source.start(moment);
    env.gain.setValueAtTime(0.0, moment);
    env.gain.linearRampToValueAtTime(intensity, moment + this._attack);
    env.gain.setValueAtTime(intensity, moment + this._attack + this._hold);
    env.gain.exponentialRampToValueAtTime(0.0, moment + this._attack + this._hold + this._release);
    source.stop(moment + this._attack + this._hold + this._release);
  },

  setCurrentBuffer: function (index) {
    this._currentBufferIndex = index;
    return this.getCurrentFilename();
  },

  changeBufferByIndexDelta: function (delta) {
    this._currentBufferIndex = WX.clamp(
      this._currentBufferIndex + delta,
      0,
      this._buffers.length - 1
    );
    return this.getCurrentFilename();
  },

  getCurrentFilename: function () {
    return this._filenames[this._currentBufferIndex];
  },

  setTune: function (value) {
    this._tune = value;
  },

  setAttack: function (value) {
    this._attack = value;
  },

  setHold: function (value) {
    this._hold = value;
  },

  setRelease: function (value) {
    this._release = value;
  },

  getParameters: function () {
    return {
      tune: this._tune,
      attack: this._attack,
      hold: this._hold,
      release: this._release
    };
  },

  onloaded: function () {
    this._currentBufferIndex = 0;
    this.getCurrentFilename();
    WX._log.post("DrummerPad loaded. (current: " + this.getCurrentFilename() + ")");
    //filename.textContent = "Loaded.";
  },

  setTargetDiv: function (domId) {
    this._view = domId;
    // add event listeners
    
  }
};


// boot-up
(function () {

  // build bufferPool
  // var pathSD = "../data/wpc/sd/";
  // var filenamesSD = [ 
  //  "sd1.wav", "sd2.wav", "sd3.wav", "sd4.wav", "sd5.wav",
  //  "sd6.wav", "sd7.wav", "sd8.wav", "sd9.wav", "sd10.wav"
  // ];
  // var pathKD = "../data/wpc/kd/";
  // var filenamesKD = [ 
  //  "kd1.wav", "kd2.wav", "kd3.wav", "kd4.wav", "kd5.wav",
  //  "kd6.wav", "kd7.wav", "kd8.wav", "kd9.wav", "kd10.wav"
  // ];

  var _pads = [];
  var selectedPadIndex = -1;

  // create pad divs
  var padContainer = document.getElementById('s-pad');
  for (var i = 0; i < 10; i++) {
    var pad = document.createElement('div');
    pad.className = "pad";
    pad.id = "pad" + i;
    padContainer.appendChild(pad);

    var p = new Pad(pad);
    _pads.push(p);
  }

  function selectPadFromEvent (eventTarget) {
    eventTarget.className += " pad-highlight";
    selectedPadIndex = eventTarget.id.slice(3);
    console.log();
  }

  // add event listerner to s-pad
  padContainer.addEventListener("mousedown", function (event) {
    selectPadFromEvent(event.target);
    event.stopPropagation();
  }, false);

})();