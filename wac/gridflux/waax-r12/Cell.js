/**
 * WX.Cell
 * @note multi-sample player with channel strip; a custom WX unit
 */
(function (WX) {

  function Cell(params) {

    WX.UnitTemplate.call(this, params);
    this._removeInlet();

    WX.extend(this.params, {
      pBuffer: '',
      pActive: true,
      pTune: 0,
      pEnvActive: false,
      pEnvAttack: 0.01,
      pEnvHold: 0.01,
      pEnvRelease: 1.0,
      pFilterActive: false,
      pFilterLowFreq: 250,
      pFilterLowGain: 0.0,
      pFilterHiFreq: 5000,
      pFilterHiGain: 0.0,
      pSend1Gain: 0.0,
      pSend2Gain: 0.0,
      pSend3Gain: 0.0,
      pPanner: 0.0,
      pGain: 0.75
    });

    this._buffermap = null;
    this._buffer = null;

    this._nFilterInput = WX.nGain();
    this._nFilterLow = WX.nFilter();
    this._nFilterHi = WX.nFilter();
    this._nFilterBypass = WX.nGain();
    this._nFilterGateIn1 = WX.nGain();
    this._nFilterGateIn2 = WX.nGain();
    this._nFilterGateOut = WX.nGain();
    this._nSend1 = WX.nGain();
    this._nSend2 = WX.nGain();
    this._nSend3 = WX.nGain();

    this._nPanner = WX.nPanner();
    this._nOutput = WX.nGain();

    this._nFilterInput.connect(this._nFilterLow);
    this._nFilterLow.connect(this._nFilterHi);
    this._nFilterHi.connect(this._nFilterGateIn1);
    this._nFilterInput.connect(this._nFilterBypass);
    this._nFilterBypass.connect(this._nFilterGateIn2);
    this._nFilterGateIn1.connect(this._nFilterGateOut);
    this._nFilterGateIn2.connect(this._nFilterGateOut);
    this._nFilterGateOut.connect(this._nPanner);

    this._nPanner.connect(this._nOutput);
    this._nOutput.connect(this._nActive);

    // This works!!
    // this._nOutput.connect(WX.context.destination);

    this._nActive.connect(this._nSend1);
    this._nActive.connect(this._nSend2);
    this._nActive.connect(this._nSend3);

    this._nFilterLow.type = 'lowshelf';
    this._nFilterHi.type = 'highshelf';
    this._nPanner.panningModel = 'equalpower';

    this.dirty = true;

    this.setParams(this.params);

  }

  Cell.prototype = {

    onready: function () {
    },

    connectSends: function (sendIn1, sendIn2, sendIn3) {
      this._nSend1.connect(sendIn1);
      this._nSend2.connect(sendIn2);
      this._nSend3.connect(sendIn3);
    },

    setBuffermap: function (buffermap) {
      this._buffermap = buffermap;
    },

    _setBuffer: function (value) {
      if (this._buffermap) {
        this._buffer = this._buffermap.getBufferByName(value);
      }
    },

    _setFilterActive: function (flag) {
      if (flag) {
        this._nFilterGateIn1.gain.value = 1.0;
        this._nFilterGateIn2.gain.value = 0.0;
      } else {
        this._nFilterGateIn1.gain.value = 0.0;
        this._nFilterGateIn2.gain.value = 1.0;
      }
    },

    _setFilterLowFreq: function (value) {
      this._nFilterLow.frequency.value = value;
    },

    _setFilterLowGain: function (value) {
      this._nFilterLow.gain.value = value;
    },

    _setFilterHiFreq: function (value) {
      this._nFilterHi.frequency.value = value;
    },

    _setFilterHiGain: function (value) {
      this._nFilterHi.gain.value = value;
    },

    _setPanner: function (value) {
      this._nPanner.setPosition(value, 0, 0.5);
    },

    _setSend1Gain: function (value) {
      this._nSend1.gain.value = value;
    },

    _setSend2Gain: function (value) {
      this._nSend2.gain.value = value;
    },

    _setSend3Gain: function (value) {
      this._nSend3.gain.value = value;
    },

    getDuration: function () {
      return buffer ? this._buffer.duration : 0;
    },

    play: function (intensity, time) {
      if (!this.params.pActive || !this._buffer) {
        return;
      }

      var nBufferSource = WX.nSource();
      var nEnv = WX.nGain();
      nBufferSource.connect(nEnv);
      nEnv.connect(this._nFilterInput);
      nBufferSource.buffer = this._buffer;

      time = (time || WX.now);
      nBufferSource.playbackRate.setValueAtTime(Math.pow(2, this.params.pTune / 1200), time);
      nBufferSource.start(time);
      if (this.params.pEnvActive) {
        nEnv.gain.setValueAtTime(0.0, time);
        nEnv.gain.linearRampToValueAtTime(this.params.pGain * intensity, time + this.params.pEnvAttack);
        nEnv.gain.setValueAtTime(this.params.pGain * intensity, time + this.params.pEnvAttack + this.params.pEnvHold);
        nEnv.gain.exponentialRampToValueAtTime(0.0001,
          time + this.params.pEnvAttack + this.params.pEnvHold + this.params.pEnvRelease);
        nBufferSource.stop(time + this.params.pEnvAttack + this.params.pEnvHold + this.params.pEnvRelease);
      } else {
        nEnv.gain.setValueAtTime(this.params.pGain * intensity, time);
        nBufferSource.stop(time + this._buffer.duration);
      }
    }
  };

  WX.extend(Cell.prototype, WX.UnitTemplate.prototype);

  WX.Cell = function (params) {
    return new Cell(params);
  };

})(WX);