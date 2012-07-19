// ========================================================================
// WAAX.js
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


// TODO: add DAC AudioGainNode as Master Out

// ------------------------------------------------------------------------
// class - WAAX
// : global + singleton, root instance of WAAX framework
//
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------
var WAAX = WAAX || (function() {

    // revision
    var _REVISION = 5;
    console.log('WAAX.js r' + _REVISION);
    
    // Web Audio API Context
    var _context = new webkitAudioContext();

    // object literal
    return {
    	REVISION: _REVISION,
    	context: _context,
    	SAMPLE_RATE: _context.sampleRate,
    	BUFFER_SIZE: 512,
    	DAC: {},
    	Std: {},
    	Node: {},
    	Inst: {},
    	Efx: {},
    	Gui: {}
    };

})();


// ------------------------------------------------------------------------
// class - DAC (final output, including master gain)
// : dac as a master gain to audioContextDestination
//
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------
(function() {

    // master gain node
    this.node = WAAX.context.createGainNode();
    this.node.connect(WAAX.context.destination);

    // setGain
    this.setGain = function(_g) {
        this.node.gain.value = _g;
    };

}).apply(WAAX.DAC); // object injection


// ------------------------------------------------------------------------
// class - Std (standard)
// : class for constants and utilities (static var/methods)
//
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------
(function() {

    // SYSTEM CONSTANTS ...................................................
    this.PI = Math.PI;
    this.TWOPI = Math.PI * 2.0;
    // TODO: e, log, decibel, pitch, freq... should be added here.

    // SYSTEM METHODS (utilities) .........................................
    this.mtof = function(_pitch) {
	   return 440.0 * Math.pow(2, ((Math.floor(_pitch) - 69) / 12));
    };

    // ftom: frequency to midi                                             
    this.ftom = function( _freq ) {
	   return Math.floor(69 + 12 * Math.log(_freq / 440.0) / Math.log(2));
    };

    // rand2: random number generator (integer)                            
    this.rand2 = function(_a, _b) {
	   return Math.round(_a + Math.random() * (_b - _a));
    };

    // rand2f: random number generator (float)                             
    this.rand2f = function(_a, _b) {
	   return _a + Math.random() * (_b - _a);
    };
    
}).apply(WAAX.Std); // object injection

// END OF FILE