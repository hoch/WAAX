(function (WX) {

  // static curve size
  var kCurveSize = 65536;
  var kCenter = kCurveSize / 2;

  // helper function
  function hCurveSaturateDX(curveArray, factor) {
    for (var i = kCenter, dec = 0; i < kCurveSize; i++, dec++) {
      var x = (i / kCurveSize) * 2 - 1;
      if (x < factor) {
        curveArray[i] = x;
        curveArray[kCenter-dec] = -x;
      } else {
        var c = factor + (x - factor) / (1 + ((x - factor) / (1 - factor)) ^ 2);
        curveArray[i] = c;
        curveArray[kCenter-dec] = -c;
      }
      curveArray[i] *= (1 / ((factor + 1) / 2));
      curveArray[kCenter-dec] *= (1 / ((factor + 1) / 2));
    }
  }

  // curve functions
  // function _curveHardClip(x, factor) {
  //   return WX.clamp(x, -factor, factor);
  // }

  // function _curveSoftClip(x, factor) {
  //   return Math.atan(x) / Math.PI * factor;
  // }

  // function _curveSaturate(x, factor) {
  //   return 0.95 * Math.sin(factor / 0.95 * x);
  // }

  // function _curveSaturateDX(x, factor) {
  //   return
  // }


  function Saturator(params) {

    WX.UnitTemplate.call(this, params);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nInput = WX.nGain();
    this._nShaper = WX.nWaveShaper();
    this._nOutput = WX.nGain();

    this._curve = new Float32Array(kCurveSize);
    this._nShaper.curve = this._curve;
    this._nShaper.oversampleType = "2x";
    this._curveFactor = 0.2;

    this.inlet.connect(this._nInput);
    this._nInput.connect(this._nShaper);
    this._nShaper.connect(this._nOutput);
    this._nOutput.connect(this._nActive);

    this.setParams(this.params);

  }

  Saturator.prototype = {

    defaultParams: {
      pQuality: 1.0,
      pDrive: 1.0
    },

    _setQuality: function (value) {
      hCurveSaturateDX(this._curve, value);
    },

    _setDrive: function (value, transType, time1, time2) {
      WX.setAudioParam(this._nInput.gain, value, transType, time1, time2);
    }

  };

  WX.extend(Saturator.prototype, WX.UnitTemplate.prototype);

  WX.Saturator = function (params) {
    return new Saturator(params);
  };

})(WX);