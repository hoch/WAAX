/**
 * @class Tempo
 * @param {float} bpm beat per minutes
 */
Tempo = function(bpm) {
  // bpm
  this.bpm = bpm;
  // beat in seconds
  this.beatInSec = null;
  // calibrate
  this.calibrate();
};

Tempo.prototype = {
  calibrate: function() {
    this.beatInSec = 60 / this.bpm;
    this["4"] = this.beatInSec * 4;
    this["2"] = this.beatInSec * 2;
    this["1/4"] = this.beatInSec;
    this["1/8"] = this.beatInSec / 2;
    this["1/16"] = this.beatInSec / 4;
    this["1/32"] = this.beatInSec / 8;
  },
  getDuration: function(length) {
    return this[length];
  }
};

// Walker = function() {
//   var stepDur =
// };

// walker
var checkUpDur = stepDur / 2.0 * 1000;
var lookAhead = stepDur * 2.0;
var nextStep = ctx.currentTime + stepDur;
function walk() {
    setTimeout(walk, checkUpDur);
    if (nextStep < ctx.currentTime + lookAhead) {
        var t = (nextStep - ctx.currentTime) * 1000;
        lane1.highlight(F.i, t);
        lane2.highlight(A.i, t);
        lane3.highlight(L.i, t);
        F.step(nextStep);
        A.step(nextStep);
        L.step(nextStep);
        nextStep += stepDur;
    }
}