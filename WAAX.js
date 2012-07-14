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


// ------------------------------------------------------------------------
// class - WAAX
// : global + singleton, root instance of WAAX framework
//
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------
var WAAX = WAAX || { REVISION: 2 };


// ------------------------------------------------------------------------
// class - Base 
// : class for constants and utilities (static var/methods)
//
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------
WAAX.Base = {
    
    // system constants ...................................................
    PI:  Math.PI,
    TWOPI: Math.PI * 2,
    sample_rate: 44100,
    buffer_size: 512,
    // TODO: e, log, decibel, pitch, freq... should be added here.

    // system methods (utilities) .........................................

    // mtof: midi to frequency
    mtof: function( _pitch ) {
	return 440.0 * Math.pow(2, ((Math.floor(_pitch) - 69) / 12));
    },

    // ftom: frequency to midi
    ftom: function( _freq ) {
	return Math.floor(69 + 12 * Math.log(_freq / 440.0) / Math.log(2)); 
    },

    // rand2: random number generator (integer)
    rand2: function(_a, _b) {
	return Math.round(_a + Math.random() * (_b - _a));
    },

    // rand2f: random number generator (float)
    rand2f: function(_a, _b) {
	return _a + Math.random() * (_b - _a);
    }

};

// Node class container
WAAX.Node = {};

// END OF FILE