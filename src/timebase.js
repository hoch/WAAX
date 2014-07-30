/**
 * Timebase: eventlist and transport for WAAX audio system
 */

var Timebase = (function (WX) {


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
      return bucket;
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
      for (var i = 0; i < bucket.length; i++) {
        bucket[i].next = null;
      }
      return bucket;
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

    // step: function () {
    //   if (this.playhead) {
    //     this.playhead = this.playhead.next;
    //   }
    // },

    // rewind: function () {
    //   this.playhead = this.head;
    // },

    // setPlayheadAtTick: function (tick) {
    //   var curr = this.head;
    //   // find a note
    //   while (curr) {
    //     if (curr < tick) {
    //       curr = curr.next;
    //     } else {
    //       this.playhead = curr;
    //       return;
    //     }
    //   }
    //   // deadend
    //   this.playback = null;
    //   return;
    // },

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

  function NoteList_Arr() {
    this.data = [];
  }

  NoteList_Arr.prototype = {

    _cmp: function (a, b) {
      return a - b;
    },

    add: function (note) {
      this.data.push(note);
    },

    remove: function (note) {
      for (var i = 0; i < this.data.length; i++) {
        if (note === this.data[i]) {
          var removed = this.data.splice(i, 1);
          return removed;
        }
      }
    },

    sort: function () {
      // NOTE: data needs to be sorted every 100ms??
      this.data.sort(this._cmp);
    },

    dump: function () {
      var bucket = [];
      for (var i = 0; i < this.data.length; i++) {
        bucket.push(this.data[i].toString());
      }
      // console.log(bucket, this.data.length);
      return bucket;
    }

  };


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

  function NoteList_Heap() {
    this.data = [];
  }

  NoteList_Heap.prototype = {

    _bubbleUp: function(idx) {
      var self = this.data[idx];
      while (idx > 0) {
        var parentIdx = Math.floor((idx + 1) / 2) - 1,
            parent = this.data[parentIdx];
        // if start time are in order, break
        if (self.start >= parent.start) break;
        // otherwise swap parent and self
        this.data[parentIdx] = self;
        this.data[idx] = parent;
        idx = parentIdx;
      }
    },

    _sinkDown: function (idx) {
      var len = this.data.length,
          self = this.data[idx];
      while (true) {
        // get indices and vars
        var child2Idx = (idx + 1) * 2,
            child1Idx = child2Idx - 1,
            child1, child2, swap = null;
        // check child 1
        if (child1Idx < len) {
          child1 = this.data[child1Idx];
          if (child1.start < self.start) {
            swap = child1Idx;
          }
        }
        // check child 2
        if (child2Idx < len) {
          child2 = this.data[child2Idx];
          if (child2.start < (swap === null ? self.start : child1.start)) {
            swap = child2Idx;
          }
        }
        // no need to swap, finish
        if (swap === null) break;
        // other wise swap and continue
        this.data[idx] = this.data[swap];
        this.data[swap] = self;
        idx = swap;
      }
    },

    _pop: function () {
      var first = this.data[0];
      var end = this.data.pop();
      if (this.data.length > 0) {
        this.data[0] = end;
        this._sinkDown(0);
      }
      return first;
    },

    add: function () {
      for (var i = 0; i < arguments.length; i++) {
        // add note to end, and bubble up
        this.data.push(arguments[i]);
        this._bubbleUp(this.data.length - 1);
      }
    },

    remove: function (note) {
      // search for note
      for (var i = 0, l = this.data.length; i < l; i++) {
        if (this.data[i] != note) continue;
        // when found, pop a note at the end
        var end = this.data.pop();
        // if popped data is what we need to remove, stop
        if (i === l - 1) break;
        // otherwise, continue
        this.data[i] = end;
        this._bubbleUp(i);
        this._sinkDown(i);
        break;
      }
    }

  };


  /**
   * Timeline
   */



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
    }

  };

})(WX);