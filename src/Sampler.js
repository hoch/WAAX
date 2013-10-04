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
    this._nBufferSource = null;

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

    // play sample for certain period of time and stop
    oneshot: function (time, dur) {
      if (this._buffer) {
        time = (time || WX.now);
        dur = (dur || this._buffer.duration);
        var nBufferSource = WX.nSource();
        nBufferSource.buffer = this._buffer;
        nBufferSource.connect(this._nOutput);
        var r = Math.pow(2, (this.params.pPitch - this.params.pBasePitch) / 12);
        nBufferSource.playbackRate.setValueAtTime(r, time);
        nBufferSource.start(time);
        nBufferSource.stop(time + dur);
      }
    },

    // start (and loop)
    start: function (time) {
      if (this._buffer && this._nBufferSource === null) {
        time = (time || WX.now);
        this._nBufferSource = WX.nSource();
        this._nBufferSource.buffer = this._buffer;
        this._nBufferSource.loop = this.params.pLoop;
        this._nBufferSource.connect(this._nOutput);
        var r = Math.pow(2, (this.params.pPitch - this.params.pBasePitch) / 12);
        this._nBufferSource.playbackRate.setValueAtTime(r, time);
        this._nBufferSource.start(time);
      }
    },

    stop: function (time) {
      if (this._nBufferSource) {
        time = (time || WX.now);
        this._nBufferSource.stop(time);
        this._nBufferSource = null;
      }
    }

  };

  WX.extend(Sampler.prototype, WX.UnitBase.prototype);
  WX.extend(Sampler.prototype, WX.UnitOutput.prototype);

  WX.Sampler = function (params) {
    return new Sampler(params);
  };

})(WX);