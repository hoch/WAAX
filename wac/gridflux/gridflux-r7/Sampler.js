// Sampler module.
// : Implements each sample cell.

// Namespace Sampler
GF.Sampler = { ID: 'Sampler' };

(function (WX, MUI, GF) {

  GF.Sampler.cells = [];
  GF.Sampler.selectedCell = null;
  
  var listeningPool = [];
  var bListening = false;

  for (var i = 0; i < 16; i++) {
    GF.Sampler.cells[i] = WX.Cell();
    GF.Sampler.cells[i].connect(GF.Master.nInput);
    GF.Sampler.cells[i].connect(GF.Master.nInput);
    GF.Sampler.cells[i].connectSends(GF.Master.nSend1, GF.Master.nSend2, GF.Master.nSend3);
  }

  var buffermap = null;

  GF.Sampler.linkMUIElements = function () {
    var c = GF.Sampler.selectedCell;
    MUI.$('sample-select').link(c, 'pBuffer');
    MUI.$('sample-active').link(c, 'pActive');
    MUI.$('sample-tune').link(c, 'pTune');
    MUI.$('env-active').link(c, 'pEnvActive');
    MUI.$('env-attack').link(c, 'pEnvAttack');
    MUI.$('env-hold').link(c, 'pEnvHold');
    MUI.$('env-release').link(c, 'pEnvRelease');
    MUI.$('eq-active').link(c, 'pFilterActive');
    MUI.$('eq-lfreq').link(c, 'pFilterLowFreq');
    MUI.$('eq-lgain').link(c, 'pFilterLowGain');
    MUI.$('eq-hfreq').link(c, 'pFilterHiFreq');
    MUI.$('eq-hgain').link(c, 'pFilterHiGain');
    MUI.$('output-send1').link(c, 'pSend1Gain');
    MUI.$('output-send2').link(c, 'pSend2Gain');
    MUI.$('output-send3').link(c, 'pSend3Gain');
    MUI.$('output-pan').link(c, 'pPanner');
    MUI.$('output-volume').link(c, 'pGain');
  };

  GF.Sampler.cellChanged = function (cellNo) {
    GF.Sampler.selectedCell = GF.Sampler.cells[cellNo];
    GF.Sampler.linkMUIElements();
  };

  GF.Sampler.getBufferName = function (cellNo) {
    return GF.Sampler.cells[cellNo].getParam('pBuffer');
  };

  GF.Sampler.playEvent = function (event, absTime) {
    GF.Sampler.cells[event.lane].play(event.params.intensity, absTime);
  };

  GF.Sampler.play = function (absTime, lane, intensity) {
    GF.Sampler.cells[lane].play(intensity, absTime);
  };

  GF.Sampler.noteOn = function (pitch, velocity) {
    var lane = GF.MIDIMap[pitch];
    if (lane)
      GF.Sampler.cells[lane].play(velocity/127, 0);
    // For visualization.
    return {
      lane: lane,
      intensity: velocity/127
    };
  };

  GF.Sampler.keyOn = function (keyCode, intensity) {
    var lane = GF.KeyboardMap[keyCode];
    if (lane)
      GF.Sampler.cells[lane].play(intensity, 0);
    // For visualization.
    return {
      lane: lane,
      intensity: intensity
    };
  };

  GF.Sampler.getParams = function () {
    var params = [];
    GF.Sampler.cells.map(function (cell) {
      params.push(cell.getParams());
    });
    return params;
  };

  GF.Sampler.setParams = function (params) {
    for (var i = 0; i < GF.Sampler.cells.length; i++) {
      GF.Sampler.cells[i].setParams(params[i]);
    }  
  };

  // TO FIX: MIDI learning feature.

    // midi learnig related
    // isListening: function () {
    //   return bListening;
    // },
    // addToListeningPool: function (lane) {
    //   listeningPool.push(lane);
    //   console.log(listeningPool);
    //   bListening = true;
    // },
    
    // onReceiveMIDIData: function (pitch) {
    //   for (var i = 0; i < listeningPool.length; i++) {
    //     // listeningPool[i].select(false);
    //     midiMap[pitch] = listeningPool[i];
    //   }
    //   listeningPool.length = 0;
    //   bListening = false;
    // },

  GF.Sampler.initialize = function (done) {
    GF.DEBUG(GF.Sampler, 'initializing...');

    buffermap = WX.BufferMap(GF.Assets.Samples, function () {
      for (var i = 0; i < 16; i++) {
        GF.Sampler.cells[i].setBuffermap(buffermap);
        GF.Sampler.cells[i].setParam('pBuffer', buffermap.getBufferNames()[i]);
      }
      MUI.$('sample-select').setModel(buffermap.getCollection());
      GF.Sampler.selectedCell = GF.Sampler.cells[0];
      GF.Sampler.linkMUIElements();
      GF.DEBUG(GF.Sampler, 'initialized.');
      if (typeof done === 'function')
        done();
    });
  };

  // Sampler is loaded. Now it can be initialized.
  GF.notifyController('sampler_loaded');

})(WX, MUI, GF);