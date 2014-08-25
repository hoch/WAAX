/**
 * @wapl Fader
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */
(function (WX) {

  function Fader(preset) {
    // adding modules
    WX.PlugIn.defineType(this, 'Processor');

    // node creation and patching
    this._input.connect(this._output);

    WX.defineParams(this, {

      mute: {
        type: 'Boolean',
        default: false
      },

      dB: {
        type: 'Generic',
        default: 0.0,
        min: -90,
        max: 12.0,
        unit: 'Decibels'
      }

    });

    // initialize preset
    WX.PlugIn.initPreset(this, preset);
  }

  Fader.prototype = {

    info: {
      name: 'Fader',
      version: '0.0.2',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Processor',
      description: 'Channel Fader'
    },

    defaultPreset: {
      mute: false,
      dB: 0.0
    },

    $mute: function (value, time, xtype) {
      if (value) {
        this._outlet.gain.set(0.0, WX.now, 0);
      } else {
        this._outlet.gain.set(1.0, WX.now, 0);
      }
    },

    $dB: function (value, time, xtype) {
      this._output.gain.set(WX.dbtolin(value), time, xtype);
    }

  };

  WX.PlugIn.extendPrototype(Fader, 'Processor');
  WX.PlugIn.register(Fader);

  // NOTE: built in master output fader
  WX.Master = WX.Fader();
  WX.Master.to(WX.context.destination);

})(WX);