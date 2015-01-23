
    /*
    // sound
    F = {
      offset: 110,
      range: 880,
      stepDuration: stepDur,
      i: 0,
      data: tracks[0].getData(),
      target: o.frequency,
      step: function(t) {
        var p = this.data[this.i++][1];
        var time = t + p[0] * this.stepDuration;
        var val = this.offset + p[1] * this.range;
        var tau = -(1.0 - p[0]) * this.stepDuration / Math.log(0.001);
        var f = this.target;
        f.setValueAtTime(this.offset, t);
        f.linearRampToValueAtTime(val, time);
        f.setTargetValueAtTime(this.offset, time, tau);
        this.i %= this.data.length;
      }
    };

    A = {
      offset: 0.0,
      range: 0.8,
      stepDuration: stepDur,
      i: 0,
      data: tracks[2].getData(),
      target: g.gain,
      step: function(t) {
        var p = this.data[this.i++][1];
        var time = t + p[0] * this.stepDuration;
        var val = this.offset + p[1] * this.range;
        var tau = -(1.0 - p[0]) * this.stepDuration / Math.log(0.001);
        var f = this.target;
        f.setValueAtTime(this.offset, t);
        f.linearRampToValueAtTime(val, time);
        f.setTargetValueAtTime(this.offset, time, tau);
        this.i %= this.data.length;
      }
    };

    L = {
      offset: 440,
      range: 2500,
      stepDuration: stepDur,
      i: 0,
      data: tracks[1].getData(),
      target: f.frequency,
      step: function(t) {
        var p = this.data[this.i++][1];
        var time = t + p[0] * this.stepDuration;
        var val = this.offset + p[1] * this.range;
        var tau = -(1.0 - p[0]) * this.stepDuration / Math.log(0.001);
        var f = this.target;
        f.setValueAtTime(this.offset, t);
        f.linearRampToValueAtTime(val, time);
        f.setTargetValueAtTime(this.offset, time, tau);
        this.i %= this.data.length;
      }
    };
    */
   


/*
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <h1>Hello WAAX!</h1>
    <script src="http://hoch.github.com/waax/build/WAAX.min.js"></script>
    <script>
      var saw = new WX.Oscil({ type: "sawtooth", gain:0.7 });
      var nos = new WX.Noise({ gain: 0.3 });
      var lpf = new WX.LPF();
      var dly = new WX.TwinDelay({ feedbackLeft: 0.6, feedbackRight: 0.6, mix: 0.2 });
      
      WX.link(saw, lpf, dly, WX.DAC);
      nos.to(lpf);
      WX.DAC.db = -24;
      
      var stepDur = 0.12;
      var filterAmount = 1.0;

      function stepPitch(f, time, mval, mtime) {
        var v = f + (mval * 4 * f);
        saw.mfreq(f);
        saw.mfreq(v, mtime * stepDur, "line");
        saw.mfreq(f, stepDur, "line");
      }
      
      function stepCutoff(f, mval, mtime) {
        var v = f + f * 8 * (mval * filterAmount);
        lpf.mcutoff(f);
        lpf.mcutoff(v, mtime * stepDur, "line");
        lpf.mcutoff(f, stepDur, "line");
      }
      
      function stepQ(Q, mval, mtime) {
        var v = Q + (mval * 24 * filterAmount);
        lpf.mQ(v);
        lpf.mQ(v, mtime * stepDur, "line");
        lpf.mQ(v, stepDur, "line");
      }
      
      function stepAmp(mval, mtime) {
        lpf.mgain(0.0);
        lpf.mgain(mval, mtime * stepDur, "line");
        lpf.mgain(0.0, stepDur, "line");
      }
      
      function stepBal(mval, mtime) {
        saw.mgain(1.0);
        saw.mgain(1.0 - mval, mtime * stepDur, "line");
        saw.mgain(1.0, stepDur, "line");
        nos.mgain(0.0);
        nos.mgain(mval, mtime * stepDur, "line");
        nos.mgain(0.0, stepDur, "line");
      }
      
      function stepstep(time, obj) {
        WX.at(time, function() {
          stepPitch(obj.pitch, obj.pitchmval, obj.pitchmtime);
          stepBal(obj.balmval, obj.balmtime);
          stepCutoff(obj.pitch, obj.cutoffmval, obj.cutoffmtime);
          stepQ(obj.Q, obj.Qmval, obj.Qmtime);
          stepAmp(obj.ampmval, obj.ampmtime);
        });
      }
      
      var pitches = [0, 2, 4, 6, 7, 9, 10];
      
      function run() {
        var r = Math.floor(Math.random() * pitches.length);
        var o = {
          pitch: WX.pitch2freq(pitches[r] + 60),
          pitchmval: 0.0,
          pitchmtime: 0.5,
          balmval: 0.0,
          balmtime: 0.5,
          cutoffmval: 0.1,
          cutoffmtime: 0.0,
          Q: 1,
          Qmval: 1.0,
          Qmtime: 0.0,
          ampmval: 1.0,
          ampmtime: 0.01
        }
        stepstep(WX.now, o);
        setTimeout(run, stepDur * 1000);
      }
      run();
      
    </script>
  </body>
</html>
 */