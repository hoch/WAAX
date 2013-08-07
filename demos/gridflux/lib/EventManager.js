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
  function _Event (lane, mTime, params) {
    this.lane = lane;
    this.mTime = _clone(mTime);
    this.params = _clone(params);
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
    setSwing: function (swingAmount) {
      this.swingAmount = swingAmount;
    },
    setHumanize: function (humanizeAmount) {
      this.humanizeAmount = humanizeAmount;
    },
    process: function (event) {
      var e = new _Event(event.lane, event.mTime, event.params);
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
  }

  _EventList.prototype = {

    addEvent: function (event) {
      var e = new _Event(event.lane, event.mTime, event.params);
      if (this.head) {
        if (e.isEarilerThan(this.head)) {
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
          this._rRemove(event, now.next);
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
    }

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

  // bootstrap
  GF.EventList = new _EventList();

})(GF);