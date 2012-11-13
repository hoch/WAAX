// midi2freq: midi to frequency
WX.midi2freq = function(midipitch) {
  return 440.0 * Math.pow(2, ((Math.floor(midipitch) - 69) / 12));
};

// freq2midi: frequency to midi
WX.freq2midi = function(freq) {
  return Math.floor(69 + 12 * Math.log(freq / 440.0) / Math.log(2));
};

// random2f: random number generator (float)
WX.random2f = function(min, max) {
  return min + Math.random() * (max - min);
};

// randdom2: random number generator (integer)
WX.random2 = function(min, max) {
  return Math.round(min + Math.random() * (max - min));
};