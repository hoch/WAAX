// ========================================================================
// WAAX > Gui
// Viz.js
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
// class - Viz
// : WebGL-based waveform visualizer
// 
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------


// variables ..............................................................
WAAX.Gui.Viz = function()
{
    var camera, scene, renderer;
    var waveform;
var mesh;
var viznode;
var RENDER_LOCK = false;

viznode = WAAX.context.createJavaScriptNode(WAAX.BUFFER_SIZE, 1, 1);
  viznode.onaudioprocess = function(e) { vizcallback(e); };

viznode.connect(WAAX.DAC.node);

waveform = new THREE.Geometry();
  waveform.dynamic = true;
  for( var i=-WAAX.BUFFER_SIZE/2.0; i<WAAX.BUFFER_SIZE/2.0; i++ )
    waveform.vertices.push(new THREE.Vector3(i, 0, 0));

var material = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 2.0
    });
    
    mesh = new THREE.Line( waveform, material );
    mesh.position.set( 0.0, 0.0, 0.0 );
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);

    // renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    maxLight: 1,
    alpha: true
  });
  var myClearColor = new THREE.Color();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0x000000, 1.0 );
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.physicallyBasedShading = true;




};


// prototypes ..............................................................
WAAX.Gui.Viz.prototype = {

    // constructor
    /*
    window.addEventListener('load', function() {
  init();
  animate();
});
    */

    // update()

    // render()

    // animate()

    // 

    /*
    // audiocallback
function vizcallback(_e) {
  if ( !RENDER_LOCK )
  {
    // get references to callback buffers
    var inL = _e.inputBuffer.getChannelData(0); // input
    var _out = _e.outputBuffer.getChannelData(0);
    // filling up sample buffer
    for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
    
      waveform.vertices[i].y = inL[i] * 100.0;
      // _out[i] = 0.0;
      // bufL[i] = bufR[i] = sample * this.gain;  
    }
  
  }
}

    */

};