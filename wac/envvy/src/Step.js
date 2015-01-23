/**
 * SVG utils
 */
var createSVG = function(tag, parent) {
  var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (parent) {
    parent.appendChild(el);
  }
  return el;
};
var setAttr = function(el, obj) {
  for(var key in obj) {
    el.setAttributeNS(null, key, obj[key]);
  }
};


/**
 * @class Step
 */
Step = function(parent, id) {
  // reference to the parent track
  this.parent = parent;
  this.id = id;
  // target data values (normalized, need to convert)
  this.target = parent.data[id];
  // create SVG elements
  this.svg = {};
  this.build();
  // start listen user interaction
  this.listen();
};

/**
 * @prototype Step
 */
Step.prototype = {
  // build svg elements
  build: function() {
    // create element
    this.svg.group = createSVG("g");
    this.svg.frame = createSVG("rect", this.svg.group);
    this.svg.line = createSVG("polyline", this.svg.group);
    // NOTE: the last drawn element will get mouse action
    this.svg.overlay = createSVG("rect", this.svg.group);
    // set fixed attributes
    var offsetX = this.id * (gStepSize.w + gStepPadding);
    setAttr(this.svg.group, {
        "transform": "translate(" + offsetX + ", 0)"
    });
    setAttr(this.svg.frame, {
        "class": "c-step-frame",
        "width": gStepSize.w, "height": gStepSize.h
    });
    setAttr(this.svg.line, {
        "class": "c-step-line"
    });
    setAttr(this.svg.overlay, {
        "class": "c-step-overlay",
        "width": gStepSize.w, "height": gStepSize.h
    });
    // call update for line
    this.draw();
  },
  appendTo: function(target) {
    target.appendChild(this.svg.group);
  },
  // update envelope visual (polyline)
  draw: function() {
    var t = this.target;
    var d = [];
    // convert target data to graphic coordinate
    for (var i = 0; i < t.length; ++i) {
      var x = t[i][0] * gStepSize.w;
      var y = (1.0 - t[i][1]) * gStepSize.h;
      d[i] = [x, y];
    }
    // update polyline from target data point
    setAttr(this.svg.line, {
      "points": d
    });
  },
  // update data from handle position
  update: function(dx, dy) {
    // get center point
    var c = this.svg.line.points.getItem(1);
    // update center point (this will change the visual)
    c.x += dx;
    c.y += dy;
    c.x = Math.max(0, Math.min(gStepSize.w, c.x));
    c.y = Math.max(0, Math.min(gStepSize.h, c.y));
    // update target data
    this.target[1][0] = c.x / gStepSize.w;
    this.target[1][1] = 1.0 - (c.y / gStepSize.h);
  },
  // listen user interaction
  listen: function() {
    var me = this;
    this.svg.overlay.addEventListener("mousedown", function(e) {
      e.preventDefault();
      // report back to global system: this step is selected
      Envvy.selectStep(me, e);
      // gSelected.step = me;
      // excute handleClicked function
      me._handleClicked(e);
    }, false);
  },
  // (un)highlight this step by css
  highlight: function(bool) {
    if (bool) {
      setAttr(this.svg.frame, {
        "class": "c-step-frame-highlighted"
      });
    } else {
      setAttr(this.svg.frame, {
        "class": "c-step-frame"
      });
    }
  },
  // flash the step (playhead position)
  flash: function() {
    setAttr(this.svg.overlay, {
        "class": "c-step-overlay-flash"
    });
    var me = this;
    setTimeout(function() {
      setAttr(me.svg.overlay, {
        "class": "c-step-overlay"
      });
    }, 150);
  },
  // handleClicked
  _handleClicked: function(e) {
    e.preventDefault();
    gPrevPos.x = e.clientX;
    gPrevPos.y = e.clientY;
    window.addEventListener("mousemove", gSelected.step._handleMoved, false);
    window.addEventListener("mouseup", gSelected.step._handleReleased, false);
  },
  // handleClicked
  _handleMoved: function(e) {
    e.preventDefault();
    var fineControlFactor = 1.0;
    if (e.shiftKey) {
      fineControlFactor = 0.25;
    }
    var x = e.clientX, y = e.clientY;
    var dx = (x - gPrevPos.x) * fineControlFactor;
    var dy = (y - gPrevPos.y) * fineControlFactor;
    // if alt key is pressed, update all row
    if (e.altKey) {
      var steps = gSelected.track.steps;
      for (var i = 0; i < steps.length; i++) {
        steps[i].update(dx, dy);
      }
    } else {
      gSelected.step.update(dx, dy);
    }
    gPrevPos.x = x;
    gPrevPos.y = y;
  },
  // handleClicked
  _handleReleased: function(e) {
    e.preventDefault();
    window.removeEventListener("mousemove", gSelected.step._handleMoved, false);
    window.removeEventListener("mouseup", gSelected.step._handleReleased, false);
    //Envvy.releaseStep();
  }
};