(function (WX) {

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

  // 4bytes uid generator
  function uid4(){
    var t = performance.now();
    var id = 'xxxx'.replace(/[x]/g, function(c) {
      var r = (t + Math.random()*16) % 16 | 0;
      t = Math.floor(t/16);
      return (c == 'x' ? r : (r & 0x7|0x8)).toString(16);
    });
    return id;
  }

  // class Note
  function Note(pitch, velocity, start, dur) {
    this.pitch = (pitch || 60);
    this.velocity = (velocity || 100);
    this.start = (start || 0);
    this.dur = (dur || 120);
  }

  Note.prototype = {

    setNote: function (note) {
      this.pitch = note.pitch;
      this.velocity = note.velocity;
      this.start = note.start;
      this.dur = note.dur;
    },

    getEnd: function () {
      return this.start + this.dur;
    },

    translatePitch: function (delta) {
      this.pitch += delta;
      this.pitch = WX.clamp(this.pitch, 0, 127);
    },

    translateStart: function (delta) {
      this.start += delta;
      this.start = Math.max(this.start, 0);
    },

    translateDur: function (delta) {
      this.dur += delta;
      this.dur = Math.max(this.dur, 60);
    },

    toString: function () {
      return this.pitch + ',' + this.velocity + ',' +
        this.start + ',' + this.dur;
    }

  };


  /**
   * @class NoteMap
   */
  function NoteMap() {
    this.notes = {};
    this.size = 0;
  }

  NoteMap.prototype = {

    clear: function () {
      this.notes = {};
      this.size = 0;
    },

    delete: function (id) {
      if (this.notes.hasOwnProperty(id)) {
        var note = this.notes[id];
        delete this.notes[id];
        this.size--;
        return note;
      }
      return null;
    },

    get: function (id) {
      if (this.notes.hasOwnProperty(id)) {
        return this.notes[id];
      }
      return null;
    },

    push: function (note) {
      var id = uid4();
      while (this.notes.hasOwnProperty(id)) {
        id = uid4();
      }
      this.notes[id] = note;
      this.size++;
      return id;
    },

    set: function (id, note) {
      if (this.notes.hasOwnProperty(id)) {
        this.notes[id].setNote(note);
      } else {
        this.notes[id] = note;
      }
    },

    // NOTE: this returns IDs, not actual note object
    findNoteIdAtPosition: function (pitch, tick) {
      for (var id in this.notes) {
        var note = this.notes[id];
        if (note && note.pitch === pitch) {
          if (note.start <= tick && tick <= note.start + note.dur) {
            return id;
          }
        }
      }
      return null;
    },

    findNotesIdInArea: function (minPitch, maxPitch, startTick, endTick) {
      var bucket = [];
      for (var id in this.notes) {
        var note = this.notes[id];
        if (note) {
          if (minPitch <= note.pitch && note.pitch <= maxPitch) {
            if (startTick <= note.start && note.start <= endTick) {
              bucket.push(id);
            }
          }
        }
      }
      return (bucket.length > 0) ? bucket : null;
    },

    // NOTE: this returns note, not note id
    scanNotesInTimeSpan: function (start, end) {
      var bucket = [];
      for (var id in this.notes) {
        var note = this.notes[id];
        if (note) {
          if (start <= note.start && note.start <= end) {
            bucket.push(note);
          }
        }
      }
      return (bucket.length > 0) ? bucket : null;
    },

    iterate: function (callback) {
      var index = 0;
      for (var id in this.notes) {
        callback(id, this.notes[id], index++);
      }
    },

    getSize: function () {
      return this.size;
    },

    hasId: function (id) {
      return this.notes.hasOwnProperty(id);
    }

  };


  /**
   * @class NoteList
   */
  function NoteList() {
    this.notes = [];
    this.diffScore = 0;
  }

  NoteList.prototype = {

    empty: function () {
      this.notes.length = 0;
      this.diffScore = 0;
    },

    add: function (note) {
      this.notes.push(note);
      this.diffScore += 1;
      this.rearrange();
    },

    update: function (index, note) {
      if (index < this.notes.length && this.notes[index]) {
        this.notes[index].setNote(note);
      }
    },

    remove: function (note) {
      var idx = this.notes.indexOf(note);
      if (idx > -1) {
        this.notes[idx] = null;
      }
      this.diffScore += 2;
      this.rearrange();
      return idx;
    },

    removeNoteAtIndex: function (index) {
      if (index < this.notes.length) {
        this.notes[index] = null;
      }
    },

    rearrange: function () {
      // if (this.diffScore > 50) {
      //   // this._lockData();
      //   this.notes = this.notes.filter(function (note) {
      //     return note !== null;
      //   }).sort(function (a, b) {
      //     return a.start - b.start;
      //   });
      //   this.diffScore = 0;
      //   // this._unlockData();
      // }
    },

    findNoteAtPosition: function (pitch, tick) {
      for (var i = 0; i < this.notes.length; i++) {
        var note = this.notes[i];
        if (note && note.pitch === pitch) {
          if (note.start <= tick && tick <= note.start + note.dur) {
            return note;
          }
        }
      }
      return null;
    },

    findNotesInTimeSpan: function (start, end) {
      var bucket = [];
      for (var i = 0; i < this.notes.length; i++) {
        var note = this.notes[i];
        if (note) {
          if (start <= note.start && note.start <= end) {
            bucket.push(note);
          }
        }
      }
      return (bucket.length > 0) ? bucket : null;
    },

    scanNotes: function (start, end) {
      return this.findNotesInTimeSpan(start, end);
    },

    iterate: function (callback) {
      for (var i = 0; i < this.notes.length; i++) {
        callback(i, this.notes[i]);
      }
    }

  };



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

    this.scanStart = 0.0;
    this.scanEnd = this.lookahead;
    this.needsScan = true;

    // beats, ticks in seconds
    this.BIS = 0.0;
    this.TIS = 0.0;

    // playback queue, connected notelists, views
    this.playbackQ = [];
    this.notelists = [];
    this.notemaps = [];
    // plugin target
    this.targets = [];
    // mui element: pianoroll or score
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
      this.lookahead = this.TIS * 16;
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
      // // reposition playhead for notelists at now
      // for (var i = 0; i < this.notelists.length; i++) {
      //   this.notelists[i].setPlayheadAtTick(tick);
      // }
    },

    setNow: function (tick) {
      this.setNowInSec(this.tick2sec(tick));
    },

    setLoop: function (start, end) {
      this.loopStart = this.tick2sec(start);
      this.loopEnd = this.tick2sec(end);
    },

    setScanRange: function (forced) {
      if (forced) {
        this.scanStart = this.now;
        this.scanEnd =  this.scanStart + this.lookahead;
        this.needsScan = true;
      } else if (this.scanEnd - this.now <- 0.0167) {
        this.scanStart = this.scanEnd;
        this.scanEnd = this.now + this.lookahead;
        this.needsScan = true;
      }
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
        this.sendData();

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
      if (this.needsScan) {
        var start = this.sec2tick(this.scanStart),
            end = this.sec2tick(this.scanEnd);
        // iterate multiple notemap
        for (var i = 0; i < this.notemaps.length; i++) {
          // var notes = this.notelists[i].scanNotes(start, end);
          var notes = this.notemaps[i].scanNotesInTimeSpan(start, end);
          // push note into playbackQ
          if (notes) {
            for (var j = 0; j < notes.length; j++) {
              if (this.playbackQ.indexOf(notes[j]) < 0) {
                this.playbackQ.push(notes[j]);
              }
            }
          }
        }
        this.needsScan = false;
      }
      // set up next scan if reached the end (check for every 16.7ms)
      this.setScanRange();
    },

    // TEMPORARY!!!!
    sendData: function () {
      for (var i = 0; i < this.playbackQ.length; i++) {
        var note = this.playbackQ[i],
            start = this.absOrigin + this.tick2sec(note.start),
            end = start + this.tick2sec(note.dur);
        this.targets[0].onData('noteon', {
          pitch: note.pitch,
          velocity: note.velocity,
          time: start
        });
        this.targets[0].onData('noteoff', {
          pitch: note.pitch,
          velocity: 0,
          time :end
        });
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
      this.flushPlaybackQ();
      // this.setScanPosition(this.now);
      // arrange time references
      var absNow = WX.now;
      this.absOrigin = absNow - this.now;
      this.absOldNow = absNow;
      // toggle switch
      this.RUNNING = true;
      this.setScanRange(true);
    },

    pause: function () {
      this.RUNNING = false;
      this.flushPlaybackQ();
    },

    rewind: function () {
      this.setNowInSec(0.0);
      this.setScanRange(true);
    },

    /**
     * notelists
     */

    addNoteList: function (notelist) {
      this.notelists.push(notelist);
    },

    addNoteMap: function (notemap) {
      this.notemaps.push(notemap);
    },

    flushPlaybackQ: function () {
      this.playbackQ.length = 0;
    },

    addView: function (muiElement) {
      this.views.push(muiElement);
      muiElement._transport = this;
    },

    /**
     * update views
     */
    updateView: function () {
      // send data to update view and controller (polymer element)
      for (var i = 0; i < this.views.length; i++) {
        this.views[i].setPlayhead(this.sec2tick(this.now));
      }
    },

    addTarget: function (plugin) {
      this.targets.push(plugin);
    }

  };


  /**
   * exports
   */
  WX.Note = function (pitch, velocity, start, dur) {
    return new Note(pitch, velocity, start, dur);
  };

  WX.NoteList = function () {
    return new NoteList();
  };

  WX.NoteMap = function () {
    return new NoteMap();
  };

  WX.Transport = new Transport(120);

})(WX);