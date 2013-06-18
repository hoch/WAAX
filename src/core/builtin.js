/**
 * builtin.js: pre-build noise, impulse train
 */
(function() {
  // builtin namespace
  wx.builtin = {};
  var sr = wx.context.sampleRate,
      l = sr * 5;

  // creating white noise buffer source
  var wn = new Float32Array(l);
  wx.builtin.whitenoise = wx.context.createBuffer(1, l, sr);
  for(var i = 0; i < l; ++i) {
    wn[i] = Math.random() * 2.0 - 1;
  }
  wx.builtin.whitenoise.getChannelData(0).set(wn, 0);

  // creating impulse train
  var it = new Float32Array(l);
  wx.builtin.impulsetrain = wx.context.createBuffer(1, l, sr);
  it[0] = 1.0;
  for(var j = 0; j < l; ++j) {
    it[i] = 0;
  }
  wx.builtin.impulsetrain.getChannelData(0).set(wn, 0);
})();