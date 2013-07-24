// WAAX unit: Dist
      (function (WX) {

        // static curve size
        var _curveSize = 65536;

        // internal utility functions
        function _curveHardClip (x, factor) {
          return WX.clamp(x, -factor, factor);
        }
        function _curveSoftClip (x, factor) {
          return Math.atan(x) / Math.PI * factor;
        }
        function _curveSaturate (x, factor) {
          return 0.95 * Math.sin(factor / 0.95 * x);
        }

        // class definition
        function wx_pro_distortion (options) {

          WX._unit.processor.call(this);

          this._curveType = "hardclip";
          this._curve = new Float32Array(_curveSize);
          this._factor = 0.9;
          this._setCurve(this._curve, this._curveType, this._factor);

          this._shaper = WX.context.createWaveShaper();
          this._shaper.curve = this._curve;
          this._shaper.oversampleType = "2x";

          this._setCurve();

          this._inputGain.connect(this._shaper);
          this._shaper.connect(this._outputGain);


          WX._unit.bindAudioParam.call(this, "drive", this._inputGain.gain);

          this._initializeParams(options, this._default);
        }

        wx_pro_distortion.prototype = {
          label: "dist",
          _default: {
            drive: 1.0
          },
          _setCurve: function () {
            var n2 = _curveSize / 2, kernel;
            switch (this._curveType) {
              case "hardclip":
                kernel = _curveHardClip;
                break;
              case "softclip":
                kernel = _curveSoftClip;
                break;
              case "saturate":
                kernel = _curveSaturate;
                break;
            }
            for (var i = 0; i < _curveSize; i++) {
              var x = (i - n2) / n2;
              this._curve[i] = kernel(x, this._factor);
            }
          },
          curveType: function (type) {
            this._curveType = type;
            this._setCurve();
          },
          factor: function (factor) {
            this._factor = factor;
            this._setCurve();
          },
          getCurve: function () {
            return this._curve;
          }
        };

        WX._unit.extend(wx_pro_distortion.prototype, WX._unit.processor.prototype);

        WX.Dist = function (options) {
          return new wx_pro_distortion(options);
        };

      })(WX);