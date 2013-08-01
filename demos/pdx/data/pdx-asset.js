/**
 * system-wide asset namespace
 * @type {Object}
 */
var Asset = {};


/**
 * Drumkits
 * @type {Object}
 */
Asset.Drumkits = {

  'Akai MPC2000': {
    reference: 'www.kb6.de',
    payload: {
      'Hip KD': 'data/mpc2000/HIP_KICK.wav',
      '808 Long KD': 'data/mpc2000/808_LNG_KICK.wav',
      'Hip SD': 'data/mpc2000/HIP_S_SN.wav',
      'Hip SD7': 'data/mpc2000/HIP_SN_7.wav',
      'Clap': 'data/mpc2000/F_CLAP_1.wav',
      'Rim': 'data/mpc2000/P_SN_RIM.wav',
      'HH Thin': 'data/mpc2000/HH_THIN.wav',
      'Hh Open': 'data/mpc2000/HH_THIN__OP.wav',
      'Rev Crash': 'data/mpc2000/CRASH__1.wav',
      'Crash FX': 'data/mpc2000/EFEX_CY02_SA.wav'
    }
  },

  'Emu SP-12': {
    reference: 'www.kb6.de',
    payload: {
      'KD1': 'data/sp12/kd1.wav',
      'KD2': 'data/sp12/kd2.wav',
      'SD1': 'data/sp12/sd1.wav',
      'SD2': 'data/sp12/sd2.wav',
      'SD3': 'data/sp12/sd3.wav',
      'Rim': 'data/sp12/rim.wav',
      'HH': 'data/sp12/hh1.wav',
      'HH open': 'data/sp12/hh2.wav',
      'FX1': 'data/sp12/fx1.wav',
      'FX2': 'data/sp12/fx2.wav'
    }
  },

  'Roland TR-909': {
    reference: 'http://cl516.blogspot.com/2009/04/free-tr-909-samples.html',
    payload: {
      '909 BD': 'data/tr909/909BD.wav',
      '909 SD': 'data/tr909/909snare.wav',
      '909 Rim': 'data/tr909/909rim.wav',
      '909 Clap': 'data/tr909/909clap.wav',
      '909 HH': 'data/tr909/909hat.wav',
      '909 HH2': 'data/tr909/909hat2.wav',
      '909 Tom1': 'data/tr909/909ltom.wav',
      '909 Tom3': 'data/tr909/909hitom.wav',
      '909 Cym Ride': 'data/tr909/909ride.wav',
      '909 Cym Crash': 'data/tr909/909crash.wav'
    }
  },

  'Roland CR-78': {
    reference: 'http://www.boxedear.com/free.html',
    payload: {
      'CR KD': 'data/cr78/Kick Accent.wav',
      'CR SD': 'data/cr78/Snare Accent.wav',
      'CR Rim': 'data/cr78/Rim Shot.wav',
      'CR HH1': 'data/cr78/HiHat Accent.wav',
      'CR HH2': 'data/cr78/HiHat Metal.wav',
      'CR Tamb': 'data/cr78/Tamb 1.wav',
      'CR Perc1': 'data/cr78/Bongo High.wav',
      'CR Perc2': 'data/cr78/Bongo Low.wav',
      'CR Perc3': 'data/cr78/Conga Low.wav',
      'CR Cym': 'data/cr78/Cymbal.wav'
    }
  },

  'LinnDrum LM-1': {
    reference: 'www.kb6.de',
    payload: {
      'LM KD1': 'data/lm1/kick1.wav',
      'LM KD2': 'data/lm1/kick2.wav',
      'LM SD1': 'data/lm1/sd1.wav',
      'LM SD2': 'data/lm1/sd2.wav',
      'LM HH1': 'data/lm1/chh.wav',
      'LM HH2': 'data/lm1/ohh.wav',
      'LM Clap': 'data/lm1/clap.wav',
      'LM Cowbell': 'data/lm1/cowb.wav',
      'LM Tamb': 'data/lm1/tamb.wav',
      'LM Cym Crash': 'data/lm1/crash.wav'
    }
  },

  'Ensoniq ASR-X': {
    reference: 'www.kb6.de',
    payload: {
      'ASRX KD1': 'data/asrx/ASR-X Kick 03.wav',
      'ASRX KD2': 'data/asrx/ASR-X Kick 11.wav',
      'ASRX KD3': 'data/asrx/ASR-X Kick 12.wav',
      'ASRX SD1': 'data/asrx/ASR-X Snare 03.wav',
      'ASRX SD2': 'data/asrx/ASR-X Snare 15.wav',
      'ASRX SD3': 'data/asrx/ASR-X Snare 23.wav',
      'ASRX HH1': 'data/asrx/ASR-X Hat 02.wav',
      'ASRX HH2': 'data/asrx/ASR-X Hat 03.wav',
      'ASRX HH3': 'data/asrx/ASR-X Hat 06.wav',
      'ASRX Cym': 'data/asrx/ASR-X Crash 1.wav'
    }
  }

};


/**
 * ImpulseResponses
 * @type {Object}
 */
Asset.ImpulseResponses = {

  'Default': {
    reference: 'www.google.com',
    payload: {
      '960 Big Empty Church': 'data/ir/960-BigEmptyChurch.wav',
      '960 Brite Stage': 'data/ir/960-BriteStage.wav',
      '960 Large Bright Room': 'data/ir/960-LargeBrightRoom.wav',
      '960 Large Plate': 'data/ir/960-LargePlate.wav',
      'H3000 MetalVerb': 'data/ir/H3000-MetalVerb.wav',
      'H3000 Reverse Gate': 'data/ir/H3000-ReverseGate.wav',
      'SPX990 Reflections': 'data/ir/SPX990-ElecSNRPlate.wav',
      'SPX990 eSnare Plate': 'data/ir/SPX990-Reflections.wav',
      'UAD140 Master Plate': 'data/ir/UAD140-MasterPlate.wav'
    }
  }


};


/**
 * InteractionProfile
 * @type {Object}
 */
Asset.InteractionProfile = {
  
  MIDINoteToPad: {
    "48": 0,
    "52": 1,
    "54": 2,
    "58": 3,
    "51": 4,
    "49": 5,
    "68": 6,
    "56": 7,
    "60": 8,
    "59": 9
  },

  MIDICCToControl: {
    "71": "cLSFreq",
    "74": "cHSFreq",
    "91": "cVerbAmt",
    "93": "cDlyAmt"
  },

  KeyCodeToPad: {
    "81": 0,
    "87": 1,
    "69": 2,
    "82": 3,
    "84": 4,
    "65": 5,
    "83": 6,
    "68": 7,
    "70": 8,
    "71": 9
  },

  MouseToControl: {
    
  }

};