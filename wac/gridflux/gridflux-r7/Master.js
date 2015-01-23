// Master module.
// : Master channel audiograph.
//
//   input   send1   send2   send3
//     |       |       |       |
//   crush   chorus  delay   reverb
//     |-------+-------+-------+
//    comp
//     |
//   master

// Namespace Master
GF.Master = { ID: 'GFMaster' };

(function (WX, MUI, GF) {

  // audio graph
  GF.Master.nInput = WX.nGain();
  GF.Master.nSend1 = WX.nGain();
  GF.Master.nSend2 = WX.nGain();
  GF.Master.nSend3 = WX.nGain();

  var uChorus = WX.Chorus();
  var uPingpong = WX.Pingpong();
  var uConverb = WX.Converb();
  var uSat = WX.Saturator();
  var uComp = WX.Comp();

  GF.Master.nSend1.connect(uChorus.inlet);
  GF.Master.nSend2.connect(uPingpong.inlet);
  GF.Master.nSend3.connect(uConverb.inlet);
  GF.Master.nInput.connect(uSat.inlet);
  uSat.connect(uComp.inlet);
  uChorus.to(uSat);
  uPingpong.to(uSat);
  uConverb.to(uSat);
  uComp.to(WX.DAC);

  var buffermap = null;
  
  GF.Master.getParams = function () {
    var params = [];
    params.push(uChorus.getParams());
    params.push(uPingpong.getParams());
    params.push(uConverb.getParams());
    params.push(uSat.getParams());
    params.push(uComp.getParams());
    params.push(WX.DAC.getParams());
    return params;
  };

  GF.Master.setParams = function (params) {
    uChorus.setParams(params[0]);
    uPingpong.setParams(params[1]);
    uConverb.setParams(params[2]);
    uSat.setParams(params[3]);
    uComp.setParams(params[4]);
    WX.DAC.setParams(params[5]);
  };

  GF.Master.initialize = function (done) {
    GF.DEBUG(GF.Master, 'initializing...');

    MUI.$('chorus-rate').link(uChorus, 'pRate');
    MUI.$('chorus-intensity').link(uChorus, 'pIntensity');
    MUI.$('delay-time').link(uPingpong, 'pDelayTime');
    MUI.$('delay-feedback').link(uPingpong, 'pFeedback');
    MUI.$('reverb-preset').link(uConverb, 'pImpulseResponse');
    MUI.$('reverb-mix').link(uConverb, 'pMix');
    MUI.$('sat-active').link(uSat, 'pActive');
    MUI.$('sat-quality').link(uSat, 'pQuality');
    MUI.$('sat-drive').link(uSat, 'pDrive');
    MUI.$('comp-active').link(uComp, 'pActive');
    MUI.$('comp-threshold').link(uComp, 'pThreshold');
    MUI.$('comp-ratio').link(uComp, 'pRatio');
    MUI.$('comp-attack').link(uComp, 'pAttack');
    MUI.$('comp-release').link(uComp, 'pRelease');
    MUI.$('comp-makeup').link(uComp, 'pMakeup');
    MUI.$('master-out').link(WX.DAC, 'pdB');

    buffermap = WX.BufferMap(GF.Assets.IR, function () {
      uConverb.setBuffermap(buffermap);
      uConverb.setParam('pImpulseResponse', buffermap.getBufferNames()[0]);
      MUI.$('reverb-preset').setModel(buffermap.getCollection());
      GF.DEBUG(GF.Master, 'initialized.');
      if (typeof done === 'function')
        done();
    });
  };

  // Master is loaded. Now it can be initialized.
  GF.notifyController('master_loaded');

})(WX, MUI, GF);