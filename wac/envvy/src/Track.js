
/**
 * @class Track
 */
Track = function(label, numSteps, targetDiv) {
  this.label = label;
  this.numSteps = numSteps;
  this.dom = {
    container: targetDiv,
    label: null,
    svg: null
  };
  this.data = [];
  this.steps = [];
  this.getCurrentStep();
  // this.current = 0;
  // init
  this.build();
};

/**
 * @prototype Track
 */
Track.prototype = {

  getCurrentStep: function () {
    var BPM = 120,              // beat per minute
        SPB = 60 / BPM,         // second per beat
        LOOKAHEAD = 1 / 60;     // look ahead, 16.6667ms
    var unixOrigin = (performance.timing.navigationStart / 1000.0);
    unixOrigin += (performance.now() / 1000.0);
    var wxOrigin = unixOrigin - WX.now,
        now = wxOrigin + WX.now,
        totalSteps = Math.floor(now / SPB);
        // currentStepOnset = totalSteps * SPB - wxOrigin;
    this.current = (totalSteps + 1) % 8;
  },

  // build track dom with steps
  build: function() {
    // create div
    this.dom.label = document.createElement("div");
    this.dom.label.className = "c-track-label";
    this.dom.label.textContent = this.label;
    this.dom.container.appendChild(this.dom.label);
    // init svg
    this.dom.svg = createSVG("svg");
    setAttr(this.dom.svg, {
      "width": (gStepSize.w + gStepPadding) * this.numSteps + "px",
      "height": gStepSize.h + "px",
      "class": "c-track-steps"
    });
    this.dom.container.appendChild(this.dom.svg);
    // init data
    for(var j = 0; j < this.numSteps; ++j) {
      this.data[j] = [[0.0, 0.0], [0.5, 0.0], [1.0, 0.0]];
    }
    // create steps
    for(var i = 0; i < this.numSteps; ++i) {
      this.steps[i] = new Step(this, i);
      this.steps[i].appendTo(this.dom.svg);
    }
  },
  refresh: function() {
    for(var i = 0; i < this.numSteps; ++i) {
      this.steps[i].draw();
    }
  },
  // setData
  setData: function(newdata) {
    // NOTE: this will brake the connection from step
    // please do copy by value here...
    for(var i = 0; i < this.numSteps; ++i) {
      this.data[i][1] = newdata[i][1].slice();
      this.steps[i].draw();
    }
  },
  // getData()
  getData: function() {
    var o = {
      label: this.label,
      data: this.data.slice(),
      version: Envvy.version
    };
    return o;
  },
  // getJSONData()
  getJSONData: function() {
    // convert array into json
    var json = JSON.stringify(this.getData());
    return json;
  },
  // randomizeData()
  randomizeData: function() {
    for(var i = 0; i < this.numSteps; ++i) {
      var x = Math.random(), y = Math.random();
      // this.data[i] = [[0.0, 0.0], [x, y], [1.0, 0.0]];
      this.data[i][1][0] = x;
      this.data[i][1][1] = y;
      this.steps[i].draw();
    }
  },
  morphData: function(factor) {
    for(var i = 0; i < this.numSteps; ++i) {
      var x = (Math.random() - 0.5) * 2.0 * factor,
          y = (Math.random() - 0.5) * 2.0 * factor;
      this.data[i][1][0] += x;
      this.data[i][1][1] += y;
      this.data[i][1][0] = Math.max(0.001, Math.min(1.0, this.data[i][1][0]));
      this.data[i][1][1] = Math.max(0.0, Math.min(1.0, this.data[i][1][1]));
      this.steps[i].draw();
    }
  },
  highlightLabel: function(bool) {
    if (bool) {
      this.dom.label.className = "c-track-label highlight";
    } else {
      this.dom.label.className = "c-track-label";
    }
  },
  flash: function(time) {
    var me = this.steps[this.current];
    setTimeout(function() {
      me.flash();
    }, time);
  },
  step: function() {
    this.current++;
    this.current %= this.data.length;
  },
  getStepData: function() {
    var o = {
      time: this.data[this.current][1][0],
      val: this.data[this.current][1][1]
    };
    return o;
  },
  rewind: function() {
    // this.current = 0;
  }
};