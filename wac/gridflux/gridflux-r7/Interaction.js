GF.Interaction = { ID: 'Interaction' };

(function (WX, MUI, GF, Ktrl) {

  // MIDI handling. (Ktrl)

  var MIDITarget = Ktrl.createTarget("CELL16");

  Ktrl.ready(function () {
    Ktrl.routeAllToTarget(MIDITarget);
    MIDITarget.activate();
  });

  MIDITarget.onData(function (midimessage) {

    var data = Ktrl.parse(midimessage);

    switch (data.type) {
      
      // MIDI learning.
      // if (GF.Sampler.isListening()) {
      //   GF.Sampler.onReceiveMIDIData(data.pitch);
      // } 

      case "noteon":
        var midievent = GF.Sampler.noteOn(data.pitch, data.velocity);
        if (midievent) {
          GF.Transport.recordEvent(midievent.lane, midievent.intensity);
          GF.EventView.Manager.flashLane(midievent.lane);  
        }
        break;
      
      // MIDI learning.
      // case "controlchange":
      //   if (MUI.CCMapper.isListening()) {
      //     MUI.CCMapper.onReceiveControlData(data.control);
      //   } else {
      //     MUI.CCMapper.route(data);
      //   }
      //   break;
    
    }

  });

  
  // Keyboard handling.
  var keys = [];
  window.addEventListener('keydown', function (event) {
    if (keys[event.keyCode]) {
      return;
    } else {
      keys[event.keyCode] = true;
      var midievent = GF.Sampler.keyOn(event.keyCode, 0.75);
      if (midievent) {
        GF.Transport.recordEvent(midievent.lane, midievent.intensity);
        GF.EventView.Manager.flashLane(midievent.lane);
      }
    }
  });

  window.addEventListener('keyup', function (event) {
    keys[event.keyCode] = false;
  });

})(WX, MUI, GF, Ktrl);