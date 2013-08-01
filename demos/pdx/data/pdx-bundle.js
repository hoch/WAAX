var Bundle = {

  info: {
    kVersion: 1.0,
    kAuthorID: '1976-0626-HOCH', // author id
    kUID: 'I-0004', // instrument|effect id
    kReference: 'http://www.google.com'
  },

  presets: {
    'Get Started': {
      pDrumkit: 'Akai MPC2000',
      pCellParams: [
        {
          pMute: false,
          pTune: 0.0,
          pVolume: 1.0,
          pSampleName: 'Hip KD',
          pEnvState: false,
          pAttack: 0.0,
          pHold: 0.0,
          pRelease: 1.0,
          pFilterState: true,
          pLSFreq: 250.0,
          pLSGain: 0.0,
          pHSFreq: 1250.0,
          pHSGain: 0.0,
          pPan: 0.5,
          pSend1: 0.0,
          pSend2: 0.0,
        } 
      ],
      pCompState: true,
      pCompThreshold: -1.3150684833526611,
      pCompRatio: 1.2876712083816528,
      pCompMakeup: 1.3698627698362973,
      pDistState: false,
      pDistDrive: 1.1856939792633057,
      pDlyAmt: 0.1,
      pDlyTime: 0.25,
      pDlyFeedback: 0.25,
      pVerbAmt: 0.1,
      pVerbPreset: '960 Large Bright Room',
      pMasterGain: 0.021917808800935745,
    }
  },

  payload: {
    // encoded binary data goes here
  }
};