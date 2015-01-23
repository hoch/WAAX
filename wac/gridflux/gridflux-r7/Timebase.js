// Timebase
// : Implements Event, EventList, Metronome, Timeline

GF.Timebase = { ID: 'Timebase' };

(function () {

  // konstants
  var kTicksPerBeat = 480;

  // helpers
  function clone(obj) {
    var cloned = {};
    for (var prop in obj) {
      cloned[prop] = obj[prop];
    }
    return cloned;
  }

  function tick2mtime(tick) {
    return {
      beat: ~~(tick / kTicksPerBeat),
      tick: tick % kTicksPerBeat
    };
  }

  function mtime2tick(mtime) {
    return mtime.beat * kTicksPerBeat + mtime.tick;
  }


  // @class Event
  // @param {Object} data data object { tick, lane, intensity }
  function Event(data) {
    this.data = data;
    this.next = null;
  }

  Event.prototype = {
    setData: function (data) {
      this.data.tick = data.tick;
      this.data.lane = data.lane;
      this.data.intensity = data.intensity;
    },
    setTick: function (tick) {
      this.data.tick = tick;
    },
    setLane: function (lane) {
      this.data.lane = lane;
    },
    setIntensity: function (intensity) {
      this.data.intensity = intensity;
    },
    moveTick: function (tickDelta) {
      this.data.tick += tickDelta;
      this.data.tick = Math.max(this.data.tick, 0);
    },
    moveLane: function (laneDelta) {
      this.data.lane += laneDelta;
      this.data.lane = Math.max(Math.min(this.data.lane, 15), 0);
    },
    isolate: function () {
      this.next = null;
    }
  };


  // @class Eventlist
  function EventList() {
    this.head = null;
    this.now = null;
  }

  EventList.prototype = {

    push: function (event) {
      // empty
      if (this.head === null) {
        this.head = event;
        return;
      }
      // insert at head
      if (event.data.tick < this.head.data.tick) {
        event.next = this.head;
        this.head = event;
        return;
      }
      // iterate
      else {
        var cur = this.head;
        while (cur) {
          if (cur.data.tick < event.data.tick) {
            if (cur.next) {
              if (event.data.tick <= cur.next.data.tick) {
                event.next = cur.next;
                cur.next = event;
                break;
              }
            } else {
              cur.next = event;
              break;
            }
          }
          cur = cur.next;
        }
        return;
      }
    },

    remove: function (event) {
      // empty
      if (this.head === null) {
        return;
      }
      // the head event
      var removed = null;
      if (this.head === event) {
        removed = this.head;
        this.head = this.head.next;
        return removed;
      }
      // iterate
      var cur = this.head;
      while (cur) {
        if (cur.next === event) {
          removed = cur.next;
          cur.next = cur.next.next;
          return removed;
        }
        cur = cur.next;
      }
      // couldn't find
      return removed;
    },

    iterate: function (fn) {
      var cur = this.head;
      var counter = 0;
      while (cur) {
        fn(cur, counter++);
        cur = cur.next;
      }
    },

    advance: function () {
      if (this.now) {
        this.now = this.now.next;
      }
    },

    reset: function () {
      this.now = this.head;
    },

    empty: function () {
      this.head = null;
      this.now = null;
    },

    setPositionAtTick: function (tick) {
      // empty
      if (this.head === null) {
        this.now = null;
        return;
      }
      // iterate
      var cur = this.head;
      while (cur) {
        if (cur.data.tick < tick) {
          cur = cur.next;
        } else {
          this.now = cur;
          return;
        }
      }
      // if couldn't find event between 'tick' and the end
      this.now = null;
      return;
    },

    getEventAtNow: function () {
      return this.now;
    },

    findEventsAtLane: function (lane) {
      var events = [];
      var cur = this.head;
      while (cur) {
        if (cur.data.lane === lane) {
          events.push(cur);
        }
        cur = cur.next;
      }
      return events;
    },

    findEventAtPosition: function (lane, tick) {
      var cur = this.head;
      while (cur) {
        if (cur.data.lane === lane) {
          if (cur.data.tick <= tick && tick <= cur.data.tick + 120) {
            return cur;
          }
        }
        cur = cur.next;
      }
      return null;
    },

    findEventsInRange: function (lane1, tick1, lane2, tick2) {
      var events = [];
      var cur = this.head;
      // sort out range
      var minLane, maxLane, minTick, maxTick;
      if (lane1 <= lane2) {
        minLane = lane1;
        maxLane = lane2;
      } else {
        minLane = lane2;
        maxLane = lane1;
      }
      if (tick1 <= tick2) {
        minTick = tick1;
        maxTick = tick2;
      } else {
        minTick = tick2;
        maxTick = tick1;
      }
      while (cur) {
        if (minLane <= cur.data.lane && cur.data.lane <= maxLane) {
          if (minTick <= cur.data.tick && cur.data.tick <= maxTick) {
            events.push(cur);
          }
        }
        cur = cur.next;
      }
      return events;
    },

    serialize: function () {
      var events = [];
      var cur = this.head;
      while (cur) {
        events.push(cur);
        cur = cur.next;
      }
      for (var i = 0; i < events.length; i++) {
        events[i].isolate();
      }
      return events;
    },

    dump: function (msg) {
      // console.log(msg);
      var cur = this.head;
      while (cur) {
        // console.log(cur.data.lane, cur.data.tick.toFixed(0.5));
        cur = cur.next;
      }
    }
  };


  // @class EventFilter
  // Implements realtime event processor. (quantizing, swing)
  function EventFilter() {
    this.kSwingFactor = -0.42000000000000004; // swing curve factor
    this.kSwingGrid = kTicksPerBeat * 0.5; // 8th
    this.kQuantizeGrid = kTicksPerBeat * 0.25; // 16th
    this.params = {
      pSwing: 0.0,
      pQuantize: 0.0
    };
  }

  EventFilter.prototype = {
    setParam: function (paramName, value) {
      this.params[paramName] = value;
    },

    // process event and return data (strip out linked list structure)
    process: function (event) {
      // 'selected' is not necessary, only data
      var evt = new Event(clone(event.data));
      // quantize
      if (this.params.pQuantize) {
        var disp = evt.data.tick % this.kQuantizeGrid;
        if (disp < this.kQuantizeGrid * 0.5) {
          evt.data.tick -= disp * this.params.pQuantize;
        } else {
          evt.data.tick += (this.kQuantizeGrid - disp) * this.params.pQuantize;
        }
      }
      // swing
      if (this.params.pSwing) {
        var rem = evt.data.tick % this.kSwingGrid;
        evt.data.tick = (evt.data.tick - rem) + Math.pow((rem / this.kSwingGrid), 1 + this.kSwingFactor * this.params.pSwing) * this.kSwingGrid;
      }
      return evt.data;
    }
  };


  /**
   * @class  Metronome
   */
  function Metronome() {
    this.buffer = null;
    this.volume = 0.75;
  }

  Metronome.prototype = {
    setBuffer: function (buffer) {
      this.buffer = buffer;
    },
    play: function (time, accent) {
      var source = WX.context.createBufferSource();
      var volume = WX.context.createGain();
      source.connect(volume);
      volume.connect(WX.context.destination);
      source.buffer = this.buffer;
      if (accent) {
        source.playbackRate.value = 1.0;
        volume.gain.setValueAtTime(this.volume, time);
      } else {
        source.playbackRate.value = 0.75;
        volume.gain.setValueAtTime(this.volume * 0.25, time);
      }
      source.start(time);
      source.stop(time + source.buffer.duration);
    }
  };



  /**
   * @class Timeline
   */
  function Timeline (BPM) {

    // state for saving/loading
    this.params = {
      pBPM: (BPM || 120.0),
      pLoop: false,
      pMetronome: false
    };

    this._oldBPM = BPM;
    this._setBPM();

    // absoute origin
    this.atime_origin = 0.0;
    // linear time vars (in second, but on the relative term)
    this.ltime_now = 0.0;
    this.ltime_loopStart = 0.0;
    this.ltime_loopEnd = 0.0;

    // etc
    this.bRunning = false;
    this.prevTimeStamp = 0.0;

    // related eventlist
    this.eventlists = [];
    // playback queue
    this.playbackQueue = [];

    // metronome
    this.nextClick = { beat:0, tick: 0 };
    this.metronome = new Metronome();
  }

  Timeline.prototype = {

    // return time from tick
    getLinearTime: function (tick) {
      return tick * this.TIS;
    },

    // return tick from time
    getMusicalTime: function (time) {
      return time / this.TIS;
    },

    getAbsoluteTime: function (tick) {
      return this.atime_origin + this.getLinearTime(tick);
    },

    getLoopDuration: function () {
      return this.ltime_loopEnd - this.ltime_loopStart;
    },

    isRunning: function () {
      return this.bRunning;
    },

    setLinearNow: function (time) {
      // re-arrange linear now and absolute origin
      this.ltime_now = time;
      this.atime_origin = WX.now - time;
      // set up the event lists from now
      var tick = this.getMusicalTime(time);
      for (var i = 0; i < this.eventlists.length; i++) {
        this.eventlists[i].setPositionAtTick(tick);
      }
      // set metronome for next beat
      this.nextClick = tick2mtime(tick);
      this.nextClick.beat += 1;
      this.nextClick.tick = 0;
    },

    setMusicalNow: function (tick) {
      this.setLinearNow(this.getLinearTime(tick));
    },

    // reset event position (when the content of EL is changed)
    resetEventlistPosition: function () {
      var tick = this.getMusicalTime(this.ltime_now);
      for (var i = 0; i < this.eventlists.length; i++) {
        this.eventlists[i].setPositionAtTick(tick);
      }
    },

    dump: function () {
      for (var i = 0; i < this.eventlists.length; i++) {
        this.eventlists[i].dump(i + " =====");
        // console.log("now = ", this.eventlists[i].now);
      }
    },

    getLinearNow: function () {
      return this.ltime_now;
    },

    getMusicalNow: function () {
      return this.getMusicalTime(this.ltime_now);
    },

    setLoop: function (mtime_start, mtime_end) {
      this.ltime_loopStart = this.getLinearTime(mtime2tick(mtime_start));
      this.ltime_loopEnd = this.getLinearTime(mtime2tick(mtime_end));
    },

    _setBPM: function () {
      // console.log(this.params.pBPM);
      // NOTE: this.params.pBPM is
      var factor = this._oldBPM / this.params.pBPM;
      this._oldBPM = this.params.pBPM;
      this.BIS = 60.0 / this.params.pBPM;
      this.TIS = this.BIS / kTicksPerBeat;
      this.lookahead = this.TIS * 20; // lookahead is 20 ticks

      this.ltime_now *= factor;
      this.ltime_loopStart *= factor;
      this.ltime_loopEnd *= factor;
      this.atime_origin = WX.now - this.ltime_now;
    },

    setParam: function (paramName, value) {
      switch (paramName) {
        case 'pBPM':
          this.params.pBPM = value;
          this._setBPM();
          break;
        case 'pLoop':
          this.params.pLoop = value;
          break;
        case 'pMetronome':
        this.params.pMetronome = value;
          break;
      }
    },

    advance: function () {
      if (this.bRunning) {
        var atime_now = WX.now;
        this.ltime_now += (atime_now - this.prevTimeStamp);
        this.prevTimeStamp = atime_now;

        if (this.params.pMetronome) {
          var tick = mtime2tick(this.nextClick);
          if (this.getLinearTime(tick) < this.ltime_now + this.lookahead) {
            var accent = (this.nextClick.beat % 4 === 0) ? true : false;
            this.metronome.play(this.getAbsoluteTime(tick), accent);
            this.nextClick.beat += 1;
          }
        }

        if (this.params.pLoop) {
          var diff = this.ltime_loopEnd - (this.ltime_now + this.lookahead);
          if (diff < 0) {
            this.setLinearNow(this.ltime_loopStart - (this.ltime_loopEnd - this.ltime_now));
          }
        }
      }
    },

    scheduleEvents: function () {
      for (var i = 0; i < this.eventlists.length; i++) {
        var evt = this.eventlists[i].getEventAtNow();
        while (evt) {
          if (this.getLinearTime(evt.data.tick) < this.ltime_now + this.lookahead) {
            this.playbackQueue.push(evt);
            this.eventlists[i].advance();
            evt = this.eventlists[i].getEventAtNow();
          } else {
            break;
          }
        }
      }
    },

    start: function () {
      // flush playqueue first
      this.flushPlaybackQueue();
      // arrange time variables
      var atime_now = WX.now;
      this.atime_origin = atime_now - this.ltime_now;
      this.prevTimeStamp = atime_now;
      this.bRunning = true;
    },

    stop: function () {
      this.bRunning = false;
    },

    rewind: function() {
      this.setLinearNow(0.0);
    },

    addEventList: function (eventlist) {
      this.eventlists.push(eventlist);
    },

    getPlaybackQueue: function () {
      return this.playbackQueue;
    },

    flushPlaybackQueue: function () {
      this.playbackQueue.length = 0;
    },

    setMetronomeSound: function (buffer) {
      this.metronome.setBuffer(buffer);
    }

  };

  
  // Timebase public methods.
  
  GF.Timebase.mtime2tick = mtime2tick;

  GF.Timebase.tick2mtime = tick2mtime;

  GF.Timebase.createEvent = function (tick, lane, intensity) {
    return new Event({ tick: tick, lane: lane, intensity: intensity });
  };

  GF.Timebase.createEventList = function () {
    return new EventList();
  };

  GF.Timebase.createEventFilter = function () {
    return new EventFilter();
  };

  GF.Timebase.createTimeline = function (BPM) {
    return new Timeline(BPM);
  };

  // Timebase is loaded. Now it can be initialized.
  GF.notifyController('timebase_loaded');

})(WX);