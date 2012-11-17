WX.Timebase = function(bpm) {
  this.bpm = bpm || 120;
  this.unitSize = 256;
  this.unitsInSecond = 1.0 / (WX.context.sampleRate / this.unitSize);

  this.elapsed = 0.0;
  this.lastUpdated = 0.0;
  
  this.beats = 0;
  this.ticks = 0;

  this.clips = [];

  this.clock = WX.context.createScriptProcessor(
    this.unitSize, 0, 1
  );
  var me = this;
  this.clock.onaudioprocess = function(event) {
    me.callback(event);
  };
  // to run the clock it needs to be connected
  this.clock.connect(WX.context.destination);

  // dump message
  $('#msg').text("[WX:Timebase] started.");
};

WX.Timebase.prototype = {

  constructor: WX.Timebase,

  add: function(clip) {
    this.clips.push(clip);
  },

  callback: function(e) {
    var now = WX.context.currentTime;
    var delta = now - this.lastUpdated;
    this.elapsed += delta;

    this.ticks = Math.floor(this.elapsed / this.unitsInSecond);
    this.beats = this.ticks / 60;
    this.ticks = this.ticks % 60;

    // update registered clips with delta
    var c = this.clips.length;
    while(c--) {
      this.clips[c].update(delta);
      if (this.clips[c].isFinished() === true) {
        this.clips.splice(c, 1);
      }
    }

    this.lastUpdated = now;
    $('#timer').html(this.beats + "<br />" + this.ticks);
  }
};

// creating and starting a timebase
WX.TB = new WX.Timebase();