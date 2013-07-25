// WAAX unit: Multiverb
(function(WX) {

  // class definition
  function wx_pro_multiverb(options) {

    WX._unit.processor.call(this);

    this._ready = false;
    this._bufferMap = null;

    this._convolver = WX.context.createConvolver();
    this._dry = WX.context.createGain();
    this._wet = WX.context.createGain();
    this._inputGain.connect(this._convolver);
    this._inputGain.connect(this._dry);
    this._convolver.connect(this._wet);
    this._dry.connect(this._outputGain);
    this._wet.connect(this._outputGain);

    // post-building: parameter binding and initialization
    WX._unit.bindAudioParam.call(this, "dry", this._dry.gain);
    WX._unit.bindAudioParam.call(this, "wet", this._wet.gain);
    // initializing (final phase)
    this._initializeParams(options, this._default);
  }

  wx_pro_multiverb.prototype = {
    label: "multiverb",
    _default: {
      mix: 0.0
    },
    isReady: function () {
      return this._ready;
    },
    setBufferMap: function (buffermap) {
      this._bufferMap = buffermap;
    },
    setBufferByName: function (name) {
      this._convolver.buffer = this._bufferMap.getBufferByName(name);
    },
    setBufferByIndex: function (index) {
      this._convolver.buffer = this._bufferMap.getBufferByIndex(index);
    },
    mix: function (mix, moment, type) {
      if (mix !== undefined) {
        this.dry(1.0 - mix, moment, type);
        return this.wet(mix, moment, type);
      } else {
        return this.wet();
      }
    }
  };

  WX._unit.extend(wx_pro_multiverb.prototype, WX._unit.processor.prototype);

  WX.Multiverb = function(options) {
    return new wx_pro_multiverb(options);
  };

})(WX);