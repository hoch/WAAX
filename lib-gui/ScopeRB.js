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
// : WebGL-based oscilloscope (currently it requires THREE.js)
// 
// @author Hongchan Choi / hongchan@ccrma.stanford.edu
// ------------------------------------------------------------------------


// class scope
WAAX.Gui.Scope = function (_width, _height)
{
  // meta
  this.version = 1;
  this.err_msg = 'This class requires THREE.js';

  // visualization params 
  this.width = _width || 480;
  this.height = _height || 320;
  this.bMutexLock = false;
  this.eScopeType = 'Linear'; // or 'Polar'
  this.domContainer;
  this.magitude = 100;

  this.ringBufferSize = WAAX.BUFFER_SIZE * 2;
  this.w = WAAX.Std.TWOPI / this.ringBufferSize;

  // module: build window
  this.frameWindow = [];
  this.polarX = [];
  this.polarY = []; 
  var _phi = 0.0;
  for (var i = 0; i < this.ringBufferSize; ++i) {
    this.frameWindow[i] = Math.sin(_phi/2.0);
    this.polarX[i] = Math.sin(_phi);
    this.polarY[i] = Math.cos(_phi);
    _phi += this.w;
  }

  // api params
  this.num_input = 1; // for frequency modulation
  this.num_output = 1;
  this.node = WAAX.context.createJavaScriptNode(
    WAAX.BUFFER_SIZE, 
    this.num_input, 
    this.num_output);
  var ref = this;
  this.node.onaudioprocess = function(_e) { ref.cb(_e); };

  // TODO: THREE.js stuff = needs to be changed to native javascript
  this.geom = new THREE.Geometry();
  
  var _xcoord = 0;
  for( var i=0; i<this.ringBufferSize; i++ )
    this.geom.vertices.push(new THREE.Vector3(_xcoord++, 0, 0));

  this.mat = new THREE.LineBasicMaterial({color: 0x00ff00, linewidth: 2.0});
  this.mesh = new THREE.Line(this.geom, this.mat);
  this.mesh.position.set(this.ringBufferSize*-0.5, 0, 0);
  this.mesh.geometry.dynamic = true;
  
  this.camera = new THREE.PerspectiveCamera(
    45, this.width/this.height, 0.1, 1024);
  this.camera.position.z = 512;
  this.scene = new THREE.Scene();
  this.scene.add(this.camera);
  this.scene.add(this.mesh);

  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  this.renderer.setSize(this.width, this.height);
  this.renderer.setClearColor(0x000000, 0.8);
  
  // div
  this.domContainer = document.createElement('div');
  this.domContainer.id = 'waax_scope';
  document.body.appendChild( this.domContainer );
  this.domContainer.appendChild( this.renderer.domElement );

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
    this.bMutexLock = true;
    this.renderer.render(this.scene, this.camera);
    this.bMutexLock = false;
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

  setMagnitude: function(_mag) {
    this.magitude = _mag;
  },

  // audiocallback
  cb: function(_e) {
    if ( !this.bMutexLock )
    {
      // get local references
      var inL = _e.inputBuffer.getChannelData(0); // input
      var _out = _e.outputBuffer.getChannelData(0);
      var _theta = 0.0;
      var m = this.magitude;
      var p = this.phase;
      var v = this.geom.vertices;
      
      // filling up sample buffer
      if ( this.eScopeType === 'Polar' )
      {
        for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
          var windowed = inL[i] * this.frameWindow[i] + 1.0;
          v[i].x = this.polarX[i] * m;
          v[i].y = (windowed) * this.polarY[i] * -m;
          _theta += p;
        }
      }
      else
      {
        for (var i = 0; i < WAAX.BUFFER_SIZE; ++i) {
          var windowed = inL[i] * this.frameWindow[i];
          v[i].y = windowed * m;
          _theta += p;
        }
      }

      this.mesh.geometry.verticesNeedUpdate = true;
    }
  }
};