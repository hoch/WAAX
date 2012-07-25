// ========================================================================
// WAAX > NODE
// Osc.js
// 
// a part of WAAX.js
// - Web Audio API eXtension for Chrome/Safari
// 
//                                 written by 
//             Hongchan Choi           |           Juhan Nam 
//      hongchan@ccrma.stanford.edu    |    juhan@ccrma.stanford.edu
// ========================================================================

/* Copyright (C) 2011-2012  Juhan Nam & Hongchan Choi
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */



// ------------------------------------------------------------------------
// class - SinOsc
// : Basic Sinewave Oscillator
// 
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------

// variables ..............................................................
WAAX.Node.SinOsc = function()
{  
    // version
    this.version = 1;

    // synth params
    this.freq = 261.626; // middle C
    this.gain = 1.0;
    this.phase = 0.0;
    this.factor = WAAX.Std.TWOPI / WAAX.SAMPLE_RATE;
    this.step = this.factor * this.freq;

    // api params
    this.num_input = 1; // for frequency modulation
    this.num_output = 1;
    this.node = WAAX.context.createJavaScriptNode(
    	WAAX.BUFFER_SIZE, 
    	this.num_input, 
    	this.num_output);
    var ref = this;
    this.node.onaudioprocess = function(_e) { ref.cb(_e); };
};


// prototypes ..............................................................
WAAX.Node.SinOsc.prototype = {
   
    // constructor
    constructor: WAAX.Node.SinOsc,
    
    // connect & disconnect
    connect: function(_theother) { 
	   this.node.connect(_theother.node); 
    },
    disconnect: function() { this.node.disconnect(); },

    // setFreq
    setFreq: function(_freq) { this.freq = _freq; },

    // setGain
    setGain: function(_gain) { this.gain = _gain; },

    // setParams
    setParams: function(_freq, _gain) { 
    	if ( _freq != undefined ) this.setFreq(_freq);
    	if ( _gain != undefined ) this.setGain(_gain);
    },
    
    // callback
    cb: function(_e) {
    	// get references to callback buffers
    	var _inL = _e.inputBuffer.getChannelData(0); // input for fm
    	var _bufL = _e.outputBuffer.getChannelData(0);
    	// filling up sample buffer
    	for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
    	    this.step = this.factor * (this.freq + _inL[i]); // fm
    	    this.phase = (this.phase + this.step); // % WAAX.Std.TWOPI;
    	    var sample = Math.sin(this.phase);
    	    _bufL[i] = sample * this.gain;
    	}
    }
};

// END OF FILE