/**
 * Timebase: eventlist and transport for WAAX audio system
 */

window.Timebase = (function (WX) {


  /**
   * NOTES:
   * - MBT(measure, beat, tick): aka musical timebase
   * - Tick: timebase atom
   */

  // internal constants
  var TICKS_PER_BEAT = 480;

  // internal helpers
  // tick to MBT
  function tick2mbt (tick) {
    return {
      beat: ~~(tick / TICKS_PER_BEAT),
      tick: tick % TICKS_PER_BEAT
    };
  }

  // MBT to tick
  function mbt2tick (mbt) {
    return mbt.beat * TICKS_PER_BEAT + mbt.tick;
  }


  /**
   * @class    Note
   * @description NoteList linked list atom
   * @property {Number} pitch pitch (0~127)
   * @property {Number} velo  velocity (0~127)
   * @property {Number} start start time in tick
   * @property {Number} end   end time in tick
   */

  function Note() {
    this.pitch = 60;
    this.velo = 64;
    this.start = 0;
    this.end = 120;
    this.next = null;
  }

  Note.prototype = {

    get: function () {
      return {
        pitch: this.pitch,
        velo: this.velo,
        start: this.start,
        end: this.end
      };
    },

    getDuration: function () {
      return this.end - this.start;
    },

    movePitch: function (delta) {
      this.pitch += delta;
      this.pitch = WX.clamp(this.pitch, 0, 127);
    },

    moveTime: function (delta) {
      var dur = this.end - this.start;
      this.moveStart(delta);
      this.end = this.start + dur;
    },

    moveStart: function (delta) {
      this.start += delta;
      this.start = WX.clamp(this.start, 0, this.end - 1);
    },

    moveEnd: function (delta) {
      this.end += delta;
      this.end = Math.max(this.end, this.start + 1);
    },

    set: function () {
      if (WX.isObject(arguments[0])) {
        this.pitch = arguments[0].pitch;
        this.velo = arguments[0].velo;
        this.start = arguments[0].start;
        this.end = arguments[0].end;
      } else {
        this.pitch = arguments[0];
        this.velo = arguments[1];
        this.start = arguments[2];
        this.end = arguments[3];
      }
    },

    valueOf: function () {
      return this.start;
    },

    toString: function () {
      return this.pitch + ':' + this.velo + ':' + this.start + ':' + this.end;
    }

  };


  /**
   * @class  NoteList
   * @description ordered linked list implementation
   */

  function NoteList() {
    this.empty();
  }

  NoteList.prototype = {

    add: function (note) {
      // when list is empty
      if (this.head === null) {
        this.head = note;
        this.playhead = this.head;
        this.size++;
        return;
      }
      // when earlier than head
      if (note <= this.head) {
        note.next = this.head;
        this.head = note;
        this.size++;
        return;
      }
      // otherwise find the spot
      else {
        var curr = this.head;
        while (curr) {
          // if new note is later than curr
          if (curr < note) {
            if (curr.next) {
              // if note is between curr and next
              if (note <= curr.next) {
                note.next = curr.next;
                curr.next = note;
                break;
              }
            } else {
              curr.next = note;
              break;
            }
          }
          curr = curr.next;
        }
        this.size++;
        return;
      }
    },

    empty: function () {
      this.head = null;
      this.playhead = null;
      this.size = 0;
    },

    findNoteAtPosition: function (pitch, tick) {
      var curr = this.head;
      while (curr) {
        if (curr.pitch === pitch) {
          if (curr.start <= tick && tick <= curr.end) {
            return curr;
          }
        }
        curr = curr.next;
      }
      return null;
    },

    findNotesInArea: function (minPitch, maxPitch, start, end) {
      var notesInTimeSpan = this.findNotesInTimeSpan(start, end),
          notesInArea = [];
      for (var i = 0; i < notesInTimeSpan.length; i++) {
        var p = notesInTimeSpan[i].pitch;
        if (p < minPitch) continue;
        if (p > maxPitch) continue;
        notesInArea.push(notesInTimeSpan[i]);
      }
      return notesInArea;
    },

    findNotesInTimeSpan: function (start, end) {
      var curr = this.head,
          bucket = [];
      // loop
      while (curr && curr.start <= end) {
        if (start <= curr.start) {
          bucket.push(curr);
        }
        curr = curr.next;
      }
      return (bucket.length > 0) ? bucket : 0;
    },

    getSize: function () {
      return this.size;
    },

    getArray: function () {
      var curr = this.head,
          bucket = [];
      while (curr) {
        bucket.push(curr);
        curr = curr.next;
      }
      // disconnect all links
      if (bucket.length > 0) {
        for (var i = 0; i < bucket.length; i++) {
          bucket[i].next = null;
        }
        return bucket;
      } else {
        return null;
      }
    },

    iterate: function (fn) {
      var curr = this.head,
          index = 0;
      while (curr) {
        fn(curr, index++);
        curr = curr.next;
      }
    },

    remove: function (note) {
      // empty
      if (this.head === null) {
        return;
      }
      // if target note is head
      var removed;
      if (this.head === note) {
        removed = this.head;
        this.head = this.head.next;
        removed.next = null;
        this.size--;
        return removed;
      }
      // otherwise find note
      var curr = this.head;
      while (curr) {
        if (curr.next === note) {
          removed = curr.next;
          curr.next = curr.next.next;
          removed.next = null;
          this.size--;
          return removed;
        }
        curr = curr.next;
      }
      // couldn't find target
      return null;
    },

    rewind: function () {
      this.playhead = this.head;
    },

    setPlayheadAtTick: function (tick) {
      this.playhead = this.head;
      // find a note
      if (this.playhead) {
        while (this.playhead.start < tick) {
          this.playhead = this.playhead.next;
        }
      }
    },

    scan: function (end) {
      if (this.playhead) {
        var bucket = [];
        while (this.playhead.start < end) {
          bucket.push(this.playhead);
          this.playhead = this.playhead.next;
        }
        return (bucket.length > 0) ? bucket : null;
      }
    },

    // TODO:
    // load(json) : json array into linked list

    dump: function () {
      var curr = this.head,
          bucket = [];
      while (curr) {
        bucket.push(curr.toString());
        curr = curr.next;
      }
      // console.log(bucket, this.size);
      return bucket;
    }

  };


  /**
   * NOTE: DO NOT USE
   * @class NoteList_Arr
   * @description comparable data structure based on JS native array
   */

  // function NoteList_Arr() {
  //   this.data = [];
  // }

  // NoteList_Arr.prototype = {

  //   _cmp: function (a, b) {
  //     return a - b;
  //   },

  //   add: function (note) {
  //     this.data.push(note);
  //   },

  //   remove: function (note) {
  //     for (var i = 0; i < this.data.length; i++) {
  //       if (note === this.data[i]) {
  //         var removed = this.data.splice(i, 1);
  //         return removed;
  //       }
  //     }
  //   },

  //   sort: function () {
  //     // NOTE: data needs to be sorted every 100ms??
  //     this.data.sort(this._cmp);
  //   },

  //   dump: function () {
  //     var bucket = [];
  //     for (var i = 0; i < this.data.length; i++) {
  //       bucket.push(this.data[i].toString());
  //     }
  //     // console.log(bucket, this.data.length);
  //     return bucket;
  //   }

  // };


  /**
   * :: DO NOT USE, NOT TESTED ::
   * @class  NoteList_Heap
   * @description uses binary heap
   *
   *        insert    delete    search    iteration
   * OLL    O(n)      O(n)      O(n)      O(n)
   * BHeap  O(logn)   O(logn)   O(n)      O(?)
   *
   * Questions:
   * - O(?) ranged selection
   * - linear playback
   * - how does it perform on massive copy/paste
   */

  // function NoteList_Heap() {
  //   this.data = [];
  // }

  // NoteList_Heap.prototype = {

  //   _bubbleUp: function(idx) {
  //     var self = this.data[idx];
  //     while (idx > 0) {
  //       var parentIdx = Math.floor((idx + 1) / 2) - 1,
  //           parent = this.data[parentIdx];
  //       // if start time are in order, break
  //       if (self.start >= parent.start) break;
  //       // otherwise swap parent and self
  //       this.data[parentIdx] = self;
  //       this.data[idx] = parent;
  //       idx = parentIdx;
  //     }
  //   },

  //   _sinkDown: function (idx) {
  //     var len = this.data.length,
  //         self = this.data[idx];
  //     while (true) {
  //       // get indices and vars
  //       var child2Idx = (idx + 1) * 2,
  //           child1Idx = child2Idx - 1,
  //           child1, child2, swap = null;
  //       // check child 1
  //       if (child1Idx < len) {
  //         child1 = this.data[child1Idx];
  //         if (child1.start < self.start) {
  //           swap = child1Idx;
  //         }
  //       }
  //       // check child 2
  //       if (child2Idx < len) {
  //         child2 = this.data[child2Idx];
  //         if (child2.start < (swap === null ? self.start : child1.start)) {
  //           swap = child2Idx;
  //         }
  //       }
  //       // no need to swap, finish
  //       if (swap === null) break;
  //       // other wise swap and continue
  //       this.data[idx] = this.data[swap];
  //       this.data[swap] = self;
  //       idx = swap;
  //     }
  //   },

  //   _pop: function () {
  //     var first = this.data[0];
  //     var end = this.data.pop();
  //     if (this.data.length > 0) {
  //       this.data[0] = end;
  //       this._sinkDown(0);
  //     }
  //     return first;
  //   },

  //   add: function () {
  //     for (var i = 0; i < arguments.length; i++) {
  //       // add note to end, and bubble up
  //       this.data.push(arguments[i]);
  //       this._bubbleUp(this.data.length - 1);
  //     }
  //   },

  //   remove: function (note) {
  //     // search for note
  //     for (var i = 0, l = this.data.length; i < l; i++) {
  //       if (this.data[i] != note) continue;
  //       // when found, pop a note at the end
  //       var end = this.data.pop();
  //       // if popped data is what we need to remove, stop
  //       if (i === l - 1) break;
  //       // otherwise, continue
  //       this.data[i] = end;
  //       this._bubbleUp(i);
  //       this._sinkDown(i);
  //       break;
  //     }
  //   }

  // };


  /**
   * @class  Transport
   * @description singleton, manages transport and master clocking
   */

  function Transport(BPM) {

    this.BPM = BPM;
    this.oldBPM = BPM;

    // NOTES:
    // - absolute time: time expressed in audioContext time
    // - sec: linear time in seconds
    // - tick: musical time, minimum unit of MBT timebase (varies on BPM)
    // * if not specified in signature, it handles as tick (musical time)
    // * however, all the internal calculation should be in seconds

    // origin in absolute time and now reference
    // absOrigin is origin of timeline, in terms of audioContext time;
    // so absOrigin is '0' position of playhead in linear time
    this.absOrigin = 0.0;
    this.absOldNow = 0.0;

    // time references, lookahead in seconds
    this.now = 0.0;
    this.loopStart = 0.0;
    this.loopEnd = 0.0;
    this.lookahead = 0.0;

    // beats, ticks in seconds
    this.BIS = 0.0;
    this.TIS = 0.0;

    // playback queue, connected notelists, views
    this.playbackQ = [];
    this.notelists = [];
    this.views = [];

    // switches
    this.RUNNING = false;
    this.LOOP = false;
    this.USE_METRONOME = false;

    // init BPM and initiate loop
    this.setBPM(BPM);
    this._loop();
  }

  Transport.prototype = {

    /**
     * utilities
     */

    tick2sec: function (tick) {
      return tick * this.TIS;
    },

    sec2tick: function (sec) {
      return sec / this.TIS;
    },

    /**
     * setter and getter
     */

    getAbsTimeInSec: function (tick) {
      return this.absOrigin + this.tick2sec(tick);
    },

    getBPM: function () {
      return this.BPM;
    },

    getNowInSec: function () {
      return this.now;
    },

    getNow: function () {
      return this.sec2tick(this.now);
    },

    getLoopDurationInSec: function() {
      return this.loopEnd - this.loopStart;
    },

    getLoopDuration: function() {
      return this.sec2tick(this.getLoopDurationInSec());
    },

    setBPM: function (BPM) {
      this.BPM = BPM;
      var factor = this.oldBPM / this.BPM;
      this.oldBPM = this.BPM;
      // recalcualte beat in seconds, tick in seconds
      this.BIS = 60.0 / this.BPM;
      this.TIS = this.BIS / TICKS_PER_BEAT;
      // lookahead is 32 ticks (1/64th note)
      this.lookahead = this.TIS * 32;
      // update time references based on tempo change
      this.now *= factor;
      this.loopStart *= factor;
      this.loopEnd *= factor;
      this.absOrigin = WX.now - this.now;
    },

    setNowInSec: function (sec) {
      // update now and absolute origin
      this.now = sec;
      this.absOrigin = WX.now - this.now;
      // get tick of current linear now
      var tick = this.sec2tick(this.now);
      // reposition playhead for notelists at now
      for (var i = 0; i < this.notelists.length; i++) {
        this.notelists[i].setPlayheadAtTick(tick);
      }
    },

    setNow: function (tick) {
      this.setNowInSec(this.tick2sec(tick));
    },

    setLoop: function (start, end) {
      this.loopStart = this.tick2sec(start);
      this.loopEnd = this.tick2sec(end);
    },

    /**
     * NEED REDESIGN: scan and schedule
     */

    step: function () {
      // only transport is in 'play'
      if (this.RUNNING) {
        // advancing, gets new absolute now
        var absNow = WX.now;
        this.now += (absNow - this.absOldNow);
        this.absOldNow = absNow;

        // scan notes and throw them into playbackQ
        this.scanNotes();

        // TODO: schedule scanned notes
        // play(playbackQ)

        // TODO: pulse metronome
        // if (this.USE_METRONOME && this.metronome) {
        //   // if nextPulse is in lookahead range, schedule it
        //   this.metronome.play(this.now, this.lookahead);
        // }

        // ORIGINAL CODE:
        // var tick = mtime2tick(this.nextClick);
        // if (this.getLinearTime(tick) < this.ltime_now + this.lookahead) {
        //   var accent = (this.nextClick.beat % 4 === 0) ? true : false;
        //   this.metronome.play(this.getAbsoluteTime(tick), accent);
        //   this.nextClick.beat += 1;
        // }

        this.flushPlaybackQ();

        // handle looping
        if (this.LOOP) {
          if (this.loopEnd - (this.now + this.lookahead) < 0) {
            this.setNowInSec(this.loopStart - (this.loopEnd - this.now));
          }
        }
      }
    },

    // scan notes in range and advance playhead in each notelist
    scanNotes: function () {
      for (var i = 0; i < this.notelists.length; i++) {
        var end = this.sec2tick(this.now + this.lookahead);
        var notes = this.notelists[i].scan(end);
        // push notes into playbackQ
        if (notes) {
          Array.prototype.push.apply(this.playbackQ, notes);
        }
      }
    },

    setScanPosition: function (sec) {
      for (var i = 0; i < this.notelists.length; i++) {
        this.notelists[i].setPlayheadAtTick(this.sec2tick(sec));
      }
    },

    // background loop
    _loop: function () {
      // advance when transport is running
      this.step();
      // update any linked view
      this.updateView();
      // next
      requestAnimationFrame(this._loop.bind(this));
    },

    /**
     * transport
     */

    isRunning: function () {
      return this.RUNNING;
    },

    start: function () {
      // flush queue and reset scanner position
      this.playbackQ.length = 0;
      this.setScanPosition(this.now);
      // arrange time references
      var absNow = WX.now;
      this.absOrigin = absNow - this.now;
      this.absOldNow = absNow;
      // toggle switch
      this.RUNNING = true;
    },

    pause: function () {
      this.RUNNING = false;
    },

    rewind: function () {
      this.setNowInSec(0.0);
    },

    /**
     * notelists
     */

    addNoteList: function (notelist) {
      this.notelists.push(notelist);
    },

    removeNoteList: function (notelist) {
      //
    },

    flushPlaybackQ: function () {
      this.playbackQ.length = 0;
    },

    /**
     * update views
     */
    updateView: function (viewdata) {
      // send data to update view and controller (polymer element)
      for (var i = 0; i < this.views.length; i++) {
        this.views[i].update(viewdata[i]);
      }
    }

  };




  /**
   * Exports
   */

  return {

    Util: {
      tick2mbt: tick2mbt,
      mbt2tick: mbt2tick
    },

    createNote: function () {
      var n = new Note();
      n.set.apply(n, arguments);
      return n;
    },

    createNoteList: function () {
      return new NoteList();
    },

    Transport: new Transport(120)

  };

})(WX);