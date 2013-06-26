/**
 * bootstrap.js: the last step - initializing, building units...
 */
(function () {
  // TODO: does it have to check "document.ready"?
  // - some GUI stuffs require target DIVs to be present

  // splash message
  WX._log.post("waax (" + WX.version + ")");
  WX._log.verbose(true);

  // inject units into the namespace
  WX._unit.factory([
    // generators
    { name: "Oscil", ref: WX._unit.oscil },
    { name: "Fmop", ref: WX._unit.fmop },
    { name: "Noise", ref: WX._unit.noise },
    { name: "ITrain", ref: WX._unit.itrain },
    { name: "ITrain2", ref: WX._unit.itrain2 },
    { name: "Sampler", ref: WX._unit.sampler },
    { name: "Step", ref: WX._unit.step },
    // processors
    { name: "Fader", ref: WX._unit.fader },
    { name: "ADSR", ref: WX._unit.adsr },
    { name: "Filter", ref: WX._unit.filter },
    { name: "Formant", ref: WX._unit.formant },
    { name: "FormantV", ref: WX._unit.formantv },
    { name: "Pingpong", ref: WX._unit.pingpong },
    { name: "Chorus", ref: WX._unit.chorus },
    { name: "Comp", ref: WX._unit.comp },
    { name: "Converb", ref: WX._unit.converb }
    // analyzers
  ]);

  // create master fader
  // TODO: multichannel support??
  WX.DAC = WX.Fader();
  WX.DAC.connect(WX.context.destination);
  WX._log.info("master fader created. (WX.DAC)");
})();