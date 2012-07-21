// ========================================================================
// WAAX > Gui
// Scope.js
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
// class - Scope
// : WebGL-based oscilloscope
// 
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------


// class scope
WAAX.Gui.Scope = function ()
{
  // meta
  this.version = 1;
  this.err_msg = 'This class requires THREE.js';

  // visualization params 
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.bRenderLock = false;
  this.bMutexLock = false;
  this.bWindowing = true;
  this.eScopeType = 'Polar'; // or 'Linear'
  this.domContainer;
  this.phase = WAAX.Std.TWOPI / WAAX.BUFFER_SIZE;

  // api params
  this.num_input = 1; // for frequency modulation
  this.num_output = 1;
  this.node = WAAX.context.createJavaScriptNode(
    WAAX.BUFFER_SIZE, 
    this.num_input, 
    this.num_output);
  var ref = this;
  this.node.onaudioprocess = function(_e) { ref.cb(_e); };

  // THREE.js stuff : needs to be changed to native javascript
  this.camera = new THREE.PerspectiveCamera(
    45, this.width/this.height, 0.1, 1024);
  this.camera.position.z = 512;

  this.geom = new THREE.Geometry();
  for( var i=-WAAX.BUFFER_SIZE/2.0; i<WAAX.BUFFER_SIZE/2.0; i++ )
    this.geom.vertices.push(new THREE.Vector3(i, 0, 0));
  this.mat = new THREE.LineBasicMaterial({color: 0x00ff00, linewidth: 2.0});
  
  // this.mesh.dynamic = true;
  this.mesh = new THREE.Line(this.geom, this.mat);
  this.mesh.geometry.dynamic = true;
  this.mesh.position.set( 0.0, 0.0, 0.0 );
  this.mesh.matrixAutoUpdate = false;
  this.mesh.updateMatrix();
  
  this.scene = new THREE.Scene();
  this.scene.add(this.camera);
  this.scene.add(this.mesh);

  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    maxLight: 1,
    alpha: true
  });
  this.renderer.setSize(this.width, this.height);
  this.renderer.setClearColor(0x000000, 0.8);
  // this.renderer.gammaInput = true;
  // this.renderer.gammaOutput = true;
  // this.renderer.physicallyBasedShading = true;

  // div
  this.domContainer = document.createElement('div');
  this.domContainer.id = 'waax_scope';
  document.body.appendChild( this.domContainer );
  this.domContainer.appendChild( this.renderer.domElement );

  // implicitly starts animation loop  
  // this.draw();

  this.node.connect(WAAX.DAC.node);
};


WAAX.Gui.Scope.prototype = {

// constructor
  constructor: WAAX.Gui.Scope,

  // connect & disconnect
  connect: function(_theother) { 
    this.node.connect(_theother.node);
  },
  disconnect: function() { this.node.disconnect(); },

  // update
  draw: function() {
    // if ( !this.bMutexLock ) this.mesh.geometry.verticesNeedUpdate = true;
    // this.mesh.geometry.verticesNeedUpdate = true;
    this.bMutexLock = true;
    this.renderer.render(this.scene, this.camera);
    this.bMutexLock = false;
    // if ( !this.bRenderLock ) requestAnimationFrame(this.draw);
  },

  setScopeType: function(_type) {
    if (_type === 'Linear') {
      for( var i=0; i<WAAX.BUFFER_SIZE; ++i )
        this.geom.vertices[i].x = i - (WAAX.BUFFER_SIZE/2.0);
      this.eScopeType = _type;
    }
    else if (_type === 'Polar') {
      this.eScopeType = _type;
    }
    else console.log('[WAAX.Gui.Scope] Wrong type! (Linear or Polar)');
  },

  // audiocallback
  cb: function(_e) {
    if ( !this.bMutexLock )
    {
      // get references to callback buffers
      var inL = _e.inputBuffer.getChannelData(0); // input
      var _out = _e.outputBuffer.getChannelData(0);
      var _theta = 0.0;
      // filling up sample buffer
      if ( this.eScopeType === 'Polar')
      {
        for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
          var windowed = inL[i] * Math.sin(_theta/2.0) + 1.0;
          this.geom.vertices[i].x = (windowed) * Math.sin(_theta) * 100.0;
          this.geom.vertices[i].y = (windowed) * Math.cos(_theta) * 100.0;
          _theta += this.phase;
        }
      }
      else
      {
        for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
          var windowed = inL[i] * Math.sin(_theta/2.0);
          this.geom.vertices[i].y = windowed * 100.0;
          _theta += this.phase;
        }
      }
      this.mesh.geometry.verticesNeedUpdate = true;
    }
  }
};