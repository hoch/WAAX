/**
 * bootstrap.js: the last step - initializing, building units...
 */
(function () {
  // TODO: does it have to check "document.ready"?
  // - some GUI stuffs require target DIVs to be present

  // splash message
  wx._log.post("waax(" + wx.version + ")");
  wx._log.verbose(false);

  // inject units into the namespace
  wx._unit.factory([
    { name: "fader", ref: wx._unit.fader },
    { name: "oscil", ref: wx._unit.oscil }
  ]);

  // create master fader
  // TODO: multichannel support??
  wx.dac = wx.fader();
  wx.dac.connect(wx.context.destination);
  wx._log.info("master fader created. (wx.dac)");
})();