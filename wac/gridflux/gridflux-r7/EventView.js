// EventView
// : Implements event viewer (pianoroll).

GF.EventView = { ID: 'EventView' };

(function (WX, MUI, GF) {

  // @class Area
  // : Implements 2D area abstraction.
  function Area (x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;
    this.w = w;
    this.h = h;
  }

  Area.prototype = {
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


  // @class PianoRoll
  // : Implements PianoRoll event viewer.
  function PianoRoll(manager) {

    var cvs = document.getElementById('i-ui-event');
    var ctx = cvs.getContext('2d');

    var kNumBeat = 8; // 8 beats
    var kBeatDivision = 4; // 1 beat = 4 16th
    var kTotalTick = 8 * 480;
    var kNumLane = 16; // 16 lane

    var kLaneNameWidth = 160;
    var kTimelineHeight = 80;
    var kControlLaneHeight = 80;
    // var kWorkSpaceWidth = 768;
    var kWorkSpaceWidth = 916;
    var kWorkSpaceHeight = 320;

    var kNumGridX = kNumBeat * kBeatDivision;
    var kNumGridY = kNumLane;
    var kGridSizeX = kWorkSpaceWidth / kNumGridX;
    var kGridSizeY = kWorkSpaceHeight / kNumGridY;
    var kEventDur = 120 / kTotalTick * kWorkSpaceWidth - 4;

    var AreaLaneName = new Area(0, 0, kLaneNameWidth, kWorkSpaceHeight);
    var AreaWorkSpace = new Area(kLaneNameWidth, 0, kWorkSpaceWidth, kWorkSpaceHeight);
    var AreaControlLane = new Area(kLaneNameWidth, kWorkSpaceHeight, kWorkSpaceWidth, kControlLaneHeight);

    ctx.canvas.width = kLaneNameWidth + kWorkSpaceWidth;
    ctx.canvas.height = kWorkSpaceHeight + kControlLaneHeight;
    ctx.font = "10px Roboto";
    ctx.textBaseline = "top";

    var laneStatus = [];

    // report changes to manager
    this._onchange = function (elementName, action, value) {
      manager.report.call(manager, elementName, action, value);
    };

    this.drawBackground = function () {
      ctx.fillStyle = "#969696";
      ctx.fillRect(0, 0, kLaneNameWidth + kWorkSpaceWidth, kWorkSpaceHeight + kControlLaneHeight);
      // clear up
      ctx.fillStyle = "#333";
      ctx.fillRect(kLaneNameWidth, 0, kWorkSpaceWidth, kWorkSpaceHeight + kControlLaneHeight);
      // control lane background
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
      for (i = 0; i < kNumGridX; i++) {
        if (i % 4) {
          ctx.moveTo(kLaneNameWidth + i * kGridSizeX, 0);
          ctx.lineTo(kLaneNameWidth + i * kGridSizeX, kWorkSpaceHeight);
        }
      }
      ctx.strokeStyle = "#444";
      ctx.stroke();
      // time grid: accent
      ctx.beginPath();
      for (i = 0; i < kNumGridX; i++) {
        if (i % 4 === 0) {
          ctx.moveTo(kLaneNameWidth + i * kGridSizeX, 0);
          ctx.lineTo(kLaneNameWidth + i * kGridSizeX, kWorkSpaceHeight + kControlLaneHeight);
        }
      }
      ctx.strokeStyle = "#999";
      ctx.stroke();
    };

    this.drawLaneName = function (selectedLane) {
      // check all the lane
      for (var i = 0; i < kNumGridY; i++) {
        // if selected lane found
        if (selectedLane === i) {
          // check lane status
          if (laneStatus[i]) {
            ctx.fillStyle = "#FFFFFF";
          } else {
            ctx.fillStyle = "#92CDCF";
          }
          ctx.fillRect(0, kGridSizeY * i, kLaneNameWidth - 2, kGridSizeY - 1);
          ctx.fillStyle = "#31353D";
        } else {
          if (laneStatus[i]) {
            ctx.fillStyle = "#FFFFFF";
          } else {
            ctx.fillStyle = "#555";
          }
          ctx.fillRect(0, kGridSizeY * i, kLaneNameWidth - 2, kGridSizeY - 1);
          ctx.fillStyle = "#EEE";
        }
        ctx.fillText(i + " " + GF.Sampler.getBufferName(i), 4, kGridSizeY * i + 3);
        laneStatus[i] = false;
      }
    };

    this.drawEvent = function (data, selectedLane) {
      // draw event on grid
      var pos = kLaneNameWidth + data.tick / kTotalTick * kWorkSpaceWidth + 2;
      ctx.strokeStyle = "#000";
      ctx.fillStyle = "#C66";
      ctx.strokeRect(pos, data.lane * kGridSizeY + 2, kEventDur, kGridSizeY - 4);
      ctx.fillRect(pos, data.lane * kGridSizeY + 2, kEventDur, kGridSizeY - 4);
      // draw control data if it is on selected lane
      if (data.lane === selectedLane) {
        var barTop = kWorkSpaceHeight + (1.0 - data.intensity) * kControlLaneHeight;
        var barHeight = data.intensity * kControlLaneHeight;
        ctx.strokeStyle = "#31353D";
        ctx.fillStyle = "#445878";
        ctx.strokeRect(pos, barTop, kEventDur, barHeight);
        ctx.fillRect(pos, barTop, kEventDur, barHeight);
      }
    };

    this.drawSelectedEvent = function (data, selectedLane) {
      // draw event on grid
      var pos = kLaneNameWidth + data.tick / kTotalTick * kWorkSpaceWidth + 2;
      ctx.strokeStyle = "#FFF";
      ctx.fillStyle = "#F99";
      ctx.strokeRect(pos, data.lane * kGridSizeY + 2, kEventDur, kGridSizeY - 4);
      ctx.fillRect(pos, data.lane * kGridSizeY + 2, kEventDur, kGridSizeY - 4);
      // draw control data if it is on selected lane
      if (data.lane === selectedLane) {
        var barTop = kWorkSpaceHeight + (1.0 - data.intensity) * kControlLaneHeight;
        var barHeight = data.intensity * kControlLaneHeight;
        ctx.strokeStyle = "#31353D";
        ctx.fillStyle = "#92CDCF";
        ctx.strokeRect(pos, barTop, kEventDur, barHeight);
        ctx.fillRect(pos, barTop, kEventDur, barHeight);
      }
    };

    this.drawSelectionRange = function (lane1, tick1, lane2, tick2) {
      var x = kLaneNameWidth + tick1 / kTotalTick * kWorkSpaceWidth;
      var y = lane1 * kGridSizeY;
      var width = (tick2 - tick1) / kTotalTick * kWorkSpaceWidth;
      var height = (lane2 - lane1 + 1) * kGridSizeY;
      ctx.strokeStyle = "#FFFFFF";
      ctx.strokeRect(x, y, width, height);
    };

    this.drawPlayhead = function (tick) {
      var pos = tick / kTotalTick * kWorkSpaceWidth + kLaneNameWidth;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, kWorkSpaceHeight + kControlLaneHeight);
      ctx.strokeStyle = "#FFF";
      ctx.lineWidth = 2.0;
      ctx.stroke();
      ctx.lineWidth = 1.0; // revert to default
    };

    this.flashLane = function (lane) {
      laneStatus[lane] = true;
    };

    function _getMousePosition (event) {
      var b = cvs.getBoundingClientRect();
      return {
        x: event.clientX - b.left,
        y: event.clientY - b.top
      };
    }

    var _prevTick = 0, _prevLane = 0;
    function _getDataFromPosition(pos) {
      var lane = ~~(AreaWorkSpace.getNormY(pos) * kNumLane);
      var tick = ~~(AreaWorkSpace.getNormX(pos) * kTotalTick);
      var data = {
        tick: tick,
        lane: lane,
        deltaTick: tick - _prevTick,
        deltaLane: lane - _prevLane
      };
      _prevTick = tick;
      _prevLane = lane;
      return data;
    }

    // Mouse responders.
    
    function _draggedWorkSpace(event) {
      var pos = _getMousePosition(event);
      // if (AreaWorkSpace.containsPoint(pos)) {
        manager.report.call(manager, "workspace", "dragged", _getDataFromPosition(pos));
      // }
    }

    function _releasedWorkSpace(event) {
      var pos = _getMousePosition(event);
      manager.report.call(manager, "workspace", "released", _getDataFromPosition(pos));
      window.removeEventListener("mousemove", _draggedWorkSpace, false);
      window.removeEventListener("mouseup", _releasedWorkSpace, false);
    }

    function _draggedControlLane(event) {
      var pos = _getMousePosition(event);
      if (AreaControlLane.containsPoint(pos)) {
        manager.report.call(manager, "controllane", "dragged", {
          tick: ~~(AreaControlLane.getNormX(pos) * kTotalTick),
          value: 1.0 - AreaControlLane.getNormY(pos)
        });
      }
    }

    function _releasedControlLane(event) {
      manager.report.call(manager, "controllane", "released", null);
      window.removeEventListener("mousemove", _draggedControlLane, false);
      window.removeEventListener("mouseup", _releasedControlLane, false);
    }

    // event router: on click (entry point)
    cvs.addEventListener("mousedown", function (event) {
      // get mouse position
      var pos = _getMousePosition(event);
      var action = "clicked";

      // when mouse on lane names
      if (AreaLaneName.containsPoint(pos)) {
        if (event.shiftKey) {
          action = "shiftclicked";
        } else if (event.altKey) {
          action = "altclicked";
        }
        manager.report.call(manager, "lanename", action, {
          lane: ~~(AreaLaneName.getNormY(pos) * kNumLane)
        });
      }

      // when mouse on workspace
      else if (AreaWorkSpace.containsPoint(pos)) {
        if (event.shiftKey) {
          action = "shiftclicked";
        } else if (event.altKey) {
          action = "altclicked";
        }
        manager.report.call(manager, "workspace", action, _getDataFromPosition(pos));
        window.addEventListener("mousemove", _draggedWorkSpace, false);
        window.addEventListener("mouseup", _releasedWorkSpace, false);
      }

      // when mouse on control lane
      else if (AreaControlLane.containsPoint(pos)) {
        manager.report.call(manager, "controllane", "clicked", {
          tick: ~~(AreaControlLane.getNormX(pos) * kTotalTick),
          value: 1.0 - AreaControlLane.getNormY(pos)
        });
        window.addEventListener("mousemove", _draggedControlLane, false);
        window.addEventListener("mouseup", _releasedControlLane, false);
      }
    }, false);

    // handling key for event view
    window.addEventListener("keydown", function (event) {
      // console.log(event.keyCode);
      switch (event.keyCode) {
        case 32: // space
          event.preventDefault();
          manager.report.call(manager, "window", "spacekey", null);
          break;
        case 37:
          manager.report.call(manager, "window", "leftkey", null);
          break;
        case 38:
          manager.report.call(manager, "window", "upkey", null);
          break;
        case 39:
          manager.report.call(manager, "window", "rightkey", null);
          break;
        case 40:
          manager.report.call(manager, "window", "downkey", null);
          break;
        case 8:
        case 46:
          event.preventDefault();
          manager.report.call(manager, "window", "deletekey", null);
          break;
      }
    }, false);

    // block context menu
    cvs.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    }, false);

  }



  // @class EventManager
  // Implements EventManager.
  function EventManager() {

    // view
    this.view = new PianoRoll(this);
    // eventlist and select buffer
    this.eventlist = GF.Timebase.createEventList();
    this.selectBuffer = GF.Timebase.createEventList();
    // event filter
    this.eventFilter = GF.Timebase.createEventFilter();

    // rendering parameters
    this.params = {
      pSelectedLane: 0,
      pPlayheadPosition: 0
    };
    // dirty checking on lane names (fillText performance issue)
    this.isLaneNameChanged = true;

    // for range select
    this.bRangeSelect = false;
    this.rangeStart = { lane: 0, tick: 0 };
    this.rangeEnd = { lane: 0, tick: 0 };

    // initially selected item
    this._selectEvents(this.eventlist.findEventsAtLane(this.params.pSelectedLane));
  }


  EventManager.prototype = {

    // order to the view
    order: function (target, value) {
      this.view.order(target, value);
    },

    // set param from transport
    setParam: function (param, value) {
      switch (param) {
        case 'pSelectedLane':
          this.params.pSelectedLane = value;
          break;
        case 'pPlayheadPosition':
          this.params.pPlayheadPosition = value;
          break;
      }
    },

    getSequence: function () {
      var temp = GF.Timebase.createEventList();
      this.eventlist.iterate(function (event) {
        temp.push(GF.Timebase.createEvent(event.data.tick, event.data.lane, event.data.intensity));
      }.bind(this));
      this.selectBuffer.iterate(function (event) {
        temp.push(GF.Timebase.createEvent(event.data.tick, event.data.lane, event.data.intensity));
      }.bind(this));
      return temp.serialize();
    },

    setSequence: function (sequence) {
      if (sequence) {
        this.eventlist.empty();
        this.selectBuffer.empty();
        for (var i = 0; i < sequence.length; i++) {
          var newEvent = GF.Timebase.createEvent(sequence[i].data.tick, sequence[i].data.lane, sequence[i].data.intensity);
          // console.log(newEvent);
          this.eventlist.push(newEvent);
        }  
      }
    },

    // update view
    updateView: function () {
      this.view.drawBackground();
      this.eventlist.iterate(function (event) {
        this.view.drawEvent(this.eventFilter.process(event), this.params.pSelectedLane);
      }.bind(this));
      this.selectBuffer.iterate(function (event) {
        this.view.drawSelectedEvent(this.eventFilter.process(event), this.params.pSelectedLane);
      }.bind(this));
      this.view.drawPlayhead(this.params.pPlayheadPosition);
      this.view.drawLaneName(this.params.pSelectedLane);
      if (this.bRangeSelect) {
        this.view.drawSelectionRange(
          this.rangeStart.lane, this.rangeStart.tick,
          this.rangeEnd.lane, this.rangeEnd.tick
        );
      }
      if (this.isLaneNameChanged) {
        this.view.drawLaneName(this.params.pSelectedLane);
        this.isLaneNameChanged = false;
      }
    },

    flashLane: function (lane) {
      this.view.flashLane(lane);
    },

    // move selected events from eventlist to select buffer
    _selectEvents: function (events) {
      if (events) {
        for (var i = 0; i < events.length; i++) {
          this.eventlist.remove(events[i]);
          events[i].isolate();
          this.selectBuffer.push(events[i]);
        }
      }
    },

    // revert selected events into eventlist
    _revertSelection: function () {
      var bucket = [];
      this.selectBuffer.iterate(function (event) {
        bucket.push(event);
      });
      this.selectBuffer.empty();
      for (var i = 0; i < bucket.length; i++) {
        bucket[i].isolate();
        this.eventlist.push(bucket[i]);
      }
    },

    // find an event from both lists
    _findEventAtPosition: function (lane, tick) {
      var evt1 = this.eventlist.findEventAtPosition(lane, tick);
      var evt2 = this.selectBuffer.findEventAtPosition(lane, tick);
      return (evt2 || evt1);
    },

    // set position at tick on both lists
    _setPositionAtTick: function (tick) {
      this.eventlist.setPositionAtTick(tick);
      this.selectBuffer.setPositionAtTick(tick);
    },

    // report from view: UI handling
    report: function (element, action, data) {

      // console.log(element, action, data);

      var evt1, evt2, lane, tick;

      if (data) {
        lane = data.lane;
        tick = data.tick;
      }

      switch (action) {

        case "clicked":
          switch (element) {

            // CASE: LaneName Clicked
            case "lanename":
              if (lane !== this.params.pSelectedLane) {
                this._revertSelection();
                this._selectEvents(this.eventlist.findEventsAtLane(lane));
              }
              this.params.pSelectedLane = lane;
              this.isLaneNameChanged = true;
              GF.Sampler.cellChanged(lane);
              // console.log(GF.Sampler.getBufferName(lane));
              // this.notify('pContentChanged');
              break;

            // CASE: Workspace Clicked
            case "workspace":
              evt1 = this.eventlist.findEventAtPosition(lane, tick);
              evt2 = this.selectBuffer.findEventAtPosition(lane, tick);
              if (evt1) {
                // clicked an 'unselected' event
                // revert selection, select the event
                this._revertSelection();
                this._selectEvents([evt1]);
                // this.notify('pContentChanged');
              } else if (evt2) {
                // clicke on selecting a selected event
                // do nothing
              } else {
                this.notify('pPlayheadPosition', tick);
                // clicked on empty area
                // revert selection, start range selection
                this._revertSelection();
                this.bRangeSelect = true;
                this.rangeStart = { lane: lane, tick: tick };
                this.rangeEnd = { lane: lane, tick: tick };

                // event sholud be later than origin
                // tick = (data.tick - 60 < 0) ? 0 : data.tick - 60;
                // this.eventlist.push(GF.createEvent(tick, lane, 0.75));
                // old...
                // var newEvent = this.eventFilter.process(
                //   GF.createEvent((tick < 0) ? 0 : tick, lane, 0.75)
                // );
                // this.notify('pContentChanged');
              }
              break;

            // CASE: Control Lane Clicked
            case "controllane":
              evt1 = this._findEventAtPosition(this.params.pSelectedLane, tick);
              if (evt1) {
                evt1.data.intensity = data.value;
              }
              break;
          }
          break;

        // case shiftclicked
        case "shiftclicked":
          evt1 = this._findEventAtPosition(lane, tick);
          if (evt1) {
            // GF.Sampler.cellChanged(lane);
            // this.params.selectedLane = lane;
            this._selectEvents([evt1]);
            // this.notify('pContentChanged');
          }
          break;

        // case altclicked
        case "altclicked":
          switch (element) {
            case "lanename":
              this.params.pSelectedLane = lane;
              this.isLaneNameChanged = true;
              GF.Sampler.cellChanged(lane);
              GF.Sampler.addToListeningPool(lane);
              // this.notify('pContentChanged');
              break;
            case "workspace":
              // report up to Transport
              // this.notify('pPlayheadPosition', tick);
              tick = (data.tick - 60 < 0) ? 0 : data.tick - 60;
              this.eventlist.push(GF.Timebase.createEvent(tick, lane, 0.75));
              this.notify('pContentChanged');
              break;
          }
          break;

        // case dragged
        case "dragged":
          switch (element) {

            // draggin on workspace
            case "workspace":
              // if selection is not empty
              if (this.selectBuffer.head) {
                this.selectBuffer.iterate(function (event) {
                  event.data.lane += data.deltaLane;
                  event.data.lane = Math.max(Math.min(event.data.lane, 15), 0);
                  event.data.tick += data.deltaTick;
                  event.data.tick = Math.max(Math.min(event.data.tick, 8 * 480), 0);
                });
              }
              // with empty selection, painting events
              else {
                // expand range selection
                if (this.bRangeSelect) {
                  lane = Math.max(Math.min(lane, 15), 0);
                  tick = Math.max(Math.min(tick, 8 * 480), 0);
                  this.rangeEnd = { lane: lane, tick: tick };
                }

                // evt1 = this._findEventAtPosition(lane, tick);
                // if (evt1) {
                //   // do nothing upon existing events
                // } else {
                //   // otherwise paint events
                //   // evt1 = this.eventFilter.filter(GF.createEvent(
                //   //   lane,
                //   //   GF.mTime(0, data.tick - 60),
                //   //   { intensity: 0.75 }
                //   // ));
                //   tick = (data.tick - 60 < 0) ? 0 : data.tick - 60;
                //   this.eventlist.push(GF.createEvent(tick, lane, 0.75));
                // }
              }
              break;

            // draggin on controller
            case "controllane":
              evt1 = this._findEventAtPosition(this.params.pSelectedLane, tick);
              if (evt1) {
                evt1.data.intensity = data.value;
              }
              break;
          }
          break;

          case "released":
            switch (element) {
              case "workspace":
                // empty selection
                if (this.bRangeSelect) {
                  this._revertSelection();
                  this.rangeEnd = { lane: lane, tick: tick };
                  this._selectEvents(this.eventlist.findEventsInRange(
                    this.rangeStart.lane, this.rangeStart.tick,
                    this.rangeEnd.lane, this.rangeEnd.tick
                  ));
                  if (this.selectBuffer.head) {
                    GF.Sampler.cellChanged(this.selectBuffer.head.data.lane);
                    this.params.pSelectedLane = this.selectBuffer.head.data.lane;
                  }
                  // console.log(this.selectBuffer);
                  // console.log(this.eventlist.now.data);
                  this.notify('pContentChanged');
                  this.bRangeSelect = false;
                } else {
                  // change lane
                  GF.Sampler.cellChanged(lane);
                  this.params.pSelectedLane = lane;
                }
              break;
            }
            break;

          case "deletekey":
            this.selectBuffer.empty();
            this.notify('pContentChanged');
            break;

          case "spacekey":
            this.notify('playbackToggle');
            break;
      }
    }
  };


  // Create singleton EventView manager.
  GF.EventView.Manager = new EventManager();

  // EventView is loaded. Now it can be initialized.
  GF.notifyController('eventview_loaded');

})(WX, MUI, GF);