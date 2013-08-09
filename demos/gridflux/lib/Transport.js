/**
 * TransportView and TransportManager module
 * @dependency Timeline, Event, EventList, Metronome
 * @dependency UISlider, UIButton
 */


GF.Transport = (function (GF, GUI) {

  /**
   * some globals here
   */


  /**
   * TransportView
   */
  function TransportView (manager) {

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
    var s_tempo = GUI.createSlider('pTempo', {
      type: "slider", label: "Tempo", value: 120.0, min: 60.0, max: 240.0,
      precision: 2, scale: "linear", unit:"BPM" , width: 240
    }, targetDiv, this._onchange);

    this.controls = {
      'pQuantize': s_quantize,
      'pShuffle': s_shuffle,
      'pTempo': s_tempo
    };

    this.order = function (target, value) {
      this.controls[target].setValue(value);
    };

  }


  /**
   * TransportManager
   */
  function TransportManager () {
    this.view = new TransportView(this);

    // Timeline
    // Metronome
  };

  TransportManager.prototype = {
    report: function (element, action, value) {
      console.log(element, action, value);
      // do something here...
    },
    order: function (target, value) {
      this.view.order(target, value);
    }
  };


  /**
   * initiate
   */
  GF.TransportManager = new TransportManager();

})(GF, GUI);