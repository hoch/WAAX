(function (GF) {

  // canvas
  var cvs = document.getElementById('i-grid');
  var ctx = cvs.getContext('2d');



  var kNumBeat = 8; // 8 beats
  var kBeatDivision = 4; // 1 beat = 4 16th
  var kTotalTick = 8 * 480;
  var kNumLane = 16; // 16 lane

  var kLaneNameWidth = 120;
  var kTimelineHeight = 80;
  var kControlLaneHeight = 80;
  var kWorkSpaceWidth = 768;
  var kWorkSpaceHeight = 320;

  var kNumGridX = kNumBeat * kBeatDivision;
  var kNumGridY = kNumLane;
  var kGridSizeX = kWorkSpaceWidth / kNumGridX;
  var kGridSizeY = kWorkSpaceHeight / kNumGridY;

  ctx.canvas.width = kLaneNameWidth + kWorkSpaceWidth;
  ctx.canvas.height = kWorkSpaceHeight + kControlLaneHeight;
  ctx.font = "11px sans-serif";
  ctx.textBaseline = "top";




  /*
  interaction

  click => object

  ruler: return current position;
    drag => move current position

  lane names: select lane

  grid: create event or select event;
    drag => fill event on grids or move selected events
    esc => deselect all

  grid(shift): select more event;
    esc => deselect all

  control lane: change data;
    drag => change data

   */

  function _getMousePosition (event) {
    var b = cvs.getBoundingClientRect();
    return {
      x: event.clientX - b.left,
      y: event.clientY - b.top
    }
  }

  function _Area (x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;
    this.w = w;
    this.h = h;
  }

  _Area.prototype = {
    containsPoint: function (p) {
      if (this.x1 <= p.x && p.x <= this.x2) {
        if (this.y1 <= p.y && p.y <= this.y2) {
          return true;
        }
      }
      return false;
    },
    getNormX: function (p) {
      return (p.x - this.x1) / this.w;
    },
    getNormY: function (p) {
      return (p.y - this.y1) / this.h;
    },
    getNormPosition: function (p) {
      return {
        x: (p.x - this.x1) / this.w,
        y: (p.y - this.y1) / this.h
      };
    }
  };



  /**
   * [EventView description]
   * @type {Object}
   */
  GF.EventView = {

    drawBackground: function () {
      // clear up
      ctx.fillStyle = "#333";
      ctx.fillRect(kLaneNameWidth, 0, kWorkSpaceWidth, kWorkSpaceHeight + kControlLaneHeight);
      // divider
      ctx.fillStyle = "#444";
      ctx.fillRect(kLaneNameWidth, kWorkSpaceHeight, kWorkSpaceWidth, kControlLaneHeight);
      // lane grid
      ctx.beginPath();
      ctx.strokeStyle = "#444";
      for (var i = 0; i < kNumGridY; i++) {
        ctx.moveTo(kLaneNameWidth, kGridSizeY * i);
        ctx.lineTo(kLaneNameWidth + kWorkSpaceWidth, kGridSizeY * i);
      }
      ctx.stroke();
      // time grid: regular
      ctx.beginPath();
      ctx.strokeStyle = "#444";
      for (var i = 0; i < kNumGridX; i++) {
        if (i % 4) {
          ctx.moveTo(kLaneNameWidth + i * kGridSizeX, 0);
          ctx.lineTo(kLaneNameWidth + i * kGridSizeX, kWorkSpaceHeight);
        }
      }
      ctx.stroke();
      // time grid: accent
      ctx.beginPath();
      ctx.strokeStyle = "#999";
      for (var i = 0; i < kNumGridX; i++) {
        if (i % 4 === 0) {
          ctx.moveTo(kLaneNameWidth + i * kGridSizeX, 0);
          ctx.lineTo(kLaneNameWidth + i * kGridSizeX, kWorkSpaceHeight + kControlLaneHeight);
        }
      }
      ctx.stroke();
    },

    drawLaneName: function (selectedLane) {
      for (var i = 0; i < kNumGridY; i++) {
        if (selectedLane === i) {
          ctx.fillStyle = "#FFF";
          ctx.fillRect(0, kGridSizeY * i, kLaneNameWidth - 2, kGridSizeY - 1);
          ctx.fillStyle = "#555";
          ctx.fillText("drum sound 99", 4, kGridSizeY * i + 3);
        } else {
          ctx.fillStyle = "#555";
          ctx.fillRect(0, kGridSizeY * i, kLaneNameWidth - 2, kGridSizeY - 1);
          ctx.fillStyle = "#EEE";
          ctx.fillText("drum sound 99", 4, kGridSizeY * i + 3);
        }

      }
    },

    drawEvent: function (event) {
      // all events is 16th
      var pos = kLaneNameWidth + event.getTick() / kTotalTick * kWorkSpaceWidth;
      var dur = 120 / kTotalTick * kWorkSpaceWidth;
      if (event.bSelected) {
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#F99";
      } else {
        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#C66";
      }
      ctx.strokeRect(pos + 2, event.lane * kGridSizeY + 2, dur - 4, kGridSizeY - 4);

      ctx.fillRect(pos + 2, event.lane * kGridSizeY + 2, dur - 4, kGridSizeY - 4);
    },

    drawControlLane: function (eventsAtLane) {
      if (eventsAtLane) {
        for (var i = 0; i < eventsAtLane.length; i++) {
          var pos = kLaneNameWidth + eventsAtLane[i].getTick() / kTotalTick * kWorkSpaceWidth;
          var barTop = kWorkSpaceHeight + (1.0 - eventsAtLane[i].params.intensity) * kControlLaneHeight;
          var barHeight = eventsAtLane[i].params.intensity * kControlLaneHeight;
          var dur = 120 / kTotalTick * kWorkSpaceWidth;
          ctx.strokeStyle = "#000";
          ctx.strokeRect(pos + 2, barTop, dur - 4, barHeight);
          ctx.fillStyle = "#669";
          ctx.fillRect(pos + 2, barTop, dur - 4, barHeight);
        }
      }
    },

    draw: function (options) {
      this.drawBackground();
      this.drawLaneName(options.selectedLane);
    },

    // report back to event manager
    report: function () {},

  };

  // user interaction
  var AreaLaneName = new _Area(0, 0, kLaneNameWidth, kWorkSpaceHeight);
  var AreaWorkSpace = new _Area(kLaneNameWidth, 0, kWorkSpaceWidth, kWorkSpaceHeight);
  var AreaControlLane = new _Area(kLaneNameWidth, kWorkSpaceHeight, kWorkSpaceWidth, kControlLaneHeight);

  var prevTick = 0;
  function draggedWorkSpace (event) {
    var p = _getMousePosition(event);
    if (AreaWorkSpace.containsPoint(p)) {
      var lane = ~~(AreaWorkSpace.getNormY(p) * kNumLane);
      var tick = ~~(AreaWorkSpace.getNormX(p) * 480 * 8);
      GF.EventView.report("workspace", "dragged", { lane: lane, tick: tick, deltaTick: tick - prevTick });
      prevTick = tick;
    }
  }

  function releasedWorkSpace (event) {
    window.removeEventListener("mousemove", draggedWorkSpace, false);
    window.removeEventListener("mouseup", releasedWorkSpace, false);
  }

  function draggedControlLane (event) {
    var p = _getMousePosition(event);
    if (AreaControlLane.containsPoint(p)) {
      var tick = ~~(AreaControlLane.getNormX(p) * 480 * 8);
      var value = 1.0 - AreaControlLane.getNormY(p);
      GF.EventView.report("controllane", "dragged", { tick: tick, value: value });
    }
  }

  function releasedControlLane (event) {
    window.removeEventListener("mousemove", draggedControlLane, false);
    window.removeEventListener("mouseup", releasedControlLane, false);
  }

  cvs.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

  window.addEventListener("keydown", function (event) {
    switch (event.keyCode) {
      case 8:
      case 46:
        event.preventDefault();
        GF.EventView.report("window", "keydown", { action: "delete" });
        break;
    }
  });

  cvs.addEventListener("mousedown", function (event) {

    var p = _getMousePosition(event);

    if (AreaLaneName.containsPoint(p)) {
      var lane = ~~(AreaLaneName.getNormY(p) *kNumLane);
      GF.EventView.report("lanename", "clicked", { lane: lane });
    }
    if (AreaWorkSpace.containsPoint(p)) {
      var lane = ~~(AreaWorkSpace.getNormY(p) * kNumLane);
      var tick = ~~(AreaWorkSpace.getNormX(p) * 480 * 8);
      if (event.shiftKey) {
        GF.EventView.report("workspace", "shiftclicked", { lane: lane, tick: tick });
      } else {
        GF.EventView.report("workspace", "clicked", { lane: lane, tick: tick });
      }
      prevTick = tick;
      window.addEventListener("mousemove", draggedWorkSpace, false);
      window.addEventListener("mouseup", releasedWorkSpace, false);
    }
    if (AreaControlLane.containsPoint(p)) {
      var tick = ~~(AreaControlLane.getNormX(p) * 480 * 8);
      var value = 1.0 - AreaControlLane.getNormY(p);
      GF.EventView.report("controllane", "clicked", { tick: tick, value: value });
      window.addEventListener("mousemove", draggedControlLane, false);
      window.addEventListener("mouseup", releasedControlLane, false);
    }

  }, false);

  // initialization



})(GF);