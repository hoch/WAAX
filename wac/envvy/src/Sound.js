Tempo = function(bpm) {
  this.setTempo(bpm);
};

Tempo.prototype = {
  setTempo: function(bpm) {
    this.bpm = bpm;
    this.beatInSeconds = 60 / this.bpm;
    this["4"] = this.beatInSeconds * 4;
    this["2"] = this.beatInSeconds * 2;
    this["1/4"] = this.beatInSeconds;
    this["1/8"] = this.beatInSeconds / 2;
    this["1/16"] = this.beatInSeconds / 4;
    this["1/32"] = this.beatInSeconds / 8;
  }
};

// duration
var stepDur = (new Tempo(120))["1/8"];

// audio graph
var saw = new WX.Oscil({ type: "sawtooth", gain:1.0 });
var nos = new WX.Noise({ gain: 0.0 });
var lpf = new WX.LPF();
var dly = new WX.TwinDelay({
  feedbackLeft: 0.6, feedbackRight: 0.6,
  delayTimeLeft: stepDur, delayTimeRight: stepDur * (1.5),
  mix: 0.1 });
var cmp = new WX.Comp({ threshold:-6, ratio:8, gain:2 });
WX.link(saw, lpf, dly, cmp, WX.DAC);
nos.to(lpf);
lpf.gain = 0.0;
WX.DAC.db = -9;

// onset and playnote
var onset = null;
function playnote(target, offset, val, time) {
  var t = Math.max(0.005, Math.min(0.995, time));
  var tau = -(1.0 - t) * stepDur / Math.log(0.001);
  target.setValueAtTime(offset, onset);
  target.linearRampToValueAtTime(offset + val, onset + t * stepDur);
  target.setTargetAtTime(offset, onset + t * stepDur, tau);
}

// modules
function stepPitch(f, mval, mtime) {
  var v = (f * 2 * mval);
  playnote(saw.mfreq_, f, v, mtime);
}

var filterAmount = 1.0;
function stepCutoff(f, mval, mtime) {
  var v = (f * 4 * mval);
  playnote(lpf.mcutoff_, f * 8, v, mtime);
}

function stepQ(Q, mval, mtime) {
  var v = mval * 24;
  playnote(lpf.mQ_, Q, v, mtime);
}

function stepAmp(mval, mtime) {
  playnote(lpf.mgain_, 0.0, mval, mtime);
}

function stepNoise(mval, mtime) {
  playnote(nos.mgain_, 0.0, mval * 2.0, mtime);
  var tau = -(1.0 - mtime) * stepDur / Math.log(0.01);
  saw.mgain_.setValueAtTime(1.0, onset);
  saw.mgain_.linearRampToValueAtTime(1.0 - mval, onset + mtime * stepDur);
  saw.mgain_.setTargetAtTime(1.0, onset + mtime * stepDur, tau);
}

// stepstep!!
function stepstep(time, obj) {
  onset = time;
  stepPitch(obj.pitch, obj.pitchmval, obj.pitchmtime);
  stepNoise(obj.noisemval, obj.noisemtime);
  stepCutoff(obj.pitch, obj.cutoffmval, obj.cutoffmtime);
  stepQ(obj.Q, obj.Qmval, obj.Qmtime);
  stepAmp(obj.ampmval, obj.ampmtime);
}