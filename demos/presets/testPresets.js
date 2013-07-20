/* preset structure

  var preset1 = {
    name: "preset_name",
    params: [params1, params2, params3, .... ]
  }

  where,

  params = {
    name: "controller_name",
    value, etc...  
  }
*/

var savedPresets = {"Init":[{"type":"slider","name":"Master","unit":"dB","value":0,"min":-80,"max":0,"precision":2,"scale":"dB"},{"type":"button","name":"Mute","value":true,"mode":"toggle"},{"type":"indexed-list","name":"Waveform","value":"Sawtooth","data":["Sine","Sawtooth","Sqaure","Triangle","Custom"]},{"type":"slider","name":"Frequency","unit":"Hz","value":440,"min":60,"max":1760,"precision":1,"scale":"log"},{"type":"slider","name":"Detune","unit":"cents","value":0,"min":-1200,"max":1200,"precision":0.1,"scale":"linear"},{"type":"slider","name":"Gain","unit":"dB","value":-6,"min":-80,"max":12,"precision":2,"scale":"linear"}],"Preset 2":[{"type":"slider","name":"Master","unit":"dB","value":-19.16666666666667,"min":-80,"max":0,"precision":2,"scale":"dB"},{"type":"button","name":"Mute","value":true,"mode":"toggle"},{"type":"indexed-list","name":"Waveform","value":"Sawtooth","data":["Sine","Sawtooth","Sqaure","Triangle","Custom"]},{"type":"slider","name":"Frequency","unit":"Hz","value":268.8205527631268,"min":60,"max":1760,"precision":1,"scale":"log"},{"type":"slider","name":"Detune","unit":"cents","value":-600,"min":-1200,"max":1200,"precision":0.1,"scale":"linear"},{"type":"slider","name":"Gain","unit":"dB","value":-36.666666666666664,"min":-80,"max":12,"precision":2,"scale":"linear"}],"Preset 3":[{"type":"slider","name":"Master","unit":"dB","value":-40.833333333333336,"min":-80,"max":0,"precision":2,"scale":"dB"},{"type":"button","name":"Mute","value":false,"mode":"toggle"},{"type":"indexed-list","name":"Waveform","value":"Sine","data":["Sine","Sawtooth","Sqaure","Triangle","Custom"]},{"type":"slider","name":"Frequency","unit":"Hz","value":115.51067332652707,"min":60,"max":1760,"precision":1,"scale":"log"},{"type":"slider","name":"Detune","unit":"cents","value":150,"min":-1200,"max":1200,"precision":0.1,"scale":"linear"},{"type":"slider","name":"Gain","unit":"dB","value":-57.75,"min":-80,"max":12,"precision":2,"scale":"linear"}]};