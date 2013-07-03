/*
  Copyright 2013, Google Inc.
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are
  met:

      * Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the following disclaimer
  in the documentation and/or other materials provided with the
  distribution.
      * Neither the name of Google Inc. nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


/**
 * WX.streamer : WX.Streamer
 * @file MIDI streamer. creates MIDI data receiver and maps data to event handlers
 * @param  {int} targetPortIndex target MIDI port
 */
WX.streamer = function (targetPortIndex) {
  // initialize
  this._initialize(targetPortIndex);
};

WX.streamer.prototype = {

  /**
   * internal: initialization
   */
  _initialize: function(targetPortIndex) {
    // status and verbose mode
    this._status = false;
    this._verbose = false;
    // midi port and input
    this._input = null;
    // callbacks
    this.onNoteOn = null;
    this.onNoteOff = null;
    this.onControlChange = null;
    this.onAfterTouch = null;
    this.onPitchWheel = null;
    // get input!
    this._getInput(targetPortIndex);
  },

  /**
   * internal: setting current status
   */
  _setStatus: function(bool) {
    this._status = bool;
  },

  /**
   * internal: map incoming midi messages into event handlers
   */
  _mapInput: function (input) {
    this._input = input;
    var me = this;
    this._input.onmidimessage = function (e) {
      var d = e.data;
      // flag for first 4 bytes
      switch (d[0] >> 4) {
        // note on (pitch, velo)
        case 9:
          if (me.onNoteOn) {
            me.onNoteOn(d[1], d[2]);
          }
          break;
        // note off (pitch, velo)
        case 8:
          if (me.onNoteOff) {
            me.onNoteOff(d[1], d[2]);
          }
          break;
        // control change (ctrl no, value)
        case 11:
          if (me.onControlChange) {
            me.onControlChange(d[1], d[2]);
          }
          break;
        // channel after touch (value)
        case 13:
          if (me.onAfterTouch) {
            me.onAfterTouch(d[1]);
          }
          break;
        // pitch wheel (value)
        case 14:
          if (me.onPitchWheel) {
            me.onPitchWheel(d[1] * d[2]);
          }
          break;
        default:
          break;
      }
    };
    // activate stream
    this._setStatus(true);
  },

  /**
   * internal: getting midi input via midiAccess
   */
  _getInput: function (targetPortIndex) {
    // check MIDI support
    if (typeof navigator.requestMIDIAccess === 'undefined') {
      WX._log.error("your browser does not support Web MIDI API. halt.");
      return null;
    }
    // start request
    var me = this;
    navigator.requestMIDIAccess().then(function (midiAccess) {
      // ONSUCCESS :
      // check port index
      if (targetPortIndex >= midiAccess.inputs().length) {
        WX._log.error("invalid port index. max = " + midiAccess.inputs().length);
        return null;
      }
      var inputs = midiAccess.inputs();
      // success and return valid midi input
      me._mapInput(inputs[targetPortIndex]);
      // port stats
      if (me.verbose) {
        var counter = 0;
        console.log("# STAT PORTS: (" + inputs[counter].manufacturer + ")");
        inputs.map(function(i) {
          console.log(i.type, counter++, "\t", i.name, "\t");
        });
      }
    }, function (msg) {
      WX._log.error("failed to get MIDI access: " + msg);
    });
  }
};