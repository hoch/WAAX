// ========================================================================
// WAAX > NODE
// PolyBlitX.js
// 
// a part of WAAX.js
// - Web Audio API eXtension for Chrome/Safari
// - revision: 1
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
// class - PolyBlit1
// : Polyonimal-based Bandlimited Impulse Train (Order = 1)
// 
// @author Juhan Nam / juhan@ccrma.stanford.edu
// ------------------------------------------------------------------------


// variables ..............................................................
WAAX.Node.PolyBlit1 = function(_AudioContext)
{
    // version
    this.version = 1;

    // synth params
    this.freq = 261.626; // middle C
    this.gain = 1.0;
    this.period = WAAX.sample_rate / this.freq;
    this.phase = this.period;
    this.dc = 1.0 / this.period;
    this.z1 = 0.0;

    // api params
    this.num_input = 0;
    this.num_output = 2;
    this.context = _AudioContext;
    this.node = _AudioContext.createJavaScriptNode(
	WAAX.buffer_size, 
	this.num_input, 
	this.num_output);
    var ref = this;
    this.node.onaudioprocess = function(e) { ref.cb(e); };
};


// prototypes ..............................................................
WAAX.Node.PolyBlit1.prototype = {
   
    // constructor
    constructor: WAAX.Node.PolyBlit1,
    
    // connect & disconnect
    connect: function(_output_node) { this.node.connect(_output_node); },
    disconnect: function() { this.node.disconnect(); },

    // setFreq
    setFreq: function(_freq) { this.freq = _freq; },

    // setGain
    setGain: function(_gain) { this.gain = _gain; },

    // setParams
    setParams: function(_freq, _gain) { 
	this.setFreq(_freq);
	this.setGain(_gain);
    },
    
    // callback
    cb: function(_e) {
	// get references to callback buffers
	var bufL = _e.outputBuffer.getChannelData(0);
	var bufR = _e.outputBuffer.getChannelData(1);
	// filling up sample buffer
	for (var i = 0; i < WAAX.buffer_size; ++i) {
	    var ir1 = 0.0, ir2 = 0.0;
	    if ( this.phase < 0 ) {
		// trigger impluse response
		var d = 1 + this.phase;
		ir1 = 1 - d;
		ir2 = d;
		// if frequecy is changed
		this.period = WAAX.sample_rate / this.freq;
		this.dc = 1.0 / this.period;		
		this.phase = this.phase + this.period;
	    }
	    // add impulse responses to the output	
	    var sample = this.z1 + ir1 - this.dc;			
	    // update delay
	    this.z1 = ir2;
	    // update phase  
	    this.phase -= 1.0;
	    // output samples
	    bufL[i] = bufR[i] = sample * this.gain;
	}
    }
};



// ------------------------------------------------------------------------
// class - PolyBlit3
// : Polyonimal-based Bandlimited Impulse Train (Order = 3)
// 
// @author Juhan Nam / juhan@ccrma.stanford.edu
// ------------------------------------------------------------------------


// variables ..............................................................
WAAX.Node.PolyBlit3 = function(_AudioContext)
{
    // version
    this.version = 1;

    // synth params
    this.freq = 261.626; // middle C
    this.gain = 1.0;
    this.period = WAAX.sample_rate / this.freq;
    this.phase = this.period;
    this.dc = 1.0 / this.period;
    this.z1 = 0.0;
    this.z2 = 0.0;
    this.z3 = 0.0;

    // api params
    this.num_input = 0;
    this.num_output = 2;
    this.context = _AudioContext;
    this.node = _AudioContext.createJavaScriptNode(
	WAAX.buffer_size, 
	this.num_input, 
	this.num_output);
    var ref = this;
    this.node.onaudioprocess = function(e) { ref.cb(e); };
};


// prototypes ..............................................................
WAAX.Node.PolyBlit1.prototype = {
   
    // constructor
    constructor: WAAX.Node.PolyBlit1,
    
    // connect & disconnect
    connect: function(_output_node) { this.node.connect(_output_node); },
    disconnect: function() { this.node.disconnect(); },

    // setFreq
    setFreq: function(_freq) { this.freq = _freq; },

    // setGain
    setGain: function(_gain) { this.gain = _gain; },

    // setParams
    setParams: function(_freq, _gain) { 
	this.setFreq(_freq);
	this.setGain(_gain);
    },
    
    // callback
    cb: function(_e) {
	// get references to callback buffers
	var bufL = _e.outputBuffer.getChannelData(0);
	var bufR = _e.outputBuffer.getChannelData(1);
	// filling up sample buffer
	for (var i = 0; i < WAAX.buffer_size; ++i) {
	    var ir1 = 0.0, ir2 = 0.0, ir3 = 0.0, ir4 = 0.0;
	    if ( this.phase < 0 ) {
		// trigger impluse response
		var d = 1 + this.phase;
		ir1 = (1-d)*(1-d)*(1-d)*0.16666667;
		ir2 = 0.5*(d*d*(d-2)+1.3333333);
		ir3 = -0.5*((d-1)*(d-1)*(d-1)-1.33333333);
		ir4 = d*d*d*0.16666667;
	
		// if frequecy is changed
		this.period = WAAX.sample_rate / this.freq;
		this.dc = 1.0 / this.period;		
		this.phase = this.phase + this.period;
	    }
	    // add impulse responses to the output	
	    var sample = this.z1 + ir1 - this.dc;			
	    // update delay
	    this.z1 = this.z2 + ir2;
	    this.z2 = this.z3 + ir3;
	    this.z3 = ir4;
	    // update phase  
	    this.phase -= 1.0;
	    // output samples
	    bufL[i] = bufR[i] = sample * this.gain;
	}
    }
};

// END OF FILE