/**
 * WAAX utility
 * @version 1
 * @author hoch (hongchan@ccrma.stanford.edu)
 */


/**
 * constants for math operation
 */
WX.PI = Math.PI;
WX.TWOPI = Math.PI * 2.0;
WX.EPS = Number.MIN_VALUE;

/**
 * constans for default parameters
 */
WX.C5 = 261.262; // C5
WX.A4 = 440.000; // A4


/**
 * midi to frequency
 * @param  {float} midipitch midi pitch between 0~127
 * @return {float} frequency in Hz
 */
WX.midi2freq = function(midipitch) {
  return 440.0 * Math.pow(2, ((Math.floor(midipitch) - 69) / 12));
};


/**
 * frequency to midi
 * @param  {float} freq frequency in Hz
 * @return {float} midi pitch between 0~127
 */
WX.freq2midi = function(freq) {
  return Math.floor(69 + 12 * Math.log(freq / 440.0) / Math.log(2));
};


/**
 * random number generator for float
 * @param  {float} min minimum boundary
 * @param  {float} max maximum boundary
 * @return {float} generated random value
 */
WX.random2f = function(min, max) {
  return min + Math.random() * (max - min);
};


/**
 * random number generator as integer
 * @param  {float} min minimum boundary
 * @param  {float} max maximum boundary
 * @return {int} generated random value
 */
WX.random2 = function(min, max) {
  return Math.round(min + Math.random() * (max - min));
};

/**
 * convert linear amplitude to decibel
 * @param  {float} value linear amplitude
 * @return {float} decibel
 */
WX.lin2db = function(amp) {
  // if below -100dB, set to -100dB to prevent taking log of zero
  return 20.0 * (amp > 0.00001 ? (Math.log(amp) / Math.LN10): -5.0);
};

/**
 * convert decibel to linear complitude
 * @param  {float} db decibel
 * @return {float}    linear amplitude
 */
WX.db2lin = function(db) {
  return Math.pow(10.0, db / 20.0);
};

/**
 * error logging
 * @param  {object} object reference for object
 * @param  {string} message error message
 */
WX.error = function(object, message) {
  console.log("[WX:" + object.label + "] " + message);
};