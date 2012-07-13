// --------------------------------------------------------------------
// name : PolyBLIT1
// desc : Polyonimal-based Bandlimited Impulse Train. The polynomial order is 1
// --------------------------------------------------------------------
function PolyBlit1(context)
{
	// member vars : public
	this.freq = 440.0;
	this.gain = 0.1;
	
	// web audio api stuffs
	this.context = context;
	this.bufferSize = 256;
	this.node = context.createJavaScriptNode(this.bufferSize, 1, 2);
	var ref = this; // set callback reference
	this.node.onaudioprocess = function( e ) { ref.cb(e) }; 
	
	// internal vars
	this.period = context.sampleRate / this.freq;
	this.phase = this.period;
	this.dc = 1/this.period;
	this.z1 = 0.0;
	// this.factor = Synch.TWOPI / context.sampleRate;
	// this.t_inc = this.factor * this.freq;
	// this.tg_freq = this.freq;
	// this.tg_gain = this.gain;
	// this.tg_speed = 0.001;
	// this.gamma = 0.35;
	
	// -------------------------------------------------------------
	// methods : setFreq
	this.setFreq = function( f ) {
		this.freq = f;
	}
	
	// methods : setGain	
	this.setGain = function( g ) {
		this.gain = g;
	}

	// methods : setParams		
	this.setParams = function( _freq, _gain ) {
		this.setFreq( _freq );
		this.setGain( _gain );
	}
		
	// methods : callback
	this.cb = function ( e ) {
		// get references to callback buffers
		var bufL = e.outputBuffer.getChannelData(0);
		var bufR = e.outputBuffer.getChannelData(1);
		
		// process buffer
		for (var i = 0; i < this.bufferSize; ++i) {
			
			var sample;
			
			if ( this.phase < 0 ) {
				// trigger impluse response
				var d = 1 + this.phase;
				var ir1 = 1 - d;
				var ir2 = d;
				
				// if frequecy is changed
				this.period = context.sampleRate / this.freq;
				this.dc = 1/this.period;
				
				this.phase = this.phase + this.period;
			}
			else {
				ir1 = ir2 = 0.0;  
			}
			
			// add impulse responses to the output	
			sample = this.z1 + ir1 - this.dc;			
			// update delay
			this.z1 = ir2;
			// update phase  
			this.phase -= 1.0;
					
			bufL[i] = bufR[i] = sample * this.gain;
		}
	}
	
	// methods : networking
	this.connect = function( node ) { this.node.connect( node ); }
	this.disconnect = function() { this.node.disconnect(); }
};

// --------------------------------------------------------------------
// name : PolyBLIT3
// desc : Polyonimal-based Bandlimited Impulse Train. The polynomial order is 3
// --------------------------------------------------------------------
function PolyBlit3(context)
{
	// member vars : public
	this.freq = 440.0;
	this.gain = 0.1;
	
	// web audio api stuffs
	this.context = context;
	this.bufferSize = 256;
	this.node = context.createJavaScriptNode(this.bufferSize, 1, 2);
	var ref = this; // set callback reference
	this.node.onaudioprocess = function( e ) { ref.cb(e) }; 
	
	// internal vars
	this.period = context.sampleRate / this.freq;
	this.phase = this.period;
	this.dc = 1/this.period;
	this.z1 = 0.0;
	this.z2 = 0.0;
	this.z3 = 0.0;
	
	// this.factor = Synch.TWOPI / context.sampleRate;
	// this.t_inc = this.factor * this.freq;
	// this.tg_freq = this.freq;
	// this.tg_gain = this.gain;
	// this.tg_speed = 0.001;
	// this.gamma = 0.35;
	
	// -------------------------------------------------------------
	// methods : setFreq
	this.setFreq = function( f ) {
		this.freq = f;
	}
	
	// methods : setGain	
	this.setGain = function( g ) {
		this.gain = g;
	}

	// methods : setParams		
	this.setParams = function( _freq, _gain ) {
		this.setFreq( _freq );
		this.setGain( _gain );
	}
		
	// methods : callback
	this.cb = function ( e ) {
		// get references to callback buffers
		var bufL = e.outputBuffer.getChannelData(0);
		var bufR = e.outputBuffer.getChannelData(1);
		
		// process buffer
		for (var i = 0; i < this.bufferSize; ++i) {
			
			var sample;
			
			if ( this.phase < 0 ) {
				// trigger impluse response
				var d = 1 + this.phase;
				var ir1 = (1-d)*(1-d)*(1-d)*0.16666667;
				var ir2 = 0.5*(d*d*(d-2)+1.3333333);
				var ir3 = -0.5*((d-1)*(d-1)*(d+1)-1.33333333);
				var ir4 = d*d*d*0.16666667;
				
				// if frequecy is changed
				this.period = context.sampleRate / this.freq;
				this.dc = 1/this.period;
				
				this.phase = this.phase + this.period;
			}
			else {
				ir1 = ir2 = ir3 = ir4 = 0.0;
			}
			
			// add impulse responses to the output	
			sample = this.z1 + ir1 - this.dc;
			// update delay
			this.z1 = this.z2 + ir2;
			this.z2 = this.z3 + ir3;
			this.z3 = ir4;
			// update phase
			this.phase -= 1.0;
					
			bufL[i] = bufR[i] = sample * this.gain;
		}
	}
	
	// methods : networking
	this.connect = function( node ) { this.node.connect( node ); }
	this.disconnect = function() { this.node.disconnect(); }
};