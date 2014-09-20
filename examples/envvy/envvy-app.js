/**
 * Envvy: Step-programmable Synth Looper
 *
 * @version 0.0.1
 * @author Hongchan Choi (hongchan.choi@gmail)
 */


/**
 * @namespace  Envvy
 */
var Envvy = {
  INFO: '0.1.0',
  NUMTRACKS: 5,
  NUMSTEPS: 8
};

/**
 * @name Synth
 */
Envvy.Synth = {};

/**
 * @namespace  Workspace
 */
Envvy.Workspace = {};

/**
 * @namespace Transport
 */
Envvy.Transport = {};


/**
 * @namespace  DataManager
 */
Envvy.DataManager = {};



// implements: Synth
(function (WX, MUI, Envvy) {

  var wxs1 = WX.WXS1();
      delay = WX.StereoDelay({ mix: 1.0 });

  wxs1.to(WX.Master);
  wxs1.to(delay).to(WX.Master);

  Envvy.Synth.noteOn = function (pitch, velocity, time) {
    wxs1.noteOn(pitch, velocity, time);
    wxs1.noteOff(time + 0.1);
  };

})(WX, MUI, Envvy);



// implements: Workspace
(function (WX, MUI, Envvy) {

  var ENVVY_CONTAINER = MUI.$('envvy-container');

  var _tracks = [],
      _trackNames = [
        'Hey',
        'Amp'
      ];

  var selectedBlock = null;

  // filling mui-blocks in
  for (var i = 0; i < Envvy.NUMTRACKS; i++) {
    var divTrack = document.createElement('div');
    divTrack.className = 'c-envvy-track';
    _tracks[i] = [];
    for (var j = 0; j < Envvy.NUMSTEPS; j++) {
      var eblock = document.createElement('mui-eblock');
      divTrack.appendChild(eblock);
      _tracks[i].push(eblock);
    }
    ENVVY_CONTAINER.appendChild(divTrack);
  }

  function playStep(trackId, stepId, onset) {
    Envvy.Synth.noteOn(60, 100, onset);
    setTimeout(function () {
      _tracks[trackId][stepId].flash();
    }, (onset - WX.now) * 1000);
  }

  // triggerStep()
  Envvy.Workspace.triggerStep = function (stepId, onset) {
    for (var i = 0; i < Envvy.NUMTRACKS; i++) {
      playStep(i, stepId, onset);
    }
  };

})(WX, MUI, Envvy);



// implements: Transport
(function (WX, MUI, Envvy) {

  var unixOrigin,
      wxOrigin;

  var BPM = 120,              // beat per minute
      SPB = 60 / BPM,         // second per beat
      LOOKAHEAD = 1 / 60;     // look ahead, 16.6667ms

  var _nextStepId, _nextStepOnset, _lastStepId;

  function establishTimeline() {
    // calculating origin
    // var unixOrigin = Date.now() / 1000,
    var unixOrigin = (performance.timing.navigationStart / 1000.0);
    unixOrigin += (performance.now() / 1000.0);
    var wxOrigin = unixOrigin - WX.now,
        now = wxOrigin + WX.now,
        totalSteps = Math.floor(now / SPB);
        currentStepOnset = totalSteps * SPB - wxOrigin;
    _nextStepId = (totalSteps + 1) % Envvy.NUMSTEPS;
    _nextStepOnset = currentStepOnset + SPB;
    WX.Log.info('Univerial timeline established. Starting...');
  }

  function getNextStep() {
    // if next event in in range, return step info (step++, stepOnset)
    if (_nextStepOnset <= WX.now + LOOKAHEAD) {
      _nextStepOnset += SPB;
      _nextStepId = (_nextStepId + 1) % Envvy.NUMSTEPS;
      return {
        id: _nextStepId,
        onset: _nextStepOnset
      };
    }
    // if next event is too far away
    else {
      return null;
    }
  }

  function run() {
    var nextStep = getNextStep();
    if (nextStep && _lastStepId !== nextStep.id) {
      Envvy.Workspace.triggerStep(nextStep.id, nextStep.onset);
      _lastStepId = nextStep.id;
    }
    requestAnimationFrame(run);
  }

  function init() {
    if (WX.now > 2.0) {
      establishTimeline();
      run();
    } else {
      setTimeout(init, 1000);
    }
  }

  // entry point
  Envvy.start = function () {
    WX.Log.info('Envvy', Envvy.INFO);
    WX.Log.info('Initializing...');
    init();
  };

})(WX, MUI, Envvy);



// implements: DataManager
(function (WX, MUI, Envvy) {

  var fbRef = new Firebase("https://envvy.firebaseio.com/");

  fbRef.set({
    title: "Hello World!",
    author: "Firebase",
    location: {
      city: "San Francisco",
      state: "California",
      zip: 94103
    }
  });

})(WX, MUI, Envvy);


