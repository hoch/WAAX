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
 * safety check first
 */
(function() {
  if (typeof navigator.requestMIDIAccess === "undefined") {
    throw new Error("[Ktrl] your browser does not support Web MIDI API. Halt.");
  }
})();

/**
 * @namespace Ktrl
 * @version r1
 * @author Hongchan Choi (hoch, hongchan@google.com)
 */
window.Ktrl = (function() {

  // available MIDI sources (inputs) and targets (outputs)
  var sources = [];
  var targets = [];
  // target ID counter
  var targetId = 0;

  // on ready event function
  var onready = null;
  // system-ready flag
  var status = false;
  // version
  var version = "r1";

  /**
   * @class [internal] MIDI source (input port abstraction)
   * @param {MIDIInput} midiinput MIDI input from MIDIAccess instance
   */
  function MIDISource (midiinput) {
    this.input = midiinput;
    this.targets = [];
    var me = this;
    this.input.onmidimessage = function (e) {
      var c = me.targets.length;
      while (c--) {
        me.targets[c].ondata(e);
      }
    };
  }

  // class MIDISource prototype
  MIDISource.prototype = {

    constructor: MIDISource,

    /**
     * removes a target from the source
     * @param {object} target target object to be removed
     */
    removeTarget: function (target) {
      // traverse array looking for the target and remove when found
      var me = this;
      this.targets.map(function (t) {
        if (t === target) {
          var idx = me.targets.indexOf(target);
          me.targets.splice(idx, 1);
        }
      });
    },

    /**
     * adds a target to this source (creating a connection)
     * @param {object} target target object to be added
     */
    addTarget: function (target) {
      // if target already exists, ignore
      for(var i = 0; i < this.targets.length; ++i) {
        if (this.targets[i] === target) {
          post("duplicate target.");
          return;
        }
      }
      this.targets.push(target);
    }

  };

  /**
   * @class [internal] MIDI target (MIDI receiving end abstraction)
   */
  function MIDITarget (label) {
    this.id = targetId++;
    this.label = label || "Untitled";
    this.active = false;
    this.process = function () {};
    var me = this;
    this.ondata = function(e) {
      if (me.active) {
        me.process(e);
      }
    };
    targets.push(this);
  }

  // class MIDItarget prototype
  MIDITarget.prototype = {

    constructor: MIDITarget,

    /**
     * defines message handler for "on data" event
     * @param {function} fn MIDI data handler
     */
    onData: function (fn) {
      this.process = fn;
    },

    /**
     * activates the incoming data processing
     */
    activate: function () {
      this.active = true;
    },

    /**
     * disables the incoming data processing
     */
    disable: function () {
      this.active = false;
    },

    /**
     * get target's ID number
     * @return {int} unique target ID
     */
    getID: function () {
      return this.id;
    }

  };

  /**
   * [helper, factory] creates a new MIDI target
   * @return {object} MIDI target object
   */
  function createTarget (label) {
    return new MIDITarget(label);
  }

  /**
   * routes all sources to a target
   * @param  {object} target MIDI target
   * @return {boolean} result
   */
  function routeAllToTarget (target) {
    // NOTE: this won't work after closure compilation
    // if (target.constructor.name !== "MIDITarget") {
    //   post("invalid argument. (must use MIDITarget)");
    //   return false;
    // }
    // connect all sources to the target
    sources.map(function (s) {
      s.addTarget(target);
    });
    return true;
  }

  /**
   * routes a specific source to a target
   * @param  {int} sourceId MIDI source ID (see Ktrl.report() for available ID)
   * @param  {object} target MIDI target
   * @return {boolean} result
   */
  function routeSourceToTarget (sourceId, target) {
    // check id first
    if (sourceId < sources.length) {
      // remove target from all sources
      sources.map(function (s) {
        s.removeTarget(target);
      });
      // connect a source to target
      sources[sourceId].addTarget(target);
      return true;
    } else {
      post("invalid source id or target.");
      return false;
    }
  }

  /**
   * disconnect a target from all sources (while not removing)
   * @param  {MIDITarget} target a target to be disconnected
   * @return {boolean} result
   */
  function disconnectTarget (target) {
    // NOTE: this won't work after closure compilation
    // if (target.constructor.name !== "MIDITarget") {
    //   post("invalid argument. (must use MIDITarget)");
    //   return false;
    // }
    sources.map(function (s) {
      s.removeTarget(target);
    });
    return true;
  }

  /**
   * disconnect and remove a target from the system
   * @param  {MIDITarget} target a target to be disconnected
   * @return {boolean} result
   */
  function removeTarget (target) {
    // disconnect first
    if (Ktrl.disconnectTarget(target)) {
      // remove target from system wide target pool
      targets.map(function (t) {
        if (t === target) {
          var idx = targets.indexOf(target);
          targets.splice(idx, 1);
        }
      });
      return true;
    } else {
      return false;
    }
  }

  /**
   * [helper] defines onReady function
   * @param {function} fn user-defined function
   */
  function ready (fn) {
    if (typeof fn !== 'function') {
      post("invalid handler function.");
    } else {
      onready = fn;
    }
  }

  /**
   * [helper] reports available input ports
   */
  function report () {
    var counter = 0;
    post("listing available MIDI Input Ports...");
    sources.map(function (s) {
      console.log(s.input.type, counter++, "\t", s.input.name, "\t", s.input.manufacturer);
    });
    post("listing available MIDI targets...");
    targets.map(function (t) {
      console.log("id " + t.id, "\t", t.label, "\t", t.active);
    });
  }

  /**
   * [helper] post message with the library tag
   * @param  {string} msg log message
   */
  function post (msg) {
    console.log("[ktrl] " + msg);
  }

  /**
   * [helper] parses MIDI message
   * @param  {array} midimsg 3-bytes MIDI message
   * @return {object} parsed MIDI message (see below for property names)
   *
   * ["noteoff", "noteon"]: { type, channel, pitch, velocity }
   * ["polypressure"]: { type, channel, pitch, pressure }
   * ["controlchange"]: { type, channel, control, value }
   * ["programchange"]: { type, channel, program }
   * ["channelpressure"]: { type, channel, pressure }
   * ["pitchwheel"]: { type, channel, wheel }
   */
  parse = function (midimsg) {
    var data = midimsg.data;
    var type = data[0] >> 4;
    var channel = (data[0] & 0x0F) + 1;
    var parsedData;
    switch (type) {
      case 8:
        parsedData = {
          type: "noteoff",
          channel: channel,
          pitch: data[1],
          velocity: data[2]
        };
        break;
      case 9:
        parsedData = {
          type: "noteon",
          channel: channel,
          pitch: data[1],
          velocity: data[2]
        };
        break;
      case 10:
        parsedData = {
          type: "polypressure",
          channel: channel,
          pitch: data[1],
          pressure: data[2]
        };
        break;
      case 11:
        parsedData = {
          type: "controlchange",
          channel: channel,
          control: data[1],
          value: data[2]
        };
        break;
      case 12:
        parsedData = {
          type: "programchange",
          channel: channel,
          program: data[1]
        };
        break;
      case 13:
        parsedData = {
          type: "channelpressure",
          channel: channel,
          pressure: data[1]
        };
        break;
      case 14:
        parsedData = {
          type: "pitchwheel",
          channel: channel,
          wheel: (data[1] << 8 | data[2])
        };
        break;
    }
    return parsedData;
  };

  // ENTRY POINT: scan input port and boot up
  navigator.requestMIDIAccess().then(function (midiAccess) {
    // check input ports
    if (midiAccess.inputs().length === 0) {
      post("no input ports available");
      return;
    }
    // creating MIDI sources
    for(var i = 0; i < midiAccess.inputs().length; ++i) {
      sources[i] = new MIDISource(midiAccess.inputs()[i]);
    }
    post("Ktrl (" + version + ") is ready.");
    status = true;
    if (typeof onready === 'function') {
      onready();
    } else {
      post("onReady is not specified.");
    }
  }, function (msg) {
    post("failed to get MIDI access: " + msg);
    status = false;
    return;
  });

  // exposes handles
  return {
    createTarget: createTarget,
    removeTarget: removeTarget,
    disconnectTarget: disconnectTarget,
    routeAllToTarget: routeAllToTarget,
    routeSourceToTarget: routeSourceToTarget,
    ready: ready,
    parse: parse,
    report: report
  };

})();