(function (WX) {

  // DC offset of 1 second for step function
  var dcOffset = WX.nBuffer(1, WX.context.sampleRate, WX.context.sampleRate);
  var temp = new Float32Array(WX.context.sampleRate);
  for(var i = 0; i < WX.context.sampleRate; ++i) {
    temp[i] = 1.0;
  }
  dcOffset.getChannelData(0).set(temp, 0);


  /**
   * WX.Step
   * @desc control signal (DC offset) generator
   */

  function Step(params) {
    WX.UnitBase.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nStep = WX.nSource();
    this._nStep.connect(this._nOutput);
    this._nStep.buffer = dcOffset;
    this._nStep.loop = true;
    this._nStep.loopEnd = 1.0;

    this.setParams(this.params);

    this._nStep.start(WX.now);
  }

  Step.prototype = {

    defaultParams: {
      pLabel: 'Step',
      pGain: 1.0
    },

    stop: function (time) {
      this._nStep.stop(time || WX.now);
    }

  };

  WX.extend(Step.prototype, WX.UnitBase.prototype);
  WX.extend(Step.prototype, WX.UnitOutput.prototype);

  WX.Step = function (params) {
    return new Step(params);
  };

})(WX);