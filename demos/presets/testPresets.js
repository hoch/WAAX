var myPresetBundle = {"name":"","payload":[{"name":"Preset 1","params":[{"name":"Master","value":-6.500000000000014},{"name":"Mute","value":false},{"name":"Waveform","value":"Sqaure"},{"name":"Frequency","value":313.8459543639149},{"name":"Detune","value":64.99999999999977},{"name":"Gain","value":-11.750000000000028}]},{"name":"Preset 2","params":[{"name":"Master","value":0},{"name":"Mute","value":true},{"name":"Waveform","value":"Triangle"},{"name":"Frequency","value":1075.7021868231602},{"name":"Detune","value":-375},{"name":"Gain","value":-29.958333333333357}]}]};

var myProfile = {
  name: "padKontrol",
  MIDIRouteMap: {"72":["Detune"],"73":["Frequency"],"91":["Gain"],"92":["Master"]}
};

/*var myPresets = {
  name: "presetPackName",
  payload: [
    {
      name: "mypreset1",
      params: [
        { name: "Tune", value: "100" },
        { name: "Attack", value: "0.01" },
        { name: "Hold", value: "0.01" }
        //...
      ]
    },
    {
      name: "myPreset2",
      params: [] // ...
    }
  ]
};*/