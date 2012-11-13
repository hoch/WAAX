/**
 * @namespace WX
 * @version 1
 */
var WX = WX || { REVISION:1 };

// Audio Context
WX.context = new webkitAudioContext();

// parameters
WX.SAMPLE_RATE = WX.context.sampleRate;
WX.BUFFER_SIZE = 512;