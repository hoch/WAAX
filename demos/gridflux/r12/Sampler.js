(function (WX) {

  function Sampler(params) {

    WX.UnitTemplate.call(this, params);
    this._removeInlet();

    WX.extend(this.params, {
      pPitch: 60,
      pBasePitch: 60,
      pLoop: false,
      pGain: 1.0,
    });

    this._buffer = null;
    this._nBufferSource = null;
    this._nOutput = WX.context.createGain();

    this._nOutput.connect(this._nActive);

    this.setParams(params);

  }

  Sampler.prototype = {

    onready: function () {
    },
    setBuffer: function (buffer) {
      if (buffer) {
        this._buffer = buffer;
        this.onready();
      }
    },
    getDuration: function () {
      return buffer ? this._buffer.duration : 0;
    },

    oneshot: function (time, dur) {
      if (this._buffer) {
        time = (time || WX.now);
        dur = (dur || this._buffer.duration);
        var nBufferSource = WX.context.createBufferSource();
        nBufferSource.buffer = this._buffer;
        nBufferSource.connect(this._nOutput);
        var r = Math.pow(2, (this.params.pPitch - this.params.pBasePitch) / 12);
        nBufferSource.playbackRate.setValueAtTime(r, time);
        nBufferSource.start(time);
        nBufferSource.stop(time + dur);
      }
    },
    start: function (time) {
      if (this._buffer && this._nBufferSource === null) {
        time = (time || WX.now);
        this._nBufferSource = WX.context.createBufferSource();
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

  WX.extend(Sampler.prototype, WX.UnitTemplate.prototype);

  WX.Sampler = function (params) {
    return new Sampler(params);
  };

})(WX);