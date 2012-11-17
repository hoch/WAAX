WX.Clip = function(duration) {
  this.duration = duration || 1.0;
  this.elapsed = 0.0;
  this.finished = false;

  this.events = [0.0, 1.0, 2.0, 3.0, 4.0];
  
  this.loop = false;
  this.onUpdate = null;
};

WX.Clip.prototype = {

  constructor: WX.Clip,

  update: function(delta) {
    
    // TODO: do something here
    // this.onUpdate(delta);
    
    this.elapsed += delta;
    if (this.elapsed >= this.duration) {
      this.finished = true;
      $('#msg').text("[WX:Clip] finished.");
    }
  },

  isFinished: function() {
    return this.finished;
  }
};

/*
jsonNotes = {
  { 'MBT': [1, 1, 0], 'Velocity': 120, 'Pitch': 60 },
  { 'MBT': [1, 2, 0], 'Velocity': 100, 'Pitch': 64 },
  { 'MBT': [1, 3, 0], 'Velocity': 80, 'Pitch': 67 },
  { 'MBT': [1, 3, 240], 'Velocity': 60, 'Pitch': 71 },
  { 'MBT': [1, 4, 0], 'Velocity': 100, 'Pitch': 64 }
}
 */