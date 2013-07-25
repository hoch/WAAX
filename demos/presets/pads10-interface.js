var Interface =
{
  // section
  Presets: {
    name: "Preset",
    elements: {
      l_preset: {
        type: "list",
        name: "preset",
        value: "",
        data: {
          item1: value1,
          item2: value2,
          item3: value3
        },
        actions: Pads10.changePreset
      },
      l_drumkit: {},
      b_savePreset: {},
      b_importPreset: {},
      b_exportPreset: {}
    }
  },

  // section
  CellSetting: {
    Sample: {
      b_mute: {},
      l_sample: {},
      s_tune: {},
      s_volume: {}
    },
    Envelope: {
      b_envelope: {},
      s_attack: {},
      s_hold: {},
      s_release: {}
    },
    Filters: {
      b_filter: {},
      s_frequency: {},
      s_lsgain: {},
      s_hsgain: {}
    }
  },

  MasterEffects: {

  }



};


WX.checkAndReturn (value) {

}





/*



inlet
|    \-----------+
inputGain        |
                 |
(core)           |
                 |
outputGain       |
|                |
processed     bypassed
|                |
|     /----------+
outlet





 */