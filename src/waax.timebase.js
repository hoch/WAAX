// Copyright 2011-2014 Hongchan Choi. All rights reserved.
// Use of this source code is governed by MIT license that can be found in the
// LICENSE file.

/**
 * @typedef MBST
 * @description Measure, beat, sixteenth, tick aka musical timebase.
 * @type {Object}
 * @property {Number} measure Measure.
 * @property {Number} beat Beat.
 * @property {Number} sixteenth Sixteenth.
 * @property {Number} tick Tick.
 */

// MBT - measure, beat, sixteenth, tick aka musical timebase.
// Tick - atomic unit for musical timebase.
// Second - unit for linear timebase.
var _TICKS_PER_BEAT = 480,
    _TICKS_PER_MEASURE = _TICKS_PER_BEAT * 4,
    _TICKS_PER_SIXTEENTH = _TICKS_PER_BEAT * 0.25;

// internal: unique ID for notes/events (4 bytes uid generator)
// see: http://stackoverflow.com/a/8809472/4155261
function generate_uid4(){
  var t = Date.now();
  var id = 'xxxx'.replace(/[x]/g, function(c) {
    var r = (t + Math.random() * 16) % 16 | 0;
    t = Math.floor(t / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return id;
}

/**
 * Note abstraction. Instantiated by {@link WX.Note}.
 * @name Note
 * @class
 * @param {Number} pitch MIDI pitch.
 * @param {Number} velocity MIDI velocity.
 * @param {Number} start Start time in tick.
 * @param {Number} duration Note durtion in tick.
 */
function Note(pitch, velocity, start, duration) {
  this.pitch = (pitch || 60);
  this.velocity = (velocity || 100);
  this.start = (start || 0);
  this.duration = (duration || 120);
}

Note.prototype = {

  /**
   * Changes note duration by delta.
   * @memberOf Note
   * @param  {Number} delta Duration.
   */
  changeDuration: function (delta) {
    this.duration += ~~(delta);
    this.duration = Math.max(this.duration, 1);
  },

  /**
   * Returns the note end time in tick.
   * @memberOf Note
   * @return {Number}
   */
  getEnd: function () {
    return this.start + this.duration;
  },

  /**
   * Sets note properties from a note.
   * @memberOf Note
   * @param {Note} note
   */
  setNote: function (note) {
    for (var prop in note) {
      this[prop] = note[prop];
    }
  },

  /**
   * Moves note pitch by delta.
   * @memberOf Note
   * @param  {Number} delta Pitch displacement.
   */
  translatePitch: function (delta) {
    this.pitch += ~~(delta);
    this.pitch = WX.clamp(this.pitch, 0, 127);
  },

  /**
   * Moves note pitch by delta.
   * @memberOf Note
   * @param  {Number} delta Pitch displacement.
   */
  translateStart: function (delta) {
    this.start += ~~(delta);
    this.start = Math.max(this.start, 0);
  },

  /**
   * Returns current properties in a string.
   * @memberOf Note
   * @return {String}
   */
  toString: function () {
    return this.pitch + ',' + this.velocity + ',' +
      this.start + ',' + this.duration;
  },

  /**
   * Returns start time for numeric operation.
   * @memberOf Note
   * @return {Number}
   */
  valueOf: function () {
    return this.start;
  }

};


/**
 * NoteClip abstraction. A collection of Note objects. Instantiated by 
 *   WX.NoteClip.
 * @name NoteClip
 * @class
 */
function NoteClip() {
  this._init();
}

NoteClip.prototype = {

  // Initializes or resets note clip.
  _init: function () {
    this.notes = {};
    this.start = 0;
    this.end = 0;
    this.size = 0;
  },

  /**
   * Deletes and returns a note from clip. Returns null when not found.
   * @memberOf NoteClip
   * @param  {String} id Note ID.
   * @return {Note | null}
   */
  delete: function (id) {
    if (this.notes.hasOwnProperty(id)) {
      var note = this.notes[id];
      delete this.notes[id];
      this.size--;
      return note;
    }
    return null;
  },

  /**
   * Flush out noteclip content.
   * @memberOf NoteClip
   */
  empty: function () {
    this.notes = {};
    this.size = 0;
  },

  /**
   * Find a note that contains a point specified by pitch and tick. Then
   *   returns note ID. Returns null when not found.
   *   Note that this impl might produce an undesirable result since it
   *   simply catches the first note detected in the iteration. There is no
   *   perfect solution over this problem, so I chose to make it robust
   *   instead.
   * @memberOf NoteClip
   * @param  {Number} pitch MIDI pitch
   * @param  {Number} tick Position in tick.
   * @return {String | null}
   */
  findNoteIdAtPosition: function (pitch, tick) {
    for (var id in this.notes) {
      var note = this.notes[id];
      if (note && note.pitch === pitch) {
        if (note.start <= tick && tick <= note.getEnd()) {
          return id;
        }
      }
    }
    return null;
  },

  /**
   * Find notes in a area specified by pitch and tick. Then returns an array
   *   of notes. Returns null when nothing in target area.
   *   Note that this method only care for start time of note. If a note
   *   starts before than the area, it will not be included in the selection.
   * @memberOf NoteClip
   * @param  {Number} minPitch Lower bound pitch.
   * @param  {Number} maxPitch Upper bound pitch.
   * @param  {Number} startTick Start time in tick.
   * @param  {Number} endTick End time in tick.
   * @return {Array | null}
   */
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

  /**
   * Returns note from clip with id.
   * @memberOf NoteClip
   * @param  {String} id Note ID.
   * @return {Object}
   */
  get: function (id) {
    if (this.hasId(id)) {
      return this.notes[id];
    }
    return null;
  },

  /**
   * Retunrs an array with all the ID of notes.
   * @memberOf NoteClip
   * @return {Array}
   */
  getAllId: function () {
    return Object.keys(this.notes);
  },

  /**
   * Returns clip size.
   * @memberOf NoteClip
   * @return {Number}
   */
  getSize: function () {
    return this.size;
  },

  /**
   * Probes clip with note id.
   * @memberOf NoteClip
   * @param  {String} id Note id.
   * @return {Boolean} True if clip contains the note.
   */
  hasId: function (id) {
    return this.notes.hasOwnProperty(id);
  },

  /**
   * Iterates all the notes with callback function.
   * @memberOf NoteClip
   * @param  {callback_noteclip_iterate} callback Process for iteration.
   */
  iterate: function (callback) {
    var index = 0;
    for (var id in this.notes) {
      callback(id, this.notes[id], index++);
    }
  },

  /**
   * Callback for note clip interation. Called by NoteClip.iterate.
   * @callback callback_noteclip_iterate
   * @param {String} id Note ID.
   * @param {Note} Note object.
   * @param {Number} index Iteration index.
   * @see NoteClip.iterate
   */

  /**
   * Pushes a new note into clip. Returns ID of the new note.
   * @memberOf NoteClip
   * @param  {Note} note
   * @return {String} Note ID.
   */
  push: function (note) {
    var id;
    do {
      id = generate_uid4();
    } while (this.hasId(id));
    this.notes[id] = note;
    this.size++;
    return id;
  },

  /**
   * Set a note with a specific ID. If the same ID found, update properties
   *   of the note. Otherwise, create a new note with a specified ID. Usually
   *   this method is used in the collaborative context.
   * @memberOf NoteClip
   * @param {String} id Note ID.
   * @param {Note} note Note object.
   */
  set: function (id, note) {
    if (this.hasId(id)) {
      this.notes[id].setNote(note);
    } else {
      this.notes[id] = note;
    }
  },

  /**
   * Returns an array of notes within a timespan. Returns null when not found.
   *   Note that this method actually returns Note objects, not IDs.
   * @memberOf NoteClip
   * @param  {Number} start Start time in tick.
   * @param  {Number} end End time in tick.
   * @return {Array | null}
   */
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
  }
};


//
// Router class should be here.
//


// NOTES:
// absolute time: time in audioContext
// sec: linear time in seconds
// tick: musical time, atomic unit of MBT timebase (varies on BPM)
// * if not specified in method signature, it is handled as tick
//   all the internal calculation should be in seconds

/**
 * Transport abstraction. Singleton and instantiated by default.
 * @name Transport
 * @class
 * @param {Number} BPM Beat per minute.
 */
function Transport(BPM) {
  this._init(BPM || 120);
}

Transport.prototype = {
  // TEMPORARY
  _flushPlaybackQueue: function () {
    this._playbackQueue.length = 0;
  },

  // Sets current playhead position by seconds (audioContext).
  _setPlayheadPosition: function (second) {
    this._now = second;
    this._absOrigin = WX.now - this._now;
  },

  // Scans notes in current scan range.
  _scheduleNotesInScanRange: function () {
    if (this._needsScan) {
      var notes = null;
      if (this._source) {
        notes = this._source.scanNotesInTimeSpan(
          this.sec2tick(this._scanStart),
          this.sec2tick(this._scanEnd)
        );
      }
      // push notes into playbackQueue
      if (notes) {
        for (var i = 0; i < notes.length; i++) {
          if (this._playbackQueue.indexOf(notes[i]) < 0) {
            this._playbackQueue.push(notes[i]);
          }
        }
      }
      this._needsScan = false;
    }
    // send queued notes to target plug-ins
    if (this._playbackQueue.length > 0) {
      for (var i = 0; i < this._playbackQueue.length; i++) {
        var note = this._playbackQueue[i],
            start = this._absOrigin + this.tick2sec(note.start),
            end = start + this.tick2sec(note.dur);
        // schedule notes by onData method
        // this.targets[0].onData('noteon', {
        //   pitch: note.pitch,
        //   velocity: note.velocity,
        //   time: start
        // });
        // this.targets[0].onData('noteoff', {
        //   pitch: note.pitch,
        //   velocity: 0,
        //   time :end
        // });
      }
    }
  },

  // Move the scan range of scan forward by runner.
  _advanceScanRange: function () {
    // Advances the scan range to the next block, if the scan end point is
    // close enough (< 16.7ms) to playhead.
    if (this._scanEnd - this._now < 0.0167) {
      this._scanStart = this._scanEnd;
      this._scanEnd = this._scanStart + this._lookAhead;
      this._needsScan = true;
    }
  },

  // Reset the scan range based on current playhead position.
  _resetScanRange: function () {
    this._scanStart = this._now;
    this._scanEnd =  this._scanStart + this._lookahead;
    this._needsScan = true;
  },

  // Update assigned transport MUI element. update data:
  // MBST format of now_t, loopEnd, loopStart, BPM
  _updateView: function () {

  },

  // Runs the transport (update every 16.7ms)
  _run: function () {
    // console.log(this._now);
    if (this._RUNNING) {
      // add time elapsed to now_t by checking now_ac
      var absNow = WX.now;
      this._now += (absNow - this._absLastNow);
      this._absLastNow = absNow;
      // scan notes in range
      this._scheduleNotesInScanRange();
      // advance when transport is running
      this._advanceScanRange();
      // update transport view
      this._updateView();
      // flush played notes
      this._flushPlaybackQueue();
      // check loop flag
      if (this._LOOP) {
        if (this._loopEnd - (this._now + this._lookAhead) < 0) {
          this._setPlayheadPosition(this._loopStart - (this._loopEnd - this._now));
        }
      }

      // TODO
      // Transport should have a router (note clips > in-out > plug-in)
      // 0. iterate through the router entries
      // 1. note clip entry in router -> get target plug-in
      // 2. scan note clips
      // 3. send data to plug-in
      //
      // if there is any registered plug-in for metronome
      // schedule metronome as well

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
      
    }
    // schedule next step
    requestAnimationFrame(this._run.bind(this));
  },

  // initializing transport with BPM
  _init: function (BPM) {
    // origin in absolute time and 'now' reference
    this._BPM = BPM;
    this._lastBPM = BPM;

    // beats/ticks in seconds
    this._BIS = 0.0;
    this._TIS = 0.0;

    // origin by audio context time
    // it is '0' position of playhead in linear time
    this._absOrigin = 0.0;
    this._absLastNow = 0.0;

    // now, loop, lookAhead by transport time
    this._now = 0.0;
    this._loopStart = 0.0;
    this._loopEnd = 0.0;
    this._lookAhead = 0.0;

    // playback scan range and dirty flag
    this._scanStart = 0.0;
    this._scanEnd = this._lookAhead;
    this._needsScan = true;

    // transport view element
    this._transportView = null;

    // TEMPORARY
    this._playbackQueue = [];
    this._source = null; // noteclip
    this._target = null; // plug-in

    // switches
    this._RUNNING = false;
    this._LOOP = false;
    this._USE_METRONOME = false;

    // set BPM and initiate runner
    this.setBPM(BPM);
    this._run();
  },


  // Transport Public Methods
  //
  // NOTE: the max integer in JavaScript is 9007199254740992.
  // With this number as ticks, the maximum offset of a note is
  // { measure: 1145324612, beat: 1, sixteenth: 0, tick: 32 }
  // It is about 38177487 minutes in BPM of 120. (~636291 hours, ~26512 days)
  // So, this number is good enough to cover general music making.
  //
  // Having separated notation like { measure, beat, sixteenth, tick } is
  // not really necessary. It is easy to translate both way when it's needed.
  // (i.e. displaying timing data on UI.)

  /**
   * Converts tick to second based on transport tempo.
   * @memberOf Transport
   * @param  {Number} tick Tick (atomic musical time unit)
   * @return {Number}
   */
  tick2sec: function (tick) {
    return tick * this._TIS;
  },

  /**
   * Converts second to tick based on transport tempo.
   * @memberOf Transport
   * @param  {Number} sec Second
   * @return {Number}
   */
  sec2tick: function (sec) {
    return sec / this._TIS;
  },

  /**
   * Starts playback.
   * @memberOf Transport
   */
  start: function () {
    // Arrange time references.
    var absNow = WX.now;
    this._absOrigin = absNow - this._now;
    this._absLastNow = absNow;
    // Reset scan range.
    this._resetScanRange();
    // Transport is running.
    this._RUNNING = true;
  },

  /**
   * Pauses current playback.
   * @memberOf Transport
   */
  pause: function () {
    this._RUNNING = false;
    this._flushPlaybackQueue();
  },

  /**
   * Sets playhead position by tick.
   * @memberOf Transport
   * @param {Number} tick Playhead position in ticks.
   */
  setNow: function (tick) {
    this._setPlayheadPosition(this.tick2sec(tick));
    this._resetScanRange();
  },

  /**
   * Returns playhead position by tick.
   * @memberOf Transport
   * @return {Number}
   */
  getNow: function () {
    return this.sec2tick(this._now);
  },

  /**
   * Rewinds playhead to the beginning.
   * @memberOf Transport
   */
  rewind: function () {
    this._setPlayheadPosition(0.0);
  },

  /**
   * Sets loop start position by tick.
   * @memberOf Transport
   * @param {Number} tick Loop start in tick.
   */
  setLoopStart: function (tick) {
    this._loopStart = this.tick2sec(tick);
  },

  /**
   * Sets loop end position by tick.
   * @memberOf Transport
   * @param {Number} tick Loop end in tick.
   */
  setLoopEnd: function (tick) {
    this._loopEnd = this.tick2sec(tick);
  },

  /**
   * Returns loop start by tick.
   * @memberOf Transport
   * @return {Number}
   */
  getLoopStart: function () {
    return this.sec2tick(this._loopStart);
  },

  /**
   * Returns loop end by tick.
   * @memberOf Transport
   * @return {Number}
   */
  getLoopEnd: function () {
    return this.sec2tick(this._loopEnd);
  },

  /**
   * Toggles or sets loop status.
   * @memberOf Transport
   * @param  {Boolean|undefined} bool Loop state. If undefined, it toggles the current state.
   */
  toggleLoop: function (bool) {
    if (bool === undefined) {
      this._LOOP = !this._LOOP;
    } else {
      if (WX.isBoolean(bool)) {
        this._LOOP = bool;
      } else {
        WX.Log.error('Invalid parameter. Use boolean value.');
      }
    }
  },

  /**
   * Sets transport BPM.
   * @memberOf Transport
   * @param {Number} BPM Beat per minute.
   */
  setBPM: function (BPM) {
    // calculates change factor
    this._BPM = (BPM || 120);
    var factor = this._lastBPM / this._BPM;
    this._lastBPM = this._BPM;
    // recalcualte beat in seconds, tick in seconds
    this._BIS = 60.0 / this._BPM;
    this._TIS = this._BIS / _TICKS_PER_BEAT;
    // lookahead is 16 ticks (1/128th note)
    this._lookAhead = this._TIS * 16;
    // update time references based on tempo change
    this._now *= factor;
    this._loopStart *= factor;
    this._loopEnd *= factor;
    this._absOrigin = WX.now - this._now;
  },

  /**
   * Returns current BPM.
   * @memberOf Transport
   * @return {Number}
   */
  getBPM: function () {
    return this._BPM;
  },

  /**
   * Returns current running status of transport.
   * @memberOf Transport
   * @return {Boolean}
   */
  isRunning: function () {
    return this._RUNNING;
  }

};

/**
 * Converts MBST(measure, beat, sixteenth, tick) format to tick.
 * @memberOf WX
 * @param  {MBST} Musical time in MBST format.
 * @return {Number} Musical time in tick.
 */
WX.mbst2tick = function (mtime) {
  return (mtime.measure || 0) * _TICKS_PER_MEASURE +
    (mtime.beat || 0) * _TICKS_PER_BEAT +
    (mtime.sixteenth || 0) * _TICKS_PER_SIXTEENTH +
    (mtime.tick || 0);
};

/**
 * Converts tick to MBST(measure, beat, sixteenth, tick) format.
 * @memberOf WX
 * @param  {Number} tick Tick.
 * @return {MBST} Musical time in MBST format.
 */
WX.tick2mbst = function (tick) {
  return {
    measure: ~~(tick / _TICKS_PER_MEASURE),
    beat: ~~((tick % _TICKS_PER_MEASURE) / _TICKS_PER_BEAT),
    sixteenth: ~~((tick % _TICKS_PER_BEAT) / _TICKS_PER_SIXTEENTH),
    tick: ~~(tick % _TICKS_PER_SIXTEENTH)
  };
};

/**
 * Creates a Note instance.
 * @memberOf WX
 * @param  {Number} pitch MIDI pitch (0~127)
 * @param  {Number} velocity MIDI velocity (0~127)
 * @param  {Number} start Note start time in tick.
 * @param  {Number} duration Note durtion in tick.
 * @return {Note}
 */
WX.Note = function (pitch, velocity, start, duration) {
  return new Note(pitch, velocity, start, duration);
};

/**
 * Create a NoteClip instance.
 * @memberOf WX
 * @return {NoteClip}
 */
WX.NoteClip = function () {
  return new NoteClip();
};

/**
 * Singleton instance of Transporter.
 * @type {Transport}
 */
WX.Transport = new Transport(120);