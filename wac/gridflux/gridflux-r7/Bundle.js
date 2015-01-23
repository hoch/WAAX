GF.Bundle = { ID: 'Bundle' };

(function (WX, MUI, GF) {

/*
firebase db structure

  id: gridflux@gmail.com
  pw: wodnjs64

  bundles: {
    'untitled 1': 'asdjiaosijdoaisjdoaisdj',
    'untitled 2': 'asdjiaosijdoaisjdoaisdj'
  }
  info: {
    version: '',
    author: ''
  },

 */

  // Parameters
  GF.Bundle.params = {
    pCurrentBundle: 'Bundle 1'
  };
  
  GF.Bundle.save = function () {
    var payload = {
      Sampler: GF.Sampler.getParams(),
      Master: GF.Master.getParams(),
      Sequence: GF.EventView.Manager.getSequence(),
      Transport: GF.Transport.getParams()
    };
    // TODO: put MODAL here. warning for overwrite
    var confirm = window.confirm('This will overwrite ' + 
      GF.Bundle.params.pCurrentBundle + ' bundle. Are you sure?');
    if (confirm) {
      // Update current bundle
      BUNDLE_DATA.bundles[GF.Bundle.params.pCurrentBundle] = payload;
    } else {
      // do nothing
    }
  };

  GF.Bundle.load = function () {
    var bundle = BUNDLE_DATA.bundles[GF.Bundle.params.pCurrentBundle];
    // Empty preset. Quit loading preset.
    if (bundle === 'value') 
      return;
    GF.Sampler.setParams(bundle.Sampler);
    GF.Master.setParams(bundle.Master);
    GF.EventView.Manager.setSequence(bundle.Sequence);
    GF.Transport.setParams(bundle.Transport);
    GF.Transport.Timeline.rewind();
  };

  GF.Bundle.setParam = function (paramName, value) {
    switch (paramName) {
      case 'pCurrentBundle':
        break;
    }
  };
  
  GF.Bundle.initialize = function (done) {

    var keys = Object.keys(BUNDLE_DATA.bundles);
    var collection = [];
    for (var i = 0; i < keys.length; i++) {
      collection.push({ key: keys[i], value: BUNDLE_DATA.bundles[keys[i]]});
    }

    MUI.$('bundle-list').setModel(collection);
    MUI.$('bundle-list').link(GF.Bundle, 'pCurrentBundle');
    MUI.$('bundle-save').onclick = GF.Bundle.save;
    MUI.$('bundle-load').onclick = GF.Bundle.load;

    done();
  };

  // Master is loaded. Now it can be initialized.
  GF.notifyController('bundle_loaded');

}(WX, MUI, GF));