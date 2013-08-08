/**
 * GridFlux: EventManager
 */

(function (GF) {



  function _clone(obj) {
    var cloned = {};
    for (var prop in obj) {
      cloned[prop] = obj[prop];
    }
    return cloned;
  }

  function _mtime (beat, tick) {
    return {
      beat: beat + ~~(tick / 480),
      tick: tick % 480
    };
  }

  function _mtick (mTime) {
    return mTime.beat * 480 + mTime.tick;
  }



  /**
   * @class _Event
   */
  function _Event (lane, mTime, params, selected) {
    this.lane = lane;
    this.mTime = _clone(mTime);
    this.params = _clone(params);
    this.bSelected = (selected || false);
  }

  _Event.prototype = {
    setEvent: function (event) {
      this.lane = event.lane;
      this.mTime = _clone(event.mTime);
      this.params = _clone(event.params);
    },
    setLane: function (lane) {
      this.lane = lane;
    },
    setTime: function (mTime) {
      this.mTime = _clone(mTime);
    },
    setParams: function (params) {
      this.params = _clone(params);
    },
    getTick: function () {
      return _mtick(this.mTime);
    },
    moveTime: function (mTime) {
      this.mTime.beat += mTime.beat;
      this.mTime.tick += mTime.tick;
      if (this.mTime.tick >= 480) {
        this.mTime.beat += 1;
        this.mTime.tick %= 480;
      }
    },
    moveBeatTick: function (beat, tick) {
      this.mTime.beat += beat;
      this.mTime.tick += tick;
      if (this.mTime.tick >= 480) {
        this.mTime.beat += 1;
        this.mTime.tick %= 480;
      }
    },
    isEarlierThan: function (event) {
      if (_mtick(this.mTime) <= _mtick(event.mTime)) {
        return true;
      } else {
        return false
      }
    },
    select: function (bool) {
      this.bSelected = bool;
    }
  };



  /**
   * EventFilter
   */
  function _EventFilter () {
    this.quantizeAmount = 0.0;
    this.quantizeGrid = 120;

    this.swingAmount = 0.0;
    this.swingGrid = 240;
    this.kSwingFactor = -0.42000000000000004; // swing curve factor

    this.humanizeAmount = 0.0;
  }

  _EventFilter.prototype = {
    setQuantize: function (quantizeAmount) {
      this.quantizeAmount = quantizeAmount;
    },
    setSwing: function (swingAmount) {
      this.swingAmount = swingAmount;
    },
    setHumanize: function (humanizeAmount) {
      this.humanizeAmount = humanizeAmount;
    },
    process: function (event) {
      var e = new _Event(event.lane, event.mTime, event.params, event.bSelected);
      var t = e.mTime.tick;
      // quantize: visible
      if (this.quantizeAmount > 0.0) {
        var targetGrid = Math.round(t / this.quantizeGrid) * this.quantizeGrid;
        var delta = (targetGrid - t) * this.quantizeAmount;
        e.moveBeatTick(0, delta);
      }
      // swing: visible
      if (this.swingAmount > 0.0) {
        var rem = t % this.swingGrid;
        e.mTime.tick = (t - rem) + Math.pow((rem/this.swingGrid), 1 + this.kSwingFactor * this.swingAmount) * this.swingGrid;
      }
      // humanize: ...??
      // done. returning.
      return e;
    }
  };



  /**
   * @class EventList
   */
  function _EventList () {
    this.head = null;
    this.read = null;
    this.eventFilter = new _EventFilter();
    //this.eventFilter.setQuantize(1.0);
  }

  _EventList.prototype = {

    addEvent: function (event) {
      var e = new _Event(event.lane, event.mTime, event.params);
      if (this.head) {
        if (e.isEarlierThan(this.head)) {
          e.next = this.head;
          this.head = e;
          this.read = this.head;
        } else {
          this._rInsert(e, this.head);
        }
      } else {
        this.head = e;
        this.read = this.head;
      }
    },
    _rInsert: function (event, now) {
      if (now.next) {
        if (event.isEarlierThan(now.next)) {
          event.next = now.next;
          now.next = event;
          return true;
        } else {
          this._rInsert(event, now.next);
        }
      } else {
        now.next = event;
        return true;
      }
    },

    removeEvent: function (event) {
      if (event === this.head) {
        this.head = this.head.next;
      } else {
        this._rDelete(event, this.head);
      }
    },
    _rDelete: function (event, now) {
      if (event === now.next) {
        now.next = now.next.next;
        return true;
      } else {
        if (now.next) {
          this._rDelete(event, now.next);
        } else {
          return false;
        }
      }
    },

    findEventAtPosition: function (lane, mTime) {
      if (this.head) {
        return this._rFindEventAtPosition(lane, mTime, this.head);
      } else {
        return null;
      }
    },
    _rFindEventAtPosition: function (lane, mTime, now) {
      if (lane === now.lane) {
        var t = _mtick(mTime),
            start = now.getTick();
        if (start <= t && t <= start + 120) {
          return now;
        }
      }
      if (now.next) {
        return this._rFindEventAtPosition(lane, mTime, now.next);
      } else {
        return null;
      }
    },

    findEventsAtLane: function (lane) {
      var bucket = [];
      if (this.head) {
        this._rFindEventsAtLane(lane, this.head, bucket);
        return bucket;
      } else {
        return null;
      }
    },
    _rFindEventsAtLane: function (lane, now, bucket) {
      if (lane === now.lane) {
        bucket.push(this.eventFilter.process(now));
      }
      if (now.next) {
        this._rFindEventsAtLane(lane, now.next, bucket);
      } else {
        return null;
      }
    },

    setTimeAtPosition: function (mTime) {
      if (this.head) {
        return this._rSetTimeAtPosition(_mtick(mTime), this.head);
      } else {
        return null;
      }
    },
    _rSetTimeAtPosition: function (tick, now) {
      if (tick <= now.getTick()) {
        this.read = now;
        return true;
      }
      if (now.next) {
        return this._rSetTimeAtPosition(tick, now.next);
      } else {
        return false;
      }
    },

    iterate: function (callback) {
      if (this.head && typeof callback === 'function') {
        this._rIterate(callback, this.head);
      }
    },
    _rIterate: function (callback, now) {
      var filteredEvent = this.eventFilter.process(now);
      callback(filteredEvent);
      if (now.next) {
        this._rIterate(callback, now.next);
      }
    },

    getCurrentEvent: function () {
      return this.eventFilter.process(this.read);
    },
    getCurrentFilteredEvent: function () {
      return this.eventFilter.process(this.read);
    },
    advance: function () {
      if (this.read.next) {
        this.read = this.read.next;
        return true;
      } else {
        this.read = null;
        return false;
      }
    },
    reset: function () {
      this.read = this.head;
    },

    dump: function () {
      this._rDump(this.head);
    },

    _rDump: function (now) {
      console.log(now.lane, now.mTime, now.bSelected);
      if (now.next) {
        this._rDump(now.next);
      }
    },

  };



  /**
   * Factories
   */

  // mtime, mtick
  GF.Mtime = function (beat, tick) {
    return _mtime(beat, tick);
  }
  GF.Mtick = function (mTime) {
    return _mtick(mTime);
  }

  // Event
  GF.createEvent = function (lane, mTime, params) {
    return new _Event(lane, mTime, params);
  };
  GF.cloneEvent = function (event) {
    return new _Event(event.lane, event.mTime, event.params);
  };

  GF.EventList = new _EventList();

  var drawOptions = {
    selectedLane: 0,
    selectedEvents: [],
  };

  function updateView () {
    var bucket = GF.EventList.findEventsAtLane(drawOptions.selectedLane);
    GF.EventView.draw(drawOptions);
    GF.EventView.drawControlLane(bucket);
    GF.EventList.iterate(function (event) {
      GF.EventView.drawEvent(event);
    });
  }

  function emptySelection () {
    if (drawOptions.selectedEvents.length > 0) {
      drawOptions.selectedEvents.map(function (event) {
        event.select(false);
      });
      drawOptions.selectedEvents.length = 0;
    }
  }

  // callback from user interaction: state machine...
  GF.EventView.report = function (target, action, data) {
    switch (action) {
      case "clicked":
        switch (target) {
          case "lanename":
            drawOptions.selectedLane = data.lane;
            updateView();
            break
          case "workspace":
            var e = GF.EventList.findEventAtPosition(data.lane, _mtime(0, data.tick));
            if (e) {
              if (e.bSelected) {
                // if click on selected event
                // : change lane only
                drawOptions.selectedLane = data.lane;
              } else {
                // if click on unselected event without shift
                // : empty selection and select this
                emptySelection();
                e.select(true);
                drawOptions.selectedEvents.push(e);
                drawOptions.selectedLane = data.lane;
              }
            } else {
              // if click on empty area
              // : empty selection and create a new event
              emptySelection();
              var newEvent = new _Event(data.lane, _mtime(0, data.tick), { intensity: 0.75 });
              GF.EventList.addEvent(newEvent);
              drawOptions.selectedLane = data.lane;
            }
            updateView();
            break;
          case "controllane":
            var e = GF.EventList.findEventAtPosition(drawOptions.selectedLane, _mtime(0, data.tick));
            if (e) {
              e.params.intensity = data.value;
              updateView();
            }
        }
        break;
      case "shiftclicked":
        var e = GF.EventList.findEventAtPosition(data.lane, _mtime(0, data.tick));
        if (e) {
          e.select(true);
          drawOptions.selectedEvents.push(e);
          drawOptions.selectedLane = data.lane;
          updateView();
        }
        break;
      case "dragged":
        switch (target) {
          case "workspace":
            if (drawOptions.selectedEvents.length > 0) {
              // if there are selected events
              drawOptions.selectedEvents.map(function (event) {
                event.moveTime(_mtime(0, data.deltaTick));
              });
              updateView();
            } else {
              var e = GF.EventList.findEventAtPosition(data.lane, _mtime(0, data.tick));
              if (e) {
                // overlapped
              } else {
                // if no selected events: brush event
                var newEvent = new _Event(data.lane, _mtime(0, data.tick), { intensity: 0.75 });
                GF.EventList.addEvent(newEvent);
                drawOptions.selectedLane = data.lane;
                updateView();
              }
            }
            break;
          case "controllane":
            var e = GF.EventList.findEventAtPosition(drawOptions.selectedLane, _mtime(0, data.tick));
            if (e) {
              e.params.intensity = data.value;
              updateView();
            }
            break;
        }
        break;
        case "keydown":
          switch (data.action) {
            case "delete":
              if (drawOptions.selectedEvents) {
                drawOptions.selectedEvents.map(function (event) {
                  GF.EventList.removeEvent(event);
                });
                drawOptions.selectedEvents.length = 0;
                updateView();
              }
              break;
          }
          break;
    }
  };

  GF.EventView.draw(drawOptions);

})(GF);