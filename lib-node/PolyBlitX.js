// ========================================================================
// WAAX > NODE
// PolyBlitX.js
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
// class - PolyBlit1
// : Polyonimal-based Bandlimited Impulse Train (Order = 1)
// 
// @author Juhan Nam / juhan@ccrma.stanford.edu (algorithm)
// @author Hongchan Choi / hongchan@ccrma.stanford.edu (systemizing)
// ------------------------------------------------------------------------


// variables ..............................................................
WAAX.Node.PolyBlit1 = function()
{
    // version
    this.version = 1;

    // synth params
    this.freq = 261.626; // middle C
    this.gain = 1.0;
    this.period = WAAX.SAMPLE_RATE / this.freq;
    this.phase = this.period;
    this.dc = 1.0 / this.period;
    this.z1 = 0.0;

    // api params
    this.num_input = 1;
    this.num_output = 1;
    this.node = WAAX.context.createJavaScriptNode(
    	WAAX.BUFFER_SIZE, 
    	this.num_input, 
    	this.num_output);
    var ref = this;
    this.node.onaudioprocess = function(_e) { ref.cb(_e); };
};


// prototypes ..............................................................
WAAX.Node.PolyBlit1.prototype = {
   
    // constructor
    constructor: WAAX.Node.PolyBlit1,
    
    // connect & disconnect
    connect: function(_theother) { this.node.connect(_theother.node); },
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
    	// filling up sample buffer
    	for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
    	    var ir1 = 0.0, ir2 = 0.0;
    	    if ( this.phase < 0 ) {
        		// trigger impluse response
        		var d = 1 + this.phase;
        		ir1 = 1 - d;
        		ir2 = d;
        		// if frequecy is changed
        		this.period = WAAX.SAMPLE_RATE / this.freq;
        		this.dc = 1.0 / this.period;		
        		this.phase += this.period;
    	    }
    	    // add impulse responses to the output	
    	    var sample = this.z1 + ir1 - this.dc;			
    	    // update delay
    	    this.z1 = ir2;
    	    // update phase  
    	    this.phase -= 1.0;
    	    // output samples
    	    bufL[i] = sample * this.gain;
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
WAAX.Node.PolyBlit3 = function()
{
    // version
    this.version = 1;

    // synth params
    this.freq = 261.626; // middle C
    this.gain = 1.0;
    this.period = WAAX.SAMPLE_RATE / this.freq;
    this.phase = this.period;
    this.dc = 1.0 / this.period;
    this.z1 = 0.0;
    this.z2 = 0.0;
    this.z3 = 0.0;

    // api params
    this.num_input = 1;
    this.num_output = 1;
    this.node = WAAX.context.createJavaScriptNode(
    	WAAX.BUFFER_SIZE, 
    	this.num_input, 
    	this.num_output);
    var ref = this;
    this.node.onaudioprocess = function(_e) { ref.cb(_e); };
};


// prototypes ..............................................................
WAAX.Node.PolyBlit3.prototype = {
   
    // constructor
    constructor: WAAX.Node.PolyBlit3,
    
    // connect & disconnect
    connect: function(_theother) { this.node.connect(_theother.node); },
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
    	// filling up sample buffer
    	for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
    	    var ir1 = 0.0, ir2 = 0.0, ir3 = 0.0, ir4 = 0.0;
    	    if ( this.phase < 0 ) {
        		// trigger impluse response
        		var d = 1 + this.phase;
        		ir1 = (1-d)*(1-d)*(1-d)*0.16666667;
        		ir2 = 0.5*(d*d*(d-2)+1.3333333);
        		ir3 = -0.5*((d-1)*(d-1)*(d+1)-1.33333333);
        		ir4 = d*d*d*0.16666667;
        		// if frequecy is changed
        		this.period = WAAX.SAMPLE_RATE / this.freq;
        		this.dc = 1.0 / this.period;		
        		this.phase += this.period;
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
    	    bufL[i] = sample * this.gain;
    	}
    }
};

// ------------------------------------------------------------------------
// class - PolyBlitBP1
// : Polyonimal-based Bipolar Bandlimited Impulse Train (Order = 1)
// 
// @author Juhan Nam / juhan@ccrma.stanford.edu (algorithm)
// @author Hongchan Choi / hongchan@ccrma.stanford.edu (systemizing)
// ------------------------------------------------------------------------


// variables ..............................................................
WAAX.Node.PolyBlitBP1 = function(_AudioContext)
{
    // version
    this.version = 1;

    // synth params
    this.freq = 261.626; // middle C
    this.prev_freq = this.freq;
    this.gain = 1.0;
    this.width = 0.5;  // duty cycle in pulse width modulation 
    this.period = WAAX.SAMPLE_RATE / this.freq;
    this.pos_phase = this.period*0.5;
    this.neg_phase = this.pos_phase + this.period*this.width;
    this.pos_z1 = 0.0;
    this.neg_z1 = 0.0;

    // api params
    this.num_input = 1;
    this.num_output = 1;
    this.node = WAAX.context.createJavaScriptNode(
    	WAAX.BUFFER_SIZE, 
    	this.num_input, 
    	this.num_output);
    var ref = this;
    this.node.onaudioprocess = function(e) { ref.cb(e); };
};

// prototypes ..............................................................
WAAX.Node.PolyBlitBP1.prototype = {
   
    // constructor
    constructor: WAAX.Node.PolyBlitBP1,
    
    // connect & disconnect
    connect: function(_theother) { this.node.connect(_theother.node); },
    disconnect: function() { this.node.disconnect(); },

    // setFreq
    setFreq: function(_freq) { this.prev_freq = this.freq; this.freq = _freq; },

    // setGain
    setGain: function(_gain) { this.gain = _gain; },

    // setWidth
    setWidth: function(_width) { this.width = _width; },

    // setParams
    setParams: function(_freq, _gain, _width) { 
	this.setFreq(_freq);
	this.setGain(_gain);
	this.setWidth(_width);
    },
    
    // callback
    cb: function(_e) {
	// get references to callback buffers
	var bufL = _e.outputBuffer.getChannelData(0);

	// filling up sample buffer
	for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
	    var pos_ir1 = 0.0, pos_ir2 = 0.0;
	    var neg_ir1 = 0.0, neg_ir2 = 0.0;

	    if ( (this.pos_phase < 0) && (this.neg_phase < 0) ) {
			// trigger positive impluse response
			var d = 1 + this.pos_phase;
			pos_ir1 = 1 - d;
			pos_ir2 = d;
			// trigger negative impluse response
			d = 1 + this.neg_phase;
			neg_ir1 = -(1 - d);
			neg_ir2 = -d;
			
            // update phase 
            if ( this.prev_freq != this.freq ) {
            	this.period = WAAX.SAMPLE_RATE / this.freq;
			}
			
            if ( this.pos_phase < this.neg_phase ) {
                this.pos_phase = this.pos_phase + this.period;
				this.neg_phase = this.pos_phase + this.period*this.width;
            } else {
				this.neg_phase = this.pos_phase + this.period*this.width;
                this.pos_phase = this.pos_phase + this.period;
			}            
		} else if ( (this.pos_phase < 0) && (this.neg_phase >= 0) ) {
			// trigger positive impluse response only 
			var d = 1 + this.pos_phase;
			pos_ir1 = 1 - d;
			pos_ir2 = d;
			
			// update parameters
			if ( this.prev_freq != this.freq ) {
            	this.period = WAAX.SAMPLE_RATE / this.freq;	
    		}
     		// update positive pulse phase
            this.pos_phase = this.pos_phase + this.period;			
		
		} else if ( (this.pos_phase >= 0) && (this.neg_phase < 0) ) {
			// trigger negative impluse response only 
			var d = 1 + this.neg_phase;
			neg_ir1 = -(1 - d);
			neg_ir2 = -d;
			
			// update negative pulse phase
			this.neg_phase = this.pos_phase + this.period*this.width;
		}
		
	    // add impulse responses to the output	
	    var sample = this.pos_z1 + pos_ir1 + this.neg_z1 + neg_ir1;
	    // update delay
	    this.pos_z1 = pos_ir2;
	    this.neg_z1 = neg_ir2;

	    // update phase  
	    this.pos_phase -= 1.0;
	    this.neg_phase -= 1.0;
	    
	    // output samples
	    bufL[i] = sample * this.gain;
	}
    }
};

// ------------------------------------------------------------------------
// class - PolyBlitBP3
// : Polyonimal-based Bipolar Bandlimited Impulse Train (Order = 3)
// 
// @author Juhan Nam / juhan@ccrma.stanford.edu (algorithm)
// @author Hongchan Choi / hongchan@ccrma.stanford.edu (systemizing)
// ------------------------------------------------------------------------

// variables ..............................................................
WAAX.Node.PolyBlitBP3 = function(_AudioContext)
{
    // version
    this.version = 1;

    // synth params
    this.freq = 261.626; // middle C
    this.prev_freq = this.freq;
    this.gain = 1.0;
    this.width = 0.5;  // duty cycle in pulse width modulation 
    this.period = WAAX.SAMPLE_RATE / this.freq;
    this.pos_phase = this.period*0.5;
    this.neg_phase = this.pos_phase + this.period*this.width;
    this.pos_z1 = 0.0;
    this.pos_z2 = 0.0;
    this.pos_z3 = 0.0;
    this.neg_z1 = 0.0;
    this.neg_z2 = 0.0;
    this.neg_z3 = 0.0;

    // api params
    this.num_input = 1;
    this.num_output = 1;
    this.node = WAAX.context.createJavaScriptNode(
    	WAAX.BUFFER_SIZE, 
    	this.num_input, 
    	this.num_output);
    var ref = this;
    this.node.onaudioprocess = function(e) { ref.cb(e); };
};

// prototypes ..............................................................
WAAX.Node.PolyBlitBP3.prototype = {
   
    // constructor
    constructor: WAAX.Node.PolyBlitBP3,
    
    // connect & disconnect
    connect: function(_theother) { this.node.connect(_theother.node); },
    disconnect: function() { this.node.disconnect(); },

    // setFreq
    setFreq: function(_freq) { this.prev_freq = this.freq; this.freq = _freq; },

    // setGain
    setGain: function(_gain) { this.gain = _gain; },

    // setWidth
    setWidth: function(_width) { this.width = _width; },

    // setParams
    setParams: function(_freq, _gain, _width) { 
	this.setFreq(_freq);
	this.setGain(_gain);
	this.setWidth(_width);
    },
    
    // callback
    cb: function(_e) {
	// get references to callback buffers
	var bufL = _e.outputBuffer.getChannelData(0);

	// filling up sample buffer
	for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
	    var pos_ir1 = 0.0, pos_ir2 = 0.0, pos_ir3 = 0.0, pos_ir4 = 0.0;
	    var neg_ir1 = 0.0, neg_ir2 = 0.0, neg_ir3 = 0.0, neg_ir4 = 0.0;

	    if ( (this.pos_phase < 0) && (this.neg_phase < 0) ) {
			// trigger positive impluse response
			var d = 1 + this.pos_phase;
			pos_ir1 = (1-d)*(1-d)*(1-d)*0.16666667;
			pos_ir2 = 0.5*(d*d*(d-2)+1.3333333);
			pos_ir3 = -0.5*((d-1)*(d-1)*(d+1)-1.33333333);
			pos_ir4 = d*d*d*0.16666667;

			// trigger negative impluse response
			d = 1 + this.neg_phase;
			neg_ir1 = -(1-d)*(1-d)*(1-d)*0.16666667;
			neg_ir2 = -0.5*(d*d*(d-2)+1.3333333);
			neg_ir3 = 0.5*((d-1)*(d-1)*(d+1)-1.33333333);
			neg_ir4 = -d*d*d*0.16666667;
			
            // update phase 
            if ( this.prev_freq != this.freq ) {
            	this.period = WAAX.SAMPLE_RATE / this.freq;
			}
			
            if ( this.pos_phase < this.neg_phase ) {
                this.pos_phase = this.pos_phase + this.period;
				this.neg_phase = this.pos_phase + this.period*this.width;
            } else {
				this.neg_phase = this.pos_phase + this.period*this.width;
                this.pos_phase = this.pos_phase + this.period;
			}            
		} else if ( (this.pos_phase < 0) && (this.neg_phase >= 0) ) {
			// trigger positive impluse response only 
			var d = 1 + this.pos_phase;
			pos_ir1 = (1-d)*(1-d)*(1-d)*0.16666667;
			pos_ir2 = 0.5*(d*d*(d-2)+1.3333333);
			pos_ir3 = -0.5*((d-1)*(d-1)*(d+1)-1.33333333);
			pos_ir4 = d*d*d*0.16666667;
			
			// update parameters
			if ( this.prev_freq != this.freq ) {
            	this.period = WAAX.SAMPLE_RATE / this.freq;	
    		}
     		// update positive pulse phase
            this.pos_phase = this.pos_phase + this.period;			
		
		} else if ( (this.pos_phase >= 0) && (this.neg_phase < 0) ) {
			// trigger negative impluse response only 
			var d = 1 + this.neg_phase;
			neg_ir1 = -(1-d)*(1-d)*(1-d)*0.16666667;
			neg_ir2 = -0.5*(d*d*(d-2)+1.3333333);
			neg_ir3 = 0.5*((d-1)*(d-1)*(d+1)-1.33333333);
			neg_ir4 = -d*d*d*0.16666667;
			
			// update negative pulse phase
			this.neg_phase = this.pos_phase + this.period*this.width;
		}
		
	    // add impulse responses to the output	
	    var sample = this.pos_z1 + pos_ir1 + this.neg_z1 + neg_ir1;

	    // update delay
	    this.pos_z1 = this.pos_z2 + pos_ir2;
	    this.pos_z2 = this.pos_z3 + pos_ir3;
	    this.pos_z3 = pos_ir4;

	    this.neg_z1 = this.neg_z2 + neg_ir2;
	    this.neg_z2 = this.neg_z3 + neg_ir3;
	    this.neg_z3 = neg_ir4;

	    // update phase  
	    this.pos_phase -= 1.0;
	    this.neg_phase -= 1.0;
	    
	    // output samples
	    bufL[i] = sample * this.gain;
	}
    }
};

// END OF FILE