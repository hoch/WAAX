(function (WX) {

  // static curve size
  var kCurveSize = 65536;
  var kCenter = kCurveSize / 2;

  // saturate curve generator:
  // http://musicdsp.org/showone.php?id=42
  // TODO: need some tuning here.
  function _setSaturateCurve(curveArray, quality) {
    for (var i = kCenter, dec = 0; i < kCurveSize; i++, dec++) {
      var x = (i / kCurveSize) * 2 - 1;
      if (x < quality) {
        curveArray[i] = x;
        curveArray[kCenter-dec] = -x;
      } else {
        var c = quality + (x - quality) / (1 + ((x - quality) / (1 - quality)) ^ 2);
        curveArray[i] = c;
        curveArray[kCenter-dec] = -c;
      }
      curveArray[i] *= (1 / ((quality + 1) / 2));
      curveArray[kCenter-dec] *= (1 / ((quality + 1) / 2));
    }
  }


  /**
   * WX.Saturator
   * @note this class has the race condition issue upon array assignemnt.
   *       do expect API changes...
   */

  function Saturator(params) {
    WX.UnitBase.call(this);
    WX.UnitInput.call(this);
    WX.UnitOutput.call(this);
    WX.extend(this.params, this.defaultParams);
    WX.extend(this.params, params);

    this._nShaper = WX.nWaveShaper();
    this._nInput.connect(this._nShaper);
    this._nShaper.connect(this._nOutput);
    this._curve = new Float32Array(kCurveSize);
    this._nShaper.curve = this._curve; // this is race condition...
    this._nShaper.oversampleType = "2x";
    this._curveFactor = 0.2;

    this.setParams(this.params);
  }

  Saturator.prototype = {

    defaultParams: {
      pQuality: 1.0,
      pDrive: 1.0
    },

    _Quality: function () {
      _setSaturateCurve(this._curve, this.params.pQuality);
    },

    _Drive: function (transType, time1, time2) {
      WX.$(this._nInput.gain, this.params.pDrive, transType, time1, time2);
    }

  };

  WX.extend(Saturator.prototype, WX.UnitBase.prototype);
  WX.extend(Saturator.prototype, WX.UnitInput.prototype);
  WX.extend(Saturator.prototype, WX.UnitOutput.prototype);

  WX.Saturator = function (params) {
    return new Saturator(params);
  };

})(WX);