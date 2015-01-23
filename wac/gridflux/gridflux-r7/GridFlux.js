// GridFlux
// 
// Namespace GF. The main controller.
var GF = {};

(function () {

  // Module flags.
  var READY = {
    master: false,
    sampler: false,
    timebase: false,
    eventView: false,
    transport: false,
    bundle: false
  };

  GF.ID = 'GFCore';

  // Asset lists.
  GF.Assets = {
    
    IR: {
      '960 Big Empty Church': 'data/ir/960-BigEmptyChurch.wav',
      '960 Brite Stage': 'data/ir/960-BriteStage.wav',
      '960 Large Bright Room': 'data/ir/960-LargeBrightRoom.wav',
      '960 Large Plate': 'data/ir/960-LargePlate.wav',
      'H3000 MetalVerb': 'data/ir/H3000-MetalVerb.wav',
      'H3000 Reverse Gate': 'data/ir/H3000-ReverseGate.wav',
      'SPX990 Reflections': 'data/ir/SPX990-ElecSNRPlate.wav',
      'SPX990 eSnare Plate': 'data/ir/SPX990-Reflections.wav',
      'UAD140 Master Plate': 'data/ir/UAD140-MasterPlate.wav'  
    },

    Samples: {
      "ASR-X Crash 1": "data/asrx/ASR-X Crash 1.wav",
      "ASR-X Hat 02": "data/asrx/ASR-X Hat 02.wav",
      "ASR-X Hat 03": "data/asrx/ASR-X Hat 03.wav",
      "ASR-X Hat 06": "data/asrx/ASR-X Hat 06.wav",
      "ASR-X Hat 07": "data/asrx/ASR-X Hat 07.wav",
      "ASR-X Kick 03": "data/asrx/ASR-X Kick 03.wav",
      "ASR-X Kick 11": "data/asrx/ASR-X Kick 11.wav",
      "ASR-X Kick 12": "data/asrx/ASR-X Kick 12.wav",
      "ASR-X Kick 25": "data/asrx/ASR-X Kick 25.wav",
      "ASR-X Snare 03": "data/asrx/ASR-X Snare 03.wav",
      "ASR-X Snare 15": "data/asrx/ASR-X Snare 15.wav",
      "ASR-X Snare 23": "data/asrx/ASR-X Snare 23.wav",
      "ASR-X Snare 40": "data/asrx/ASR-X Snare 40.wav",
      "808_LNG_KICK": "data/mpc2000/808_LNG_KICK.wav",
      "CRASH__1": "data/mpc2000/CRASH__1.wav",
      "EFEX_CY02_SA": "data/mpc2000/EFEX_CY02_SA.wav",
      "F_CLAP_1": "data/mpc2000/F_CLAP_1.wav",
      "HH_THIN": "data/mpc2000/HH_THIN.wav",
      "HH_THIN__OP": "data/mpc2000/HH_THIN__OP.wav",
      "HIP_KICK": "data/mpc2000/HIP_KICK.wav",
      "HIP_SN_7": "data/mpc2000/HIP_SN_7.wav",
      "HIP_S_SN": "data/mpc2000/HIP_S_SN.wav",
      "P_SN_RIM": "data/mpc2000/P_SN_RIM.wav",
      'fx-001': 'data/hochkit/fx-001.wav',
      'fx-002': 'data/hochkit/fx-002.wav',
      'hh-001': 'data/hochkit/hh-001.wav',
      'hh-002': 'data/hochkit/hh-002.wav',
      'hh-003': 'data/hochkit/hh-003.wav',
      'hh-004': 'data/hochkit/hh-004.wav',
      'kd-001': 'data/hochkit/kd-001.wav',
      'kd-002': 'data/hochkit/kd-002.wav',
      'kd-003': 'data/hochkit/kd-003.wav',
      'kd-004': 'data/hochkit/kd-004.wav',
      'kd-005': 'data/hochkit/kd-005.wav',
      'kd-006': 'data/hochkit/kd-006.wav',
      'kd-007': 'data/hochkit/kd-007.wav',
      'kd-008': 'data/hochkit/kd-008.wav',
      'kd-009': 'data/hochkit/kd-009.wav',
      'kd-010': 'data/hochkit/kd-010.wav',
      'kd-011': 'data/hochkit/kd-011.wav',
      'kd-012': 'data/hochkit/kd-012.wav',
      'oh-001': 'data/hochkit/oh-001.wav',
      'oh-002': 'data/hochkit/oh-002.wav',
      'oh-003': 'data/hochkit/oh-003.wav',
      'perc-001': 'data/hochkit/perc-001.wav',
      'perc-002': 'data/hochkit/perc-002.wav',
      'perc-003': 'data/hochkit/perc-003.wav',
      'perc-004': 'data/hochkit/perc-004.wav',
      'perc-005': 'data/hochkit/perc-005.wav',
      'sd-001': 'data/hochkit/sd-001.wav',
      'sd-002': 'data/hochkit/sd-002.wav',
      'sd-003': 'data/hochkit/sd-003.wav',
      'sd-004': 'data/hochkit/sd-004.wav',
      'sd-005': 'data/hochkit/sd-005.wav',
      'sd-006': 'data/hochkit/sd-006.wav',
      'sd-007': 'data/hochkit/sd-007.wav',
      'sd-008': 'data/hochkit/sd-008.wav',
      'sd-009': 'data/hochkit/sd-009.wav',
      'sd-010': 'data/hochkit/sd-010.wav',
      'sd-011': 'data/hochkit/sd-011.wav',
      'sd-012': 'data/hochkit/sd-012.wav'
    }
  };

  // MIDI and Keyboard map
  GF.MIDIMap = {
    61: 0, 69: 1, 65: 2, 63: 3,
    60: 4, 59: 5, 57: 6, 55: 7,
    49: 8, 51: 9, 68: 10, 56: 11,
    48: 12, 52: 13, 54: 14, 58: 15
  };

  GF.KeyboardMap = {
    55: 0, 56: 1, 57: 2, 48: 3,
    85: 4, 73: 5, 79: 6, 80: 7,
    74: 8, 75: 9, 76: 10, 186: 11,
    77: 12, 188: 13, 190: 14, 191: 15
  };

  // MUI elements list
  GF.MUIElements = [
    'xport-quantize',
    'xport-swing',
    'xport-tempo',
    'xport-play',
    'xport-record',
    'xport-metro',
    'chorus-rate',
    'chorus-intensity',
    'delay-time',
    'delay-feedback',
    'reverb-preset',
    'reverb-mix',
    'sat-active',
    'sat-quality',
    'sat-drive',
    'comp-active',
    'comp-threshold',
    'comp-ratio',
    'comp-attack',
    'comp-release',
    'comp-makeup',
    'master-out',
    'sample-select',
    'sample-active',
    'sample-tune',
    'env-active',
    'env-attack',
    'env-hold',
    'env-release',
    'eq-active',
    'eq-lfreq',
    'eq-lgain',
    'eq-hfreq',
    'eq-hgain',
    'output-send1',
    'output-send2',
    'output-send3',
    'output-pan',
    'output-volume'
  ];

  // Assertion utility.
  GF.ASSERT = function (statement) {
    if (statement)
      return;
    else
      throw Error('[GF_EXCEPTION] assertion failed.');
  };

  GF.DEBUG = function (ref, message) {
    console.log(ref.ID + ': ' + message);
  };

  GF.checkModulesReady = function () {
    var allModulesReady = true;
    for (var module in READY) {
      if (!READY[module])
        allModulesReady = false;
    }
    // allModulesReady = READY.master;
    return allModulesReady;
  };

  GF.checkMUIElementsReady = function () {
    var allElementsReady = true;
    for (var i = 0; i < GF.MUIElements.length; i++) {
      if (!MUI.$(GF.MUIElements[i]).link) {
        GF.DEBUG(GF, GF.MUIElements[i] + ' element not ready.');
        allElementsReady = false;
      }
    }
    return allElementsReady;
  };

  // Check all the MUI elements and modules and launch initializers.
  GF.start = function () {
    GF.DEBUG(GF, 'starting...');
    if (GF.checkModulesReady() && GF.checkMUIElementsReady()) {
      // TO FIX: serialize execution.
      GF.Master.initialize(function () {
        GF.Sampler.initialize(function () {
          var modal = document.getElementById('i-modal');
          modal.style.display = "none";
        });  
      });
      GF.Transport.initialize(function () {});
      GF.Bundle.initialize(function () {});
      
      GF.DEBUG(GF, 'initialized.');
      return;
    } else {
      GF.DEBUG(GF, 'waiting...');
      setTimeout(GF.start, 1000);
    }
  };

  // Message notifier from sub modules.
  GF.notifyController = function (message) {
    switch (message) {

      case 'master_loaded':
        READY.master = true;
        break;
      case 'sampler_loaded':
        READY.sampler = true;
        break;
      case 'timebase_loaded':
        READY.timebase = true;
        break;
      case 'eventview_loaded':
        READY.eventView = true;
        break;
      case 'transport_loaded':
        READY.transport = true;
        break;
      case 'bundle_loaded':
        READY.bundle = true;
        break;
    }
  };

})(WX);