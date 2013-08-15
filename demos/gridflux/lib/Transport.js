/**
 * TransportView and TransportManager module
 * @dependency Timeline, Event, EventList, Metronome
 * @dependency UISlider, UIButton, WAAX core
 */


GF.Transport = (function (GF, GUI, WX) {

  /**
   * some globals here
   */


  /**
   * TransportView
   */
  function TransportView (manager) {

    // report changes to manager
    this._onchange = function (elementName, action, value) {
      manager.report.call(manager, elementName, action, value);
    };

    // find DOM and fill GUI elements
    var targetDiv = document.getElementById('i-sec-xport');
    var s_quantize = GUI.createSlider('pQuantize', {
      type: "slider", label: "Quantize", value: 0.0, min: 0.0, max: 1.0,
      precision: 2, scale: "linear", unit:"" , width: 120
    }, targetDiv, this._onchange);
    var s_shuffle = GUI.createSlider('pShuffle', {
      type: "slider", label: "Shuffle", value: 0.0, min: 0.0, max: 1.0,
      precision: 2, scale: "linear", unit:"" , width: 120
    }, targetDiv, this._onchange);
    var b_rewind = GUI.createButton('pRewind', {
      type: "button", label: "Rewind", value: false, mode: "oneshot", width: 55
    }, targetDiv, this._onchange);
    var b_stop = GUI.createButton('pStop', {
      type: "button", label: "Stop", value: false, mode: "oneshot", width: 55
    }, targetDiv, this._onchange);
    var b_play = GUI.createButton('pPlay', {
      type: "button", label: "Play", value: false, mode: "toggle", width: 55
    }, targetDiv, this._onchange);
    var b_record = GUI.createButton('pRecord', {
      type: "button", label: "Record", value: false, mode: "toggle", width: 55
    }, targetDiv, this._onchange);
    var b_click = GUI.createButton('pMetronome', {
      type: "button", label: "Metronome", value: false, mode: "toggle", width: 70
    }, targetDiv, this._onchange);
    var s_tempo = GUI.createSlider('pTempo', {
      type: "slider", label: "Tempo", value: 120.0, min: 60.0, max: 240.0,
      precision: 2, scale: "linear", unit:"BPM" , width: 208
    }, targetDiv, this._onchange);

    // these elements can be controlled by manager's order
    var _controls = {
      'pQuantize': s_quantize,
      'pShuffle': s_shuffle,
      'pTempo': s_tempo,
      'pPlay': b_play,
      'pRecord': b_record
    };

    // order from manager
    this.order = function (target, value) {
      _controls[target].setValue(value);
    };

  }



  /**
   * TransportManager
   */
  function TransportManager () {

    // view
    this.view = new TransportView(this);
    // timeline
    this.timeline = GF.createTimeline(120.0);

    var loopStart = GF.createEvent(0, GF.mTime(0, 0));
    var loopEnd = GF.createEvent(0, GF.mTime(8, 0));
    this.timeline.setLoop(loopStart, loopEnd);
    this.timeline.enableLoop(true);

    this.timeline.addEventList(GF.EventManager.eventlist);
    this.timeline.addEventList(GF.EventManager.selectBuffer);
    var _sampler = GF.SamplerManager;

    // callback from EventManager
    GF.EventManager.notify = function (action, value) {
      //console.log(action, value);
      switch (action) {
        case 'playheadPosition':
          this.timeline.setMusicalNow(value);
          break;
      }
    }.bind(this);


    // scope caching
    var me = this;

    // load metronome sample
    var sample = WX.BufferMap({
      'metronome': 'data/metronome.wav'
    }, function () {
      me.timeline.setMetronomeSound(sample.getBufferByName('metronome'));
    });

    // TEMP: display time
    // var div_display = document.getElementById('i-display');

    // loop runner
    function _loop() {
      me.timeline.advance();
      var now = me.timeline.getMusicalNow();
      // TEMP: display current time
      // div_display.textContent = now.beat + " : " + now.tick;

      // 1) set position at eventlist, selectbuffer
      var bucket = me.timeline.lookAheadEvents();
      if (bucket.length > 0) {
        // do something with events in bucket: play events with sampler
        for (var i = 0; i < bucket.length; i++) {
          var evt = GF.EventManager.eventFilter.filter(bucket[i]);
          _sampler.playEvent(evt, me.timeline.getAbsoluteTime(evt));
        }
      }

      // update graphics
      GF.EventManager.setParam('playheadPosition', GF.mTick(now));
      GF.EventManager.updateView();
      requestAnimationFrame(_loop);
    }
    _loop();
  };

  TransportManager.prototype = {
    // report from view
    report: function (element, action, value) {
      //console.log(element, action, value);
      // do something here...
      switch (element) {
        case 'pRewind':
          this.timeline.rewind();
          break;
        case 'pStop':
          this.timeline.stop();
          this.order('pPlay', false);
          this.order('pRecord', false);
          break;
        case 'pPlay':
          if (value) {
            this.timeline.start();
          } else {
            this.timeline.stop();
          }
          break;
        case 'pRecord':
          break;
        case 'pMetronome':
          this.timeline.useMetronome(value);
          break;
        case 'pTempo':
          this.timeline.setBPM(value);
          break;
        case 'pShuffle':
          GF.EventManager.eventFilter.setSwing(value);
          break;
        case 'pQuantize':
          GF.EventManager.eventFilter.setQuantize(value);
          break;
      }
    },

    // order to the view
    order: function (target, value) {
      this.view.order(target, value);
    }
  };


  /**
   * initiate
   */
  GF.TransportManager = new TransportManager();

})(GF, GUI, WX);