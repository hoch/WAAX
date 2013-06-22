/**
 * WX.ADSR
 */
WX._unit.adsr = function (options) {
  // pre-building
  WX._unit.processor.call(this);
  // building  
  this._inputGain.connect(this._outputGain);
  this._attack = 0.005;
  this._decay = 0.015;
  this._sustain = 0.35;
  this._release = 0.05;
  this._releaseTau = this._release / this._tau;
  this._sustainOnset = 0.0;
  // bind parameter
  WX._unit.bindAudioParam.call(this, "envelope", this._inputGain.gain);
  // handling initial parameter : post-build
  this.envelope(0.0);
  this._initializeParams(options, this._default);
};

WX._unit.adsr.prototype = {
  // label
  label: "adsr",
  // time constant (-60dB)
  _tau: Math.log(0.01),
  // default
  _default: {
    attack: 0.015,
    decay: 0.015,
    sustain: 0.3,
    release: 0.05,
    gain: 1.0
  },
  // methods
  attack: function (value) {
    if (value !== undefined) {
      this._attack = value;
    } else {
      return this._attack;
    }
  },
  decay: function (value) {
    if (value !== undefined) {
      this._decay = value;
    } else {
      return this._decay;
    }
  },
  sustain: function (value) {
    if (value !== undefined) {
      value = Math.max(0.0000001, Math.min(1.0, value));
      this._sustain = value;
    } else {
      return this._sustain;
    }
  },
  release: function (value) {
    if (value !== undefined) {
      this._release = value;
      this._releaseTau = -this._release / this._tau;
    } else {
      return this._release;
    }
  },
  adsr: function (a, d, s, r) {
    this.attack(a);
    this.decay(d);
    this.sustain(s);
    this.release(r);
    return this;
  },
  noteOn: function(moment) {
    var t = (moment || WX.now),
        g = this._inputGain.gain;
    this._sustainOnset = t + this._attack + this._decay;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.0, t);
    g.linearRampToValueAtTime(1.0, t + this._attack);
    g.exponentialRampToValueAtTime(this._sustain, this._sustainOnset);
    return this;
  },
  noteOff: function(moment) {
    var t = (moment || WX.now),
        g = this._inputGain.gain;
    t = (t > this._sustainOnset) ? t : this._sustainOnset;
    //g.cancelScheduledValues(t); // ?
    g.setTargetValueAtTime(0.0, t, this._releaseTau);
    return this;
  }
};

WX._unit.extend(WX._unit.adsr.prototype, WX._unit.processor.prototype);