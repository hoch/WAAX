// creating white noise buffer source
(function() {
  var sr = WX._context.sampleRate,
      l = sr * 5,
      wn = new Float32Array(l);
  WX.Template.WhiteNoise = WX._context.createBuffer(1, l, sr);
  for(var i = 0; i < l; ++i) {
    wn[i] = Math.random() * 2.0 - 1;
  }
  WX.Template.WhiteNoise.getChannelData(0).set(wn, 0);

})();