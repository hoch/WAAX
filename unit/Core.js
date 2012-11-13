WX.Inlet = function() {
  this.node = WX.context.createGainNode();
};

WX.Inlet.prototype = {
  constructor: WX.Inlet,

  to: function(unit) {
    this.node.connect(unit.node);
    return unit;
  },

  cut: function() {
    this.node.disconnect();
  }

};


WX.Outlet = function() {
  this.node = WX.context.createGainNode();
};

WX.Outlet.prototype = {
  constructor: WX.Outlet,

  to: function(unit) {
    this.node.connect(unit.node);
    return unit;
  },

  cut: function() {
    this.node.disconnect();
  }

};