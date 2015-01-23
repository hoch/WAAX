/**
 * Envvy: globals 
 */
var gNumSteps = 8;
var gSelected = {
  track: null,
  step: null
};
var gPlayhead = 0;
var gStepSize = {
  w: 82,
  h: 70
};
var gStepPadding = 5;
var gPrevPos = {
  x: 0,
  y: 0
};

Envvy = {
  _isPlaying: true,
  tracks: null,
  clipboard: []
};
Envvy.version = "r2";

Envvy.selectStep = function(step, event) {
  if (gSelected.step) {
    gSelected.step.highlight(false);
    gSelected.track.highlightLabel(false);
  }
  gSelected.step = step;
  gSelected.step.highlight(true);
  gSelected.track = step.parent;
  gSelected.track.highlightLabel(true);
};

Envvy.releaseStep = function() {
  gSelected.step = null;
};

Envvy.randomizeTrack = function() {
  if (gSelected.track) {
    gSelected.track.randomizeData();
  }
};

Envvy.toggleMorphing = function() {
  this._isMorphing = !this._isMorphing;
};

Envvy.duplicateStep = function(dir) {
  if (gSelected.step) {
    var inc_col = 0;
    switch(dir) {
      case "left":
        inc_col = -1;
        break;
      case "right":
        inc_col = 1;
        break;
    }
    // get data from selected step
    var end = gSelected.track.data.length - 1;
    var target_step = (gSelected.step.id + inc_col);
    if (target_step < 0) {
      target_step = end;
    } else if (target_step > end) {
      target_step = 0;
    }
    // copy it to track's adjacent step
    var src = gSelected.track.data[gSelected.step.id];
    var dst = gSelected.track.data[target_step];
    dst[0] = src[0].slice();
    dst[1] = src[1].slice();
    dst[2] = src[2].slice();
    // change selection and redraw
    Envvy.selectStep(gSelected.track.steps[target_step]);
    gSelected.step.draw();
  }
};

Envvy.clearStep = function() {
  if (gSelected.step) {
    var d = gSelected.track.data[gSelected.step.id];
    d[0] = [0.0, 0.0];
    d[1] = [0.5, 0.0];
    d[2] = [1.0, 0.0];
    gSelected.step.draw();
  }
};

Envvy.copyStep = function() {
  if (gSelected.step) {
    var src = gSelected.track.data[gSelected.step.id];
    this.clipboard = src.slice();
  }
};

Envvy.pasteStep = function() {
  if (gSelected.step && this.clipboard) {
    var src = this.clipboard;
    var dst = gSelected.track.data[gSelected.step.id];
    dst[0] = src[0].slice();
    dst[1] = src[1].slice();
    dst[2] = src[2].slice();
    // change selection and redraw
    gSelected.step.draw();
  }
};

Envvy.togglePlay = function() {
  this._isPlaying = !this._isPlaying;
};

Envvy.rewind = function() {
  this.tracks.forEach(function(e) {
    e.rewind();
  });
};

Envvy.export = function() {
  var dump = [];
  if (this.tracks) {
    this.tracks.forEach(function(e) {
      dump.push(e.getData());
    });
  }
  return encode(JSON.stringify(dump));
};

Envvy.import = function(data) {
  var temp = JSON.parse(decode(data));
  if (this.tracks) {
    this.tracks.forEach(function(e, i) {
      e.setData(temp[i].data);
    });
  }
};

// helper
var decode = function (string) {
  return RawDeflate.inflate(window.atob(string));
};
var encode = function (string) {
  return window.btoa(RawDeflate.deflate(string));
};