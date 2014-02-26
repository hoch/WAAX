# Unit Reference

### Unit Common Parameters (Unit Base Class)
| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pActive` | boolean | unit status (bypass on false) |    |
| `pGain` | float | unit output gain | yes  ||

### Unit Common Methods (Unit Base Class)

#### `set(paramName, value)`
sets value of target parameter immediately.

  - `paramName` *(string)* target parameter name
  - `value` *(float)* target value

#### `set(paramName, value, transType, time)`
schedules value of target parameter with specified transition and end time.

  - `paramName` *(string)* target parameter name
  - `value` *(float)* target value
  - `transType` *(int, string)* transition type: [1, 2, 3] or ['line', 'expo', 'target']
  - `time` *(float)* transition end time

#### `set(paramName, value, "target", time1, time2)`
schedules value of target parameter with exponential transition between start and end time.

  - `paramName` *(string)* target parameter name
  - `value` *(float)* target value
  - `time1` *(float)* transition start time
  - `time2` *(float)* transition end time

#### `to(unit)`
connects to WAAX unit.

  - `unit` *(wxunit)* WAAX Unit with inlet

#### `connect(audioNode)`
connects to Web Audio API node.

  - `unit` *(wxunit)* WAAX Unit (with inlet)

#### `modulate(unit, paramName)`
modulates a parameter in target WAAX unit.

  - `unit` *(wxunit)* WAAX Unit
  - `paramName` *(string)* unit parameter


## WX.ADSR
Multi-phase envelope generator: attack, decay, sustain, release.

### WX.ADSR: Parameters
| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pAttack` | float | attacking time in seconds |  |
| `pDecay` | float | decay time in seconds |  |
| `pSustain` | float | gain in sustain phase |  |
| `pRelease` | float | release time in seconds |  |
| `pTimeConstant` | float | time constant of exponential curve for release phase |  ||

### WX.ADSR: Methods

#### `setADSR(attack, decay, sustain, release)`
  - `attack` *(float)* attack time in seconds
  - `decay` *(float)* decay time in seconds
  - `sustain` *(float)* gain in sustain phase
  - `release` *(float)* release time in seconds


