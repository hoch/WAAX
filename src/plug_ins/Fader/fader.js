/**
 * @wapl Fader
 * @author Hongchan Choi (hoch, hongchan.choi@gmail.com)
 */
(function (WX) {

  function Fader(preset) {
    // adding modules
    WX.PlugIn.defineType(this, 'Processor');

    // node creation and patching
    // this._panner = WX.Panner();
    // this._input.to(this._panner).to(this._output);
    
    this._input.to(this._output);

    // this._panner.panningModel = 'equalpower';

    WX.defineParams(this, {

      output: {
        type: 'Generic',
        name: 'Output',
        default: 1.0,
        min: 0.0,
        max: 3.9810717055349722,
        unit: 'LinearGain'
      },

      mute: {
        type: 'Boolean',
        name: 'Mute',
        default: false
      },

      // pan: {
      //   type: 'Generic',
      //   name: 'Pan',
      //   default: 0.0,
      //   min: -1.0,
      //   max: 1.0
      // },

      dB: {
        type: 'Generic',
        name: 'dB',
        default: 0.0,
        min: -60,
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
      version: '0.0.3',
      api_version: '1.0.0-alpha',
      author: 'Hongchan Choi',
      type: 'Processor',
      description: 'Channel Fader'
    },

    defaultPreset: {
      mute: false,
      // pan: 0.0,
      dB: 0.0
    },

    $mute: function (value, time, rampType) {
      if (value) {
        this._outlet.gain.set(0.0, WX.now, 0);
      } else {
        this._outlet.gain.set(1.0, WX.now, 0);
      }
    },

    // $pan: function (value, time, rampType) {
    //   // TODO: compensate pan model attenuation (z=0.5)
    //   this._panner.setPosition(value, 0, 0.5);
    // },

    $dB: function (value, time, rampType) {
      this.params.output.set(WX.dbtolin(value), time, rampType);
      // console.log(this);
      // this._output.gain.set(WX.dbtolin(value), WX.now + 0.02, 1);
    }

  };

  WX.PlugIn.extendPrototype(Fader, 'Processor');
  WX.PlugIn.register(Fader);

  // NOTE: built in master output fader
  WX.Master = WX.Fader();
  WX.Master.to(WX._ctx.destination);

})(WX);