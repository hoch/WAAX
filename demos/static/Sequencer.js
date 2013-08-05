(function (WX) {

  /**
   * @method _clone
   */
  function _clone(obj) {
    var cloned = {};
    for (var prop in obj) {
      cloned[prop] = obj[prop];
    }
    return cloned;
  }




  /**
   * @class Event
   * @description linear-time-agnostic musical event data
   */

  function _Event(data, beat, tick) {
    this.data = _clone(data);
    this.beat = beat;
    this.tick = tick;
    this.bSelected = false;
    this.next = null;
  }

  _Event.prototype = {
    getTick: function () {
      return this.beat * 480 + this.tick;
    },
    setData: function (data) {
      this.data = _clone(data);
    },
    setTime: function (beat, tick) {
      this.beat = beat;
      this.tick = (tick || 0);
    },
    moveTime: function (deltaBeat, deltaTick) {
      this.beat += deltaBeat;
      this.tick += (deltaTick || 0);
    },
    select: function (bool) {
      this.bSelected = bool;
    }
  };




  /**
   * @class _Metronome (internal, singleton)
   * @description internal metronome object
   */

  function _Metronome() {
    this.buffer = null;
    this.volume = 0.75;
  }

  _Metronome.prototype = {
    setBuffer: function (buffer) {
      this.buffer = buffer;
    },
    play: function (time) {
      var source = WX.context.createBufferSource();
      var volume = WX.context.createGain();
      source.connect(volume);
      volume.connect(WX.context.destination);
      source.buffer = this.buffer;
      volume.gain.setValueAtTime(this.volume, time);

      source.start(time);
      source.stop(time + source.buffer.duration);
    }
  }




  /**
   * @class EventList
   * @description time-ordered linked list for events
   */

  WX.EventList = function () {
    this.head = null;
    this.read = null;
    this.onchange = function () {};
  }

  WX.EventList.prototype = {

    createEvent: function (data, beat, tick) {
      var event = new _Event(data, beat, tick);
      if (this.head) {
        if (event.getTick() <= this.head.getTick()) {
          event.next = this.head;
          this.head = event;
          this.read = this.head;
        } else {
          this._recInsert(event, this.head);
        }
      } else {
        this.head = event;
        this.read = this.head;
      }
      this.onchange();
    },

    deleteEvent: function (event) {
      if (event === this.head) {
        this.head = this.head.next;
      } else {
        this._recRemove(event, this.head);
      }
      this.onchange();
    },

    findEvent: function (event) {
      if (this.head) {
        return this._recFindEvent(event, this.head);
      } else {
        return null;
      }
    },

    setPositionAtTime: function (event) {
      if (this.head) {
        return this._recSetPositionAtTime(event, this.head);
      } else {
        return null;
      }
    },

    iterate: function (callback) {
      if (this.head && typeof callback === 'function') {
        this._recIterate(callback, this.head);
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

    _recInsert: function (event, now) {
      if (now.next) {
        if (event.getTick() <= now.next.getTick()) {
          event.next = now.next;
          now.next = event;
          return true;
        } else {
          this._recInsert(event, now.next);
        }
      } else {
        now.next = event;
        return true;
      }
    },

    _recRemove: function (event, now) {
      if (event === now.next) {
        now.next = now.next.next;
        return true;
      } else {
        if (now.next) {
          this._recRemove(event, now.next);
        } else {
          return false;
        }
      }
    },

    _recFindEvent: function (event, now) {
      if (event.data.pitch === now.data.pitch) {
        var t = event.getTick(),
            start = now.getTick();
        if (start <= t && t <= start + 120) {
          return now;
        }
      }
      if (now.next) {
        return this._recFindEvent(event, now.next);
      } else {
        return null;
      }
    },

    _recSetPositionAtTime: function (event, now) {
      if (event.getTick() <= now.getTick()) {
        this.read = now;
        return true;
      }
      if (now.next) {
        return this._recSetPositionAtTime(event, now.next);
      } else {
        return false;
      }
    },

    _recIterate: function (callback, now) {
      //debugger;
      callback(now);
      if (now.next) {
        this._recIterate(callback, now.next);
      }
    },

    dump: function () {
      this._recDump(this.head);
    },

    _recDump: function (now) {
      console.log(now.data, now.beat, now.tick);
      if (now.next) {
        this._recDump(now.next);
      }
    },

    setOnChange: function (fn) {
      if (typeof fn === 'function') {
        this.onchange = fn;
      }
    }
  };




  /**
   * @class Timeline (singleton)
   * @description 3 layers of time context: absolute => linear => musical
   */
  WX.Timeline = function (BPM) {
    // absolute origin time for current time context
    this.aOrigin = 0.0;
    // current playback position from origin time (linear)
    this.lNow = 0.0;

    // time grid
    this.BPM = 120.0;
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

  WX.Timeline.prototype = {

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
  }

})(WX);