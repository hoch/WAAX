/**
 * a singleton clock base clocker for WAAX framework
 * @version 1
 * @author hoch (hongchan@ccrma)
 */
WX.Clock = function() {
  this.tick = 1000/60;
  this.last = 0;
  this.running = false;
};

WX.Clock.prototype = {

  constructor: WX.Clock,

  /**
   * starts clock and initiate timed loop
   */
  start: function() {
    this.last = 0;
    this.running = true;
    this.loop();
  },

  /**
   * stops clock
   */
  stop: function() {
    this.running = false;
  },

  /**
   * timed loop
   * @return {int} process ID of current iteration
   */
  loop: function() {
    var self = this;
    var now = WX.context.currentTime;
    var delta = now - this.last;
    var id = -1;

    // do timed processing
    // : adding delta to all the clips running in dispatcher

    if (this.running === true) {
      id = window.setTimeout(function() {
        // console.log(self.last);
        self.loop();
      }, self.tick);
      this.last = now;
    }
    return id;
  }
};

// creating and starting a master clock
WX.Clk = new WX.Clock();
WX.Clk.start();