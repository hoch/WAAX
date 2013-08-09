/**
 * @namespace GF GridFlux
 */
var GF = (function () {


  /**
   * utilities
   */
  function _clone (obj) {
    var cloned = {};
    for (var prop in obj) {
      cloned[prop] = obj[prop];
    }
    return cloned;
  }
  // beat, tick => { beat, tick }
  function _mtime (beat, tick) {
    return {
      beat: beat + ~~(tick / 480),
      tick: tick % 480
    };
  }
  // { beat, tick } => ticks
  function _mtick (mTime) {
    return mTime.beat * 480 + mTime.tick;
  }


  /**
   * @class Event
   */
  function Event (lane, mTime, params, selected) {
    this.lane = lane;
    this.mTime = _clone(mTime);
    this.params = _clone(params);
    this.bSelected = (selected || false);
  }

  Event.prototype = {
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
   * @class EventList
   */
  function EventList () {
   this.head = null;
   this.read = null;
  }

  EventList.prototype = {
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
        bucket.push(now);
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
      callback(now);
      if (now.next) {
        this._rIterate(callback, now.next);
      }
    },
    getCurrentEvent: function () {
      return this.read;
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
   * @class Timeline
   */
  function Timeline (BPM) {
    // absolute origin time for current time context
    this.aOrigin = 0.0;
    // current playback position from origin time (linear)
    this.lNow = 0.0;

    // time grid
    this.BPM = (BPM || 120.0);
    this.BIS = 60.0 / this.BPM; // beat in seconds
    this.TIS = this.BIS / 480.0; // tick in seconds (1 beat = 480 tick)
    this.lookAhead = this.TIS * 5; // look ahead is 2 tick

    // states
    this.bRunning = false;
    this.bLoop = false;
    this.bUseClick = false

    // vars
    this.prevTimeStamp = 0.0;
    this.lLoopStart = 0.0;
    this.lLoopEnd = 0.0;

    // managed eventlist
    this.eventLists = [];

    // click
    this.nextClick = new _Event(1, 0, 0);
    this.metronome = new _Metronome();
  }

  Timeline.prototype = {

    getLinearTime: function (event) {
      return event.beat * this.BIS + event.tick * this.TIS;
    },

    getMusicalTime: function (time) {
      var evt = new _Event({}, ~~(time / this.BIS), ~~((time % this.BIS) / this.TIS));
      return evt;
    },

    getAbsoluteTime: function (event) {
      return this.aOrigin + this.getLinearTime(event);
    },

    setBPM: function (BPM) {
      var factor = this.BPM / BPM;
      this.BPM = BPM;
      this.BIS = 60.0 / this.BPM;
      this.TIS = this.BIS / 480.0;
      this.lNow *= factor;
      this.lLoopStart *= factor;
      this.lLoopEnd *= factor;
      this.aOrigin = WX.now - this.lNow;
    },

    setLinearNow: function (time) {
      this.lNow = time;
      this.aOrigin = WX.now - this.lNow;
      var musTime = this.getMusicalTime(time);
      this.nextClick.setTime(musTime.beat + 1, 0);

      for(var i = 0; i < this.eventLists.length; i++) {
        this.eventLists[i].setPositionAtTime(musTime);
      }
    },

    setMusicalNow: function (event) {
      var time = this.getLinearTime(event);
      this.setLinearNow(time);
    },

    setLoop: function (startEvent, endEvent) {
      this.lLoopStart = this.getLinearTime(startEvent);
      this.lLoopEnd = this.getLinearTime(endEvent);
    },

    getLoopDuration: function () {
      return this.lLoopEnd - this.lLoopStart;
    },

    enableLoop: function (bool) {
      this.bLoop = bool;
    },

    getLinearNow: function () {
      return this.lNow;
    },

    getMusicalNow: function () {
      return this.getMusicalTime(this.lNow);
    },

    advance: function () {
      if (this.bRunning) {
        this.lNow += WX.now - this.prevTimeStamp;
        this.prevTimeStamp = WX.now;

        if (this.bUseClick) {
          // TEMPORARY: check and play metronome
          var linTime = this.getLinearTime(this.nextClick);
          if (linTime < this.lNow + this.lookAhead) {
            this.metronome.play(this.aOrigin + linTime);
            this.nextClick.moveTime(1, 0);
          }
        }

        // check loop boundary
        if (this.bLoop) {
          if (this.lLoopEnd < this.lNow) {
            this.setLinearNow(this.lLoopStart);
          }
        }
      }
    },

    lookAheadEvent: function (event) {
      var linTime = this.getLinearTime(event);
      if (linTime < this.lNow + this.lookAhead) {
        return true;
      } else {
        return false;
      }
    },

    start: function () {
      this.aOrigin = WX.now - this.lNow;
      this.prevTimeStamp = WX.now;
      this.bRunning = true;
    },

    stop: function () {
      this.bRunning = false;
    },

    rewind: function () {
      this.setLinearNow(0.0);
    },

    isRunning: function () {
      return this.bRunning;
    },

    setMetronomeBuffer: function (buffer) {
      this.metronome.setBuffer(buffer);
    },

    enableMetronome: function (bool) {
      this.bUseClick = bool;
    },

    addEventList: function (eventList) {
      this.eventLists.push(eventList);
    }
  };


  // revealing
  return {
    mTime: function (beat, tick) {
      return _mtick(beat, tick);
    },
    createEvent: function (lane, mTime, params, selected) {
      return new Event(lane, mTime, params, selected);
    },
    createEventList: function () {
      return new EventList()
    },
    createTimeline: function (BPM) {
      return new Timeline(BPM);
    }
  };


})();