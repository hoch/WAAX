(function (GF) {

  // canvas
  var cvs = document.getElementById('i-grid');
  var ctx = cvs.getContext('2d');



  var kNumBeat = 8; // 8 beats
  var kBeatDivision = 4; // 1 beat = 4 16th
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

  // virtual: callbacks from event mananger
  function onLaneNameClicked () {}
  function onWorkSpaceClicked () {}
  function onWorkSpaceDragged () {}
  function onControlLaneClicked () {}
  function onControlLaneDragged () {}


  function _laneNameClicked (position) {
    onLaneNameClicked();
  }

  function _workSpaceClicked (position) {
    onWorkSpaceClicked();
  }

  function _controlLaneClicked (position) {
    onControlLaneClicked();
  }


  var AreaLaneName = new _Area(0, 0, kLaneNameWidth, kWorkSpaceHeight);
  var AreaWorkSpace = new _Area(kLaneNameWidth, 0, kLaneNameWidth + kWorkSpaceWidth, kWorkSpaceHeight);
  var AreaControlLane = new _Area(kLaneNameWidth, kWorkSpaceHeight, kLaneNameWidth + kWorkSpaceWidth, kControlLaneHeight);

  cvs.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

  cvs.addEventListener("mousedown", function (event) {

    var p = _getMousePosition(event);

    if (AreaLaneName.containsPoint(p)) {
      console.log("lanename", "clicked", AreaLaneName.getNormPosition(p));
    }
    if (AreaWorkSpace.containsPoint(p)) {
      console.log("workspace", "clicked", AreaWorkSpace.getNormPosition(p));
    }
    if (AreaControlLane.containsPoint(p)) {
      console.log("controllane", "clicked", AreaControlLane.getNormPosition(p));
    }

  });



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

    drawLaneName: function () {
      for (var i = 0; i < kNumGridY; i++) {
        ctx.fillStyle = "#555";
        ctx.fillRect(0, kGridSizeY * i, kLaneNameWidth - 2, kGridSizeY - 1);
        ctx.fillStyle = "#EEE";
        ctx.fillText("drum sound 99", 4, kGridSizeY * i + 3);
      }
    }

  };

  GF.EventView.drawBackground();
  GF.EventView.drawLaneName();




})(GF);