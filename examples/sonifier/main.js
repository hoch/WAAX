/**
 * Utilities
 */
var Util = {

  loadData: function (filename, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      callback(this.responseText);
    };
    xhr.open('get', filename, true);
    xhr.send();
  },

  parseCSV: function (csvdata) {
    var items = [], min, max;
    var lines = csvdata.split('\n');
    // first item
    var first = Number(lines[1].split(',')[1]);
    min = first;
    max = first;
    items.push(first);
    // and after that
    for (var i = 2; i < lines.length; i++) {
      var dataPoint = Number(lines[i].split(',')[1]);
      min = dataPoint < min ? dataPoint : min;
      max = dataPoint > max ? dataPoint : max;
      items.push(dataPoint);
    }
    return {
      items: items,
      min: min,
      max: max
    };
  }

};


/**
 * APP
 */
var APP = (function (WX, Util) {

  // start foundation
  $(document).foundation();

  // print WAAX version
  var domWAAXVersion = document.querySelector('#waax-ver');
  domWAAXVersion.textContent = WX.getVersion();

  // synth
  var synth = WX.FMKey7({
    output: 0.5,
    harmonicRatio: 15,
    modulationIndex: 0.9,
    balance: 0.5,
    filterFrequency: 1800,
    filterGain: -35,
    attack: 0.03,
    release: 0.3
  });

  synth.to(WX.Master);

  // note data
  var notemap = WX.NoteMap();

  // MUI routine
  MUI.start(function () {

    MUI.buildControls(synth, 'r-synth');

    Util.loadData(
      'data/longterm-monthly-temperature-sel.csv',
      function (data) {
        // load note
        var parsed = Util.parseCSV(data);
        for (var i = 0; i < parsed.items.length; i++) {
          if (parsed.items[i]) {
            var norm = (parsed.items[i] - parsed.min) / (parsed.max - parsed.min);
            var note = WX.Note(~~(norm * 24 + 48), 100, 120 * i, 60);
            notemap.push(note);
          }
        }
        // when ready
        WX.Transport.addNoteMap(notemap);
        WX.Transport.addTarget(synth);
        MUI.$('b-rew').onclick = WX.Transport.rewind.bind(WX.Transport);
        MUI.$('b-pause').onclick = WX.Transport.pause.bind(WX.Transport);
        MUI.$('b-play').onclick = WX.Transport.start.bind(WX.Transport);
      }
    );

    // data source selector
    MUI.$('s-data').setModel([
      {
        key: 'Monthly Temp.',
        value: 'longterm-monthly-temperature-sel.csv'
      }
    ]);

    MUI.$('s-data').setValue('longterm-monthly-temperature-sel.csv');

  });

})(WX, Util);

