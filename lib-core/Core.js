// ========================================================================
// WAAX > CORE
// Core.js
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
// static function - importScript
// : js script importer (which doesn't support IE)
// 
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------
WAAX.Core.importScript = function(_url, _callback)
{
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function() { _callback(); };
    script.src = _url;
    document.getElementsByTagName('head')[0].appendChild(script);
};

// TODO: load audio file (XHTTPreqeust/ajax)
// TODO: google app-engine hub - download samples
// TODO: receiving musical event from websocket
// TODO: sending music event via websocket
// TODO: Timing structure