(function (WX) {

  function ADSR (params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nInput.connect(this._nOutput);

    // time constant for -60dB
    this._TimeConstant();
    this.set('pInputGain', 0.0);
    this._sustainOnset = 0.0;

    this.setParams(this.params);
  }

  ADSR.prototype = {

    defaultParams: {
      pLabel: 'ADSR',
      pAttack: 0.005,
      pDecay: 0.015,
      pSustain: 0.75,
      pRelease: 0.05,
      pTimeConstant: 0.01,
      pMode: 'polyphonic'
    },

    _TimeConstant: function () {
      this._tau = -Math.log(this.params.pTimeConstant);
    },

    setADSR: function (attack, decay, sustain, release) {
      this.setParams({
        pAttack: attack,
        pDecay: decay,
        pSustain: sustain,
        pRelease: release
      });
    },

    /**
     * logic:
     * polyphonic mode doesn't care previous note
     * monophonic mode should glide up from current gain value
     */
    noteOn: function (time) {
      var g = this._nInput.gain, p = this.params;
      time = (time || WX.now);
      this._sustainOnset = time + p.pAttack + p.pDecay;
      if (this.params.pMode === 'monophonic') {
        // NOTE: this only works in realtime.
        g.cancelScheduledValues(time);
        g.setValueAtTime(g.value, time);
        g.linearRampToValueAtTime(1.0, time + p.pAttack);
      } else {
        g.setValueAtTime(0.0, time);
        g.linearRampToValueAtTime(1.0, time + p.pAttack);
      }
      g.exponentialRampToValueAtTime(p.pSustain, this._sustainOnset);
    },

    noteOff: function (time) {
      var g = this._nInput.gain, p = this.params;
      time = (time || WX.now);
      var release = time > this._sustainOnset ? time : this._sustainOnset;
      g.cancelScheduledValues(release);
      g.setTargetAtTime(0.0001, release, p.pRelease / this._tau);
    }
  };

  WX.extend(ADSR.prototype, WX.UnitBase.prototype);
  WX.extend(ADSR.prototype, WX.UnitInput.prototype);
  WX.extend(ADSR.prototype, WX.UnitOutput.prototype);

  WX.ADSR = function (params) {
    return new ADSR(params);
  };

})(WX);