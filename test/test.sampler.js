describe("Sampler", function(){
  "use strict";

  var sampler,
    bufferLoader;

  before(function(done){
    // create the sampler
    sampler = WX.Sampler();
    sampler.to(WX.DAC);

    // load test buffer
    bufferLoader = WX.BufferMap({
      "Air_EndingKeys": "/node_modules/test_wavs/Air_EndingKeys.wav"
    }, function () {
      sampler.setBuffer(
        bufferLoader.getBufferByName("Air_EndingKeys")
      );

      done();
    });
    bufferLoader.load();
  });

  describe("oneshot", function () {
    it("should play in 2 seconds and stop in 4 seconds", function () {
      sampler.oneshot(WX.now + 2.0, 4.0);
    });

    it("should have played for 4 seconds", function (done) {
      this.timeout(6500);
      setTimeout(done, 6000);
    });
  });

  describe("manual stop", function() {
    var playDuration = 2.0,
      startDelay = 3.0;
    it("should start playing in " + startDelay + " seconds then stop playing " + playDuration + " seconds later", function () {
      var startTime = WX.now + startDelay;
      sampler.start(startTime);
      sampler.stop(startTime + playDuration);
    });
    it("should have played for " + playDuration + " seconds", function (done) {
      this.timeout((startDelay + playDuration) * 1000 + 500);
      setTimeout(done, (startDelay + playDuration) * 1000);
    });
  });

  describe("reschedule stop", function() {
    var playDuration = 6.0,
      rescheduledPlayDuration = 4.0,
      startDelay = 3.0,
      startTime;
    it("should start playing in " + startDelay + " seconds then stop playing " + playDuration + " seconds later", function () {
      startTime = WX.now + startDelay;
      sampler.start(startTime);
      sampler.stop(startTime + playDuration);
    });
    it("should reschedule stop time to sooner, " + rescheduledPlayDuration + " seconds", function (done) {
      this.timeout(3000);
      setTimeout(function () {
        sampler.stop(startTime + rescheduledPlayDuration);
        done();
      }, 2500);
    });
    it("should have played for " + rescheduledPlayDuration + " seconds", function (done) {
      this.timeout((startDelay + rescheduledPlayDuration) * 1000 + 500);
      setTimeout(done, (startDelay + rescheduledPlayDuration) * 1000);
    });
    
  });

});

