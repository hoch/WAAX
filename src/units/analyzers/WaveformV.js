/**
 * @class WaveformV
 * @description script processor node for visualization
 * @note tapped data is written on a ring buffer
 */

WX.WaveformV = function() {
  // calling super constructor
  WX._Unit.call(this);
  // creating unit-specific properties
  Object.defineProperties(this, {
    _tap: {
      enumerable: false,
      writable: false,
      value: WX._context.createScriptProcessor(
        WX._customUnitBufferSize, 1, 1
      )
    },
    _ringbuffer: {
      enumerable: false,
      writable: true,
      value: new WX._Internals.RingBuffer(
        WX._customUnitBufferSize, 16
      )
    },
    _mutexLock: {
      enumerable: false,
      writable: true,
      value: false
    },
    _renderCallback: {
      enumerable: false,
      writable: true,
      value: function() {}
    },
    _label: {
      enumerable: false,
      writable: false,
      value: WX._Dictionary.Custom
    }
  });
  // attaching callback function for onaudioprocess event
  var me = this;
  this._tap.onaudioprocess = function(event) {
    me._callback(event);
  };
  // performing unit-specific actions
  this._inlet.connect(this._tap);
  this._tap.connect(this._outlet);
  // connect visualization bridge to callback root
  this._outlet.connect(WX._context.destination);
  // NOTE: bypassing input signal
  // this._inlet.connect(this._outlet);
};

WX.WaveformV.prototype = Object.create(WX._Unit.prototype, {

  /**
   * callback for onaudioprocess
   * @param {object} event
   * TODO: support for stereo
   */
  _callback: {
    value: function(event) {
      // using left input buffer only
      var inputL = event.inputBuffer.getChannelData(0);
      // fill the ring buffer
      this._mutexLock = true;
      this._ringbuffer.writeBlock(inputL);
      this._mutexLock = false;
    }
  },

  /**
   * render function assignment
   * @type {function} name of render function
   * @note render with "buffer"
   */
  onRender: {
    set: function(renderFunction) {
      this._renderCallback = renderFunction;
    },
    get: function() {
      return this._renderCallback;
    }
  },

  /**
   * user-defined draw callback for rendering
   * @param {object} event from draw
   */
  render: {
    value: function() {
      if (this._mutexLock === true || this._renderCallback === undefined) {
        return;
      } else {
        // draw something with ring buffer
        // access with "buffer"
        // NOTE: investigate later
        this._renderCallback.call(this, this._ringbuffer._buffer);
      }
    }
  }
});