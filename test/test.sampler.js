describe("Sampler", function(){
  "use strict";

  var sampler,
    load_buffer;

  load_buffer = function (url, done_callback) {
    var xhr;

    // request to fetch the audio buffer
    xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    // when the buffer is finished loading
    xhr.onload = function() {
      // create the audio buffer
      WX.context.decodeAudioData(xhr.response, function (buffer) {
        done_callback(buffer);
      }, function (error) {
        throw new Error(
          "Failed to create buffer from response when loading `" +
          url + "'! " + error.message
        );
      });
    };

    // start the request
    xhr.send();
    
  };



  before(function(done){
    // create the sampler
    sampler = WX.Sampler();
    sampler.to(WX.DAC);

    // load test buffer
    load_buffer(
      "/node_modules/test_wavs/Air_EndingKeys.wav",
      function (buffer) {
        sampler.setBuffer(buffer);

        done();
      }
    );
  });

  describe("oneshot", function () {
    it("should play in 2 seconds and stop in 4 seconds", function () {
      sampler.oneshot(WX.now + 2.0, 4.0);
    });

    it("should have played for 4 seconds", function (done) {
      this.timeout(6000);
      sampler.onended = function () {
        done();
      };
    });
  });

  describe("manual stop", function() {
    var playDuration = 2.0,
      startDelay = 3.0;
    it("should start playing in " + startDelay +
       " seconds then stop playing " + playDuration + " seconds later",
    function () {
      var startTime = WX.now + startDelay;
      sampler.start(startTime);
      sampler.stop(startTime + playDuration);
    });
    it(
      "should have played for " + playDuration + " seconds",
      function (done) {
        this.timeout((startDelay + playDuration) * 1000);
        sampler.onended = function () {
          done();
        };
      }
    );
  });

  describe("reschedule stop", function() {
    var playDuration = 6.0,
      rescheduledPlayDuration = 4.0,
      startDelay = 3.0,
      startTime;
    it(
      "should start playing in " + startDelay +
      " seconds then stop playing " + playDuration +
      " seconds later",
      function () {
        startTime = WX.now + startDelay;
        sampler.start(startTime);
        sampler.stop(startTime + playDuration);
      }
    );
    it("should have started playing", function (done) {
      this.timeout(startDelay * 1000 + 250);
      setTimeout(done, (startDelay * 1000));
    });
    it(
      "should reschedule stop time to sooner, " + rescheduledPlayDuration +
      " seconds",
      function (done) {
        this.timeout(1250);
        setTimeout(function () {
          sampler.stop(startTime + rescheduledPlayDuration);
          done();
        }, 1000);
      }
    );
    it(
      "should have played for " + rescheduledPlayDuration + " seconds",
      function (done) {
        this.timeout((startDelay + rescheduledPlayDuration) * 1000 + 1000);
        sampler.onended = function () {
          (startTime + rescheduledPlayDuration).should.be.approximately(WX.now, 0.01);
          done();
        };
      }
    );
  });

});