## WX.Chorus
Chorus effect based on [the paper by Jon Dattorro](https://ccrma.stanford.edu/~dattorro/EffectDesignPart2.pdf).

### WX.Chorus: Parameters
| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pRate` | float | LFO speed for modulation |    |
| `pDepth` | float | LFO depth for modulation |    |
| `pIntensity` | float | internal feedback intensity |    |
| `pBlend` | float | blend amount between feedback and feedforward |    |
| `pMix` | float | mix amount between wet and dry signal |    ||


## WX.Comp
Compressor with variable knee setting. DynamicCompressor node in WAAX wrapper.

### WX.Comp: Parameters
| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pThreshold` | float | threshold in decibles |    |
| `pKnee` | float | knee (in decibels) |    |
| `pRatio` | float | compression ratio |    |
| `pAttack` | float | attack time |    |
| `pRelease` | float | release time |    ||


## WX.Converb
Convolution reverb with mix balance control.

### WX.Converb: Parameters
| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pMix` | float | mix amount between wet and dry signal |    ||

### WX.Converb: Methods

#### `setImpulseResponse(impulseResponse)`
  - `impulseResponse` *(audioBuffer)* impulse response buffer


## WX.Fader
Fader abstraction. Supports muting, gain control in decibels. Note that `WX.Master` is a pre-declared instance of this unit class.

### WX.Fader: Parameters
| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pMute` | boolean | muted when true |    |
| `pdB` | float | gain in decibels |    ||


## WX.FilterBank
Filterbank with 16 bandpass filters. Custom design for FrostPad demo.

### WX.FilterBank: Parameters
| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pPitch` | int | base pitch of filterbank |    |
| `pChord` | string | chord type* for harmonic structure |    |
| `pSlope` | float | gain balance between high end and low end |    |
| `pWidth` | float | bandwidth of filters |    |
| `pDetune` | float | detune of filter frequency |    ||

* chord type: 'ionian', 'lydian', 'mixolydian', 'aeolian'


## WX.FMop
FM operator consists of 2 sine oscillator.

### WX.FMop: Parameters
| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pFreq` | float | frequency of carrier, related to base pitch |    |
| `pHarmonicRatio` | float | harmonic coefficient between modulator and carrier frequency |    |
| `pModulationIndex` | float | gain coefficient of modulator output |    ||


### WX.FMop: Methods
#### `start(time)`
  - `time` *(float)* time in seconds for unit activation. optional.
#### `stop(time)`
  - `time` *(float)* time in seconds for unit deactivation. optional.


## WX.FormantV
Formant filter for simple vowel synthesis based on 2D vector positioning. It is heavily inspired by Ge Wang's joystick-formant demo.

### WX.FormantV: Parameters
| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pPositionX` | float | x position of 2d vector |    |
| `pPositionY` | float | y position of 2d vector |    ||

### WX.FormantV: Methods

#### `setPosition(x, y, transType, time1, time2)`
  - `x` *(float)* x position of 2d vector
  - `y` *(float)* y position of 2d vector
  - `transType` *(string | int)* additional argument for `.set()` method
  - `time1` *(float)* additional argument for `.set()` method
  - `time2` *(float)* additional argument for `.set()` method


## WX.ImpulseTrain
Impulse train generator based on oscillator node.

### WX.ImpulseTrain: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pFreq` | float | frequency of impulse train | yes |
| `pDynamic` | boolean | use dynamic mode |   ||

### WX.ImpulseTrain: Methods

#### `start(time)`
  - `time` *(float)* time in seconds for unit activation. optional.

#### `stop(time)`
  - `time` *(float)* time in seconds for unit deactivation. optional.



## WX.LPF
Low pass filter based on two biquad filter nodes. Enhanced mode will cascade two filters in serial resulting higher and narrow resonance.

### WX.LPF: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pCutoff` | float | filter frequency | yes |
| `pQ` | float | filter resonance | yes  |
| `pEnhanced` | boolean | enhanced mode |   ||


## WX.Noise
White noise (gaussian distribution) generator. The implementation is based on buffer source node to unsure the optimum performance.

### WX.Noise: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pGrain` | float | granularity of noise | yes |
| `pDynamic` | boolean | use dynamic mode |   ||

### WX.Noise: Methods

#### `start(time)`
  - `time` *(float)* time in seconds for unit activation. optional.

#### `stop(time)`
  - `time` *(float)* time in seconds for unit deactivation. optional.


## WX.Oscil
Multi-waveform oscillator with gain control.

### WX.Oscil: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pType` | string | waveform type* | |
| `pFreq` | float | oscillator frequency | yes |
| `pDynamic` | boolean | use dynamic mode |   ||

* waveform type: 'sine', 'square', 'sawtooth', 'triangle'

### WX.Oscil: Methods

#### `start(time)`
  - `time` *(float)* time in seconds for unit activation. optional.

#### `stop(time)`
  - `time` *(float)* time in seconds for unit deactivation. optional.


## WX.Phasor
Phasor implementation based on Chris Roger's idea of cascaded notch filters.

### WX.Phasor: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pRate` | float | LFO modulation speed | |
| `pDepth` | float | LFO modulation depth | |
| `pBaseFrequency` | float | base frequency of filter group |   |
| `pSpacing` | float | spacing factor for filter frequencies |   |
| `pMix` | float | mix amount between wet and dry signal |    ||


## WX.Pingpong
Stereo ping-pong delay with variable crosstalk between channels.

### WX.pingpong: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pDelayTimeLeft` | float | left delay time in seconds | |
| `pDelayTimeRight` | float | right delay time in seconds | |
| `pFeedbackLeft` | float | feedback amount for left delay channel | |
| `pFeedbackRight` | float | feedback amount for right delay channel | |
| `pCrosstlak` | float | crosstalk amount | |
| `pMix` | float | mix amount between wet and dry signal |    ||

### WX.pingpong: Methods

#### `setDelayTime(left, right, transtype, time1, time2)`
  - `left` *(float)* left delay time in seconds
  - `right` *(float)* right delay time in seconds

#### `setFeedback(left, right, transtype, time1, time2)`
  - `left` *(float)* feedback amount for left delay channel
  - `right` *(float)* feedback amount for right delay channel


## WX.Sampler
Buffer source node abstraction with additional features.

### WX.Sampler: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pPitch` | int | MIDI pitch for sample playback | |
| `pBasePitch` | int | base pitch for sample | |
| `pLoop` | boolean | loop mode | ||

### WX.Sampler: Methods

#### `onload(fn)`
Specifies callback function for sample buffer 'onload' event.

  - `fn` *(function)* function to be executed on sample loaded

#### `setBuffer(buffer)`
Assigns a sample buffer to sampler.

  - `buffer` *(audioBuffer)* sample buffer for sampler

#### `getDruation()`
Returns duration of sample buffer in seconds.

#### `oneshot(time, duration)`
Starts sample playback at specified time for duration. Useful for *trigger and forget* approach.

  - `time` *(float)* function to be executed on sample loaded
  - `duration` *(float)* function to be executed on sample loaded

#### `start(time)`
  - `time` *(float)* time in seconds for unit activation. optional.

#### `stop(time)`
  - `time` *(float)* time in seconds for unit deactivation. optional.


## WX.Saturator
Implements saturation effect based on WaveShaper node.

### WX.Saturator: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pQuality` | float | saturation quality | |
| `pDrive` | float | saturation amount | ||


## WX.Spectrum
Spectrum visualizer based on Analyser node.

### WX.Spectrum: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pSmoothingTimeConstant` | float | smoothing factor between succesive frames | |
| `pMaxDecibels` | float | maximum gain in decibels | |
| `pMinDecibels` | float | minimum gain in decibels | |
| `pScale` | string | frequency axis scale* | |
| `pAutoClear` | boolean | clear drawn visualization every frame | |
| `pShowGrid` | boolean | show reference(frequency/decibels) grid | ||

* scale: log | linear

### WX.Spectrum: Methods

#### `setContext2D(context)`
Sets 2d context (canvas) for visualization.

  - `context` *(context2d)* 2d context from canvas

#### `draw(color, gridColor)`
Draws visualization and reference grid with color setting. Use inside animation rendering loop.

  - `color` *(string)* visualization color
  - `gridColor` *(string)* reference grid color


## WX.Step
Control signal (DC offset) generator. Use with oscillator or envelope to generate modulation source signal.

### WX.Step: Methods

#### `stop(time)`
  - `time` *(float)* time in seconds for unit deactivation. optional.


## WX.StereoVisualizer
Stereo visualizer with user-defined render method.

### WX.StereoVisualizer: Parameters

| name | type | description | modulatable |
|:-------:|:-----:|:-------------------------:|:-----:|
| `pSmoothingTimeConstant` | float | smoothing factor between succesive frames | |
| `pMaxDecibels` | float | maximum gain in decibels | |
| `pMinDecibels` | float | minimum gain in decibels | ||

### WX.StereoVisualizer: Methods

#### `drawSpectrum()`
Draws frequency-domain visualization with user-defined render method. Use inside animation rendering loop.

#### `drawWaveform()`
Draws time-domain visualization with user-defined render method. Use inside animation rendering loop.

#### `onDraw(fn)`
Defines render algorithm for drawing methods.

  - `fn` *(function)* function to be executed every animation frame.

#### `_ondraw(buffer1, buffer2)`
Callback function for frame rendering. Defined by '.onDraw()' method.

  - `buffer1` *(Float32Array | Uint8Array)* buffer data for left channel
  - `buffer2` *(Float32Array | Uint8Array)* buffer data for right channel