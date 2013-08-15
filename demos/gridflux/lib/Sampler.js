/**
 * SamplerView and SamplerManager module
 * @dependency Timeline, Event, EventList, Metronome
 * @dependency UISlider, UIButton, WAAX core
 */


GF.Sampler = (function (GF, GUI, WX) {

  /**
   * some globals here
   */

  /**
   * temporary sampler class
   */
  function Sampler() {
    this.setBufferMap = function (buffermap) {
      this._bufferMap = buffermap;
      this._buffer = this._bufferMap.getBufferByIndex(0);
    }

    this.setBufferByName = function (name) {
      this._buffer = this._bufferMap.getBufferByName(name);
    }

    this.play = function (event, time) {
      var source = WX.context.createBufferSource();
      var volume = WX.context.createGain();
      source.connect(volume);
      volume.connect(WX.context.destination);

      source.buffer = this._bufferMap.getBufferByIndex(event.lane);
      volume.gain.setValueAtTime(event.params.intensity, time);
      source.start(time);
      source.stop(time + source.buffer.duration);
    }
  }

  /**
   * SamplerView
   */
  function SamplerView (manager) {

    // report changes to manager
    this._onchange = function (elementName, action, value) {
      manager.report.call(manager, elementName, action, value);
    };

    // find DOM and fill GUI elements
    // var targetDiv = document.getElementById('i-sec-xport');
    // var s_quantize = GUI.createSlider('pQuantize', {
    //   type: "slider", label: "Quantize", value: 0.0, min: 0.0, max: 1.0,
    //   precision: 2, scale: "linear", unit:"" , width: 120
    // }, targetDiv, this._onchange);
    // var s_shuffle = GUI.createSlider('pShuffle', {
    //   type: "slider", label: "Shuffle", value: 0.0, min: 0.0, max: 1.0,
    //   precision: 2, scale: "linear", unit:"" , width: 120
    // }, targetDiv, this._onchange);
    // var b_rewind = GUI.createButton('pRewind', {
    //   type: "button", label: "Rewind", value: false, mode: "oneshot", width: 55
    // }, targetDiv, this._onchange);
    // var b_stop = GUI.createButton('pStop', {
    //   type: "button", label: "Stop", value: false, mode: "oneshot", width: 55
    // }, targetDiv, this._onchange);
    // var b_play = GUI.createButton('pPlay', {
    //   type: "button", label: "Play", value: false, mode: "toggle", width: 55
    // }, targetDiv, this._onchange);
    // var b_record = GUI.createButton('pRecord', {
    //   type: "button", label: "Record", value: false, mode: "toggle", width: 55
    // }, targetDiv, this._onchange);
    // var b_click = GUI.createButton('pMetronome', {
    //   type: "button", label: "Metronome", value: false, mode: "toggle", width: 70
    // }, targetDiv, this._onchange);
    // var s_tempo = GUI.createSlider('pTempo', {
    //   type: "slider", label: "Tempo", value: 120.0, min: 60.0, max: 240.0,
    //   precision: 2, scale: "linear", unit:"BPM" , width: 208
    // }, targetDiv, this._onchange);

    // these elements can be controlled by manager's order
    // var _controls = {
    //   'pQuantize': s_quantize,
    //   'pShuffle': s_shuffle,
    //   'pTempo': s_tempo,
    //   'pPlay': b_play,
    //   'pRecord': b_record
    // };

    // order from manager
    // this.order = function (target, value) {
    //   _controls[target].setValue(value);
    // };

  }



  /**
   * SamplerManager
   */
  function SamplerManager () {

    // view
    this.view = new SamplerView(this);

    // sampler
    this.sampler = new Sampler();




    // scope caching
    var me = this;

    // load drum samples (temporary)
    var samples = WX.BufferMap({
      'ASRX KD1': 'data/ASR-X Kick 03.wav',
      'ASRX KD2': 'data/ASR-X Kick 11.wav',
      'ASRX KD3': 'data/ASR-X Kick 12.wav',
      'ASRX SD1': 'data/ASR-X Snare 03.wav',
      'ASRX SD2': 'data/ASR-X Snare 15.wav',
      'ASRX SD3': 'data/ASR-X Snare 23.wav',
      'ASRX HH1': 'data/ASR-X Hat 02.wav',
      'ASRX HH2': 'data/ASR-X Hat 03.wav',
      'ASRX HH3': 'data/ASR-X Hat 06.wav',
      'ASRX Cym': 'data/ASR-X Crash 1.wav',
      'Hip KD': 'data/HIP_KICK.wav',
      '808 Long KD': 'data/808_LNG_KICK.wav',
      'Hip SD': 'data/HIP_S_SN.wav',
      'Hip SD7': 'data/HIP_SN_7.wav',
      'Clap': 'data/F_CLAP_1.wav',
      'Rim': 'data/P_SN_RIM.wav'
    }, function () {
      me.sampler.setBufferMap(samples);
    });

  };

  SamplerManager.prototype = {
    // report from view
    report: function (element, action, value) {
      //console.log(element, action, value);
      switch (element) {
        // case 'pRewind':
        //   this.timeline.rewind();
        //   break;
      }
    },

    // order to the view
    order: function (target, value) {
      this.view.order(target, value);
    },

    playEvent: function (event, absTime) {
      this.sampler.play(event, absTime);
    }
  };


  /**
   * initiate
   */
  GF.SamplerManager = new SamplerManager();

})(GF, GUI, WX);