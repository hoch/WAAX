(function (WX) {

  /**
   * WX.Sampler
   */

  function Sampler(params) {
    WX.UnitBase.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._buffer = null;

    // a list of active source nodes, removed from this list when the
    // `onended` event is fired.
    //
    // NOTE: This implementation is not meant to be a polyphonic sampler,
    // although it could evolve into one.  This list of active nodes is just
    // maintained so the nodes have time to finish and call `onended` before
    // they are removed from the heap.  It also allows `stop` to be called
    // multiple times, because we wait until the sound actually finishes
    // to remove the reference to the node.
    this._nBufferSources = [];

    this.setParams(params);
  }

  Sampler.prototype = {

    defaultParams: {
      pPitch: 60,
      pBasePitch: 60,
      pLoop: false,
      pGain: 1.0
    },

    onload: function () {},

    /**
     *  User overrideable `onended` callback for when a node is finished.
     **/
    onended: function () {},

    setBuffer: function (buffer) {
      // TODO: is this working on other browsers?
      if (buffer.constructor.name === 'AudioBuffer') {
        this._buffer = buffer;
        this.onload();
      }
    },

    getDuration: function () {
      return this._buffer ? this._buffer.duration : 0;
    },

    /**
     *  Actual source node `onended` callback for the passed-in node.
     *
     *  @param  {BufferSourceNode}  nBufferSource - The node that will use
     *  this as its `onended` callback.
     **/
    _createOnendedCallback: function (nBufferSource) {
      var me = this;

      return function () {
        // remove node from our list
        me._removeSourceNode(nBufferSource);

        // call our user-overrideable onended callback
        me.onended();
      };
    },

    /**
     *  Create a new BufferSourceNode to play at a certain time.
     *
     *  @param  {Number}  time - Absolute time this node will play.
     *  @param  {Boolean}  loop - The value to set the loop property of the
     *  node
     **/
    _createSourceNode: function (time, loop) {
      var nBufferSource = WX.nSource(),
        r = Math.pow(2, (this.params.pPitch - this.params.pBasePitch) / 12);
      
      time = (time || WX.now);
      nBufferSource.buffer = this._buffer;
      nBufferSource.connect(this._nOutput);
      nBufferSource.playbackRate.setValueAtTime(r, time);
      nBufferSource.loop = loop;
      nBufferSource.start(time);
      
      // add node to our list
      this._nBufferSources.push(nBufferSource);
      
      // handle node life end
      nBufferSource.onended = this._createOnendedCallback(nBufferSource);

      return nBufferSource;
    },

    /**
     *  Remove buffer source node from our list of active nodes.
     *  Called when a buffer node ends.
     *
     *  @param  {BufferSourceNode}  node - The node we are removing from the
     *  list.
     **/
    _removeSourceNode: function (node) {
      var i;
      
      for (i = 0; i < this._nBufferSources.length; i++) {
        if (this._nBufferSources[i] == node) {
          this._nBufferSources.splice(i, 1);
          return;
        }
      }

    },

    // play sample for certain period of time and stop
    oneshot: function (time, dur) {
      var nBufferSource;

      if (this._buffer) {
        dur = (dur || this._buffer.duration);
        nBufferSource = this._createSourceNode(time, false);
        nBufferSource.stop(time + dur);
      }
    },

    // start (and loop)
    start: function (time) {
      var nBufferSource;

      if (this._buffer) {
        nBufferSource = this._createSourceNode(time, this.params.pLoop);
      }
    },

    /**
     *  Stops all nodes.  When the nodes actually stop rendering, their
     *  `onended` callback will be fired and they will be removed from
     *  the list.
     **/
    stop: function (time) {
      var i;

      if (this._nBufferSources.length) {
        for (i = 0; i < this._nBufferSources.length; i++) {
          this._nBufferSources[i].stop(time);
        }
      }
    }

  };

  WX.extend(Sampler.prototype, WX.UnitBase.prototype);
  WX.extend(Sampler.prototype, WX.UnitOutput.prototype);

  WX.Sampler = function (params) {
    return new Sampler(params);
  };

})(WX);
