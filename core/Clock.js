/**
 * a singleton clock base clocker for WAAX framework
 * @version 1
 * @author hoch (hongchan@ccrma)
 */
WX.Clock = function() {
  this.frameSize = 256;
  this.running = false;
  this.elapsedTime = 0.0;
  this.last = 0.0;
  
  this.clock = WX.context.createScriptProcessor(this.frameSize, 0, 1);
  var me = this;
  this.clock.onaudioprocess = function(e) {
    me.callback(e);
  };
  this.clock.connect(WX.context.destination);
};

WX.Clock.prototype = {

  constructor: WX.Clock,

  /**
   * starts clock and initiate timed loop
   */
  start: function() {
    this.elapsedTime = 0.0;
    this.running = true;
    var me = this;
    this.clock.onaudioprocess = function(e) {
      me.callback(e);
    };
    $('#msg').text("[WX:CLOCK] started.");
  },

  /**
   * stops clock
   */
  stop: function() {
    this.running = false;
    this.clock.onaudioprocess = null;
    $('#msg').text("[WX:CLOCK] stopped.");
    $('#timer').text("");
  },

  /**
   * toggle clock
   */
  toggle: function() {
    if (this.running === true ) {
      this.stop();
    } else {
      this.start();
    }
  },

  /**
   * timed callback, block-accuracy callback
   * @param  {event} e AudioProcessingEvent
   */
  callback: function(e) {
    var now = WX.context.currentTime;
    var delta = now - this.last;
    this.elapsedTime += delta;
    this.last = now;
    $('#timer').html(this.elapsedTime + "<br />" + delta);
  }
};

// creating and starting a master clock
WX.Clk = new WX.Clock();
WX.Clk.start();