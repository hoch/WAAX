/**
 * @class LPF
 * @description LPF
 *
 */
WX.LPF = function(json) {
  WX.Unit.Processor.call(this);
  this.label += "LPF";
  Object.defineProperties(this, {
    _lpf: {
      enumerable: false,
      writable: false,
      value: WX._context.createBiquadFilter()
    },
    _defaults: {
      value: {
      }
    }
  });
  this._inputGain.connect(this._lpf);
  this._lpf.connect(this._outputGain);
  this._lpf.type = 0; // low-pass
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
  // exp feature
  WX.bindParam.call(this, "mcutoff", this._lpf.frequency);
  WX.bindParam.call(this, "mQ", this._lpf.Q);
};

WX.LPF.prototype = Object.create(WX.Unit.Processor.prototype, {
});