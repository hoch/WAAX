# WX.Oscil
Multi-waveform oscillator with gain control.

## Parameters
| Parameter | Type    | Description     | Default  | Range |
|:---------:|:-------:|:---------------:|:--------:|:-----:|
| pType     | string  | waveform type   | 'sine'   | 'sine', 'square', 'sawtooth', 'triangle'|
| pFreq     | float   | frequency  | 440.0   |            |
| pGain     | float   | gain       | 0.25    |            ||


## Usage
```javascript
var osc = WX.Oscil({ pFreq: 440 });
osc.set('pType', 'sawtooth');
// gain ramping (0.5 to 0.0 in 2 seconds)
osc.set('pGain', 0.5).set('pGain', 0.0, 1, WX.now + 2);
WX.patch(osc, WX.Master);
```