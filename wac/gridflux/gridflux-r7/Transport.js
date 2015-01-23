/**
 * Transport (module)
 * @note timeline, transport
 */

GF.Transport = { ID: 'Transport' };

(function (WX, MUI, GF) {

  var timeline = GF.Timebase.createTimeline(120.0);
  timeline.addEventList(GF.EventView.Manager.eventlist);
  timeline.addEventList(GF.EventView.Manager.selectBuffer);
  var playbackQueue = timeline.getPlaybackQueue();

  var loopStart = { beat: 0, tick: 0 };
  var loopEnd = { beat: 8, tick: 0 };
  timeline.setLoop(loopStart, loopEnd);
  timeline.setParam('pLoop', true);
  timeline.setLinearNow(0.0);

  var status = {
    bRunning: false,
    bRecording: false,
    bMetronome: false
  };

  var metroSample = WX.BufferMap({
      'metronome': 'data/system/metronome.wav'
    }, function () {
      timeline.setMetronomeSound(metroSample.getBufferByName('metronome'));
  });

  // ** DEPRECATED: needs to be fixed
  // callback from EventManager
  GF.EventView.Manager.notify = function (action, value) {
    if (GF.ready) {
      switch (action) {
        case 'pPlayheadPosition':
          timeline.setMusicalNow(value);
          break;
        case 'pContentChanged':
          timeline.resetEventlistPosition();
          timeline.dump();
          break;
        case 'playbackToggle':
          status.bRunning = !status.bRunning;
          if (status.bRunning) {
            timeline.start();
          } else {
            timeline.stop();
            status.bRecording = false;
          }
          break;
        // case 'recordToggle':
        //   bRecording = !bRecording;
        //   break;
      }
    }
  };

  function _loop() {

    timeline.advance();

    // lookahead and play only when running (playback)
    if (timeline.isRunning()) {
      timeline.scheduleEvents();
      if (playbackQueue.length > 0) {
        for (var i = 0; i < playbackQueue.length; i++) {
          var data = GF.EventView.Manager.eventFilter.process(playbackQueue[i]);
          GF.Sampler.play(timeline.getAbsoluteTime(data.tick), data.lane, data.intensity);
        }
      }
      timeline.flushPlaybackQueue();
    }

    // updateView runs 60FPS
    GF.EventView.Manager.setParam('pPlayheadPosition', timeline.getMusicalNow());
    GF.EventView.Manager.updateView();
    requestAnimationFrame(_loop);
  }

  // Start
  _loop();


  // externals
  GF.Transport.Timeline = timeline;
  
  GF.Transport.Status = status;

  GF.Transport.getParams = function () {
    return {
      pBPM: timeline.params.pBPM,
      pQuantize: GF.EventView.Manager.eventFilter.params.pQuantize,
      pSwing: GF.EventView.Manager.eventFilter.params.pSwing
    };
  };

  GF.Transport.setParams = function (params) {
    timeline.setParam('pBPM', params.pBPM);
    GF.EventView.Manager.eventFilter.setParam('pQuantize', params.pQuantize);
    GF.EventView.Manager.eventFilter.setParam('pSwing', params.pSwing);
  };

  GF.Transport.toggleStatus = function (stateName, value) {
    var val;
    if (typeof value === 'undefined') {
      status[stateName] = !status[stateName];
    } else {
      status[stateName] = value;
    }
    switch (stateName) {
      case 'bRunning':
        if (status.bRunning) {
          timeline.start();
        } else {
          timeline.stop();
          status.bRecording = false;
        }
        break;
      case 'bRecording':
        break;
      case 'bMetronome':
        timeline.setParam('pMetronome', status.bMetronome);
        break;
    }
  };

  GF.Transport.recordEvent = function (lane, intensity) {
    if (status.bRunning && status.bRecording) {
      var newEvent = GF.Timebase.createEvent(timeline.getMusicalNow(), lane, intensity);
      GF.EventView.Manager.eventlist.push(newEvent);
    }
  };

  GF.Transport.initialize = function (done) {

    MUI.$('xport-quantize').link(GF.EventView.Manager.eventFilter, 'pQuantize');
    MUI.$('xport-swing').link(GF.EventView.Manager.eventFilter, 'pSwing');
    MUI.$('xport-tempo').link(GF.Transport.Timeline, 'pBPM');
    MUI.$('xport-play').link(GF.Transport.Status, 'bRunning');
    MUI.$('xport-record').link(GF.Transport.Status, 'bRecording');
    MUI.$('xport-metro').link(GF.Transport.Status, 'bMetronome');
    MUI.$('xport-rewind').onclick = function () {
      GF.Transport.Timeline.rewind();
    };
    MUI.$('xport-stop').onclick = function () {
      GF.Transport.toggleStatus('bRunning', false);
    };
    MUI.$('xport-play').onclick = function () {
      GF.Transport.toggleStatus('bRunning');
    };
    MUI.$('xport-record').onclick = function () {
      GF.Transport.toggleStatus('bRecording');
    };
    MUI.$('xport-metro').onclick = function () {
      GF.Transport.toggleStatus('bMetronome');
    };

    if (typeof done === 'function')
      done();
  };

  // Transport is loaded. Now it can be initialized.
  GF.notifyController('transport_loaded');

})(WX, MUI, GF);