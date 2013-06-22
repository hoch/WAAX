// Skeleton: Generator


/**
 * sample constructor
 * @param  {object} options option parameters
 */
WX._unit.internal_unitname = function (options) {

  // pre-build: generator wrapper
  WX._unit.generator.call(this);

  // build: declare parameters
  this._param1 = null;
  // build: create WAA nodes
  this._node = WX.context.createOscillator();
  // build: making connections
  this._node.connect(this._outputGain);
  // build: create callback if needed (i.e. xhr buffer loading)
  var me = this;
  this._oncomplete = function(obj) {
  };

  // post-build: bind parameters
  WX._unit.bindAudioParam.call(this, "freq", this._node.frequency);
  // post-build: initializing parameters
  this._initializeParams(options, this._default);

};


/**
 * sample prototype
 */
WX._unit.internal_unitname.prototype = {

  // label
  label: "sampler",

  // default params
  _default: {
    method1: 60
  },

  // param
  method1: function(value) {
    if (value !== undefined) {
      this._param1 = value;
    } else {
      return this._param1;
    }
  }
};


/**
 * extending unit prototype with abstract
 */
WX._unit.extend(WX._unit.sampler.prototype, WX._unit.generator.prototype);