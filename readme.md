Layers
------
Node - Unit - Block - Module
* Transport
* Data Structure
* Visualization


Connections
-----------
Node -> Unit (semi WX connection)     "connect(Unit.node)" call
Unit -> Node (semi-web audio api)     "connect" method
Unit -> Unit (pure WAAX connection)   "to" method
Node -> Node (pure web audio api)     "connect" method

Unit -> Block
Block -> Block
Block -> Unit

block should have unit(input/output)
then all the connection will be between units




Structure
---------
WAAX.js

Utilities.js
  random2(), random2f(), scale(), db2rms(), 
  midi2freq(), freq2midi()

/Units
  <Gen>
  Oscillator(), FMOperator(), Wavetable(), SampleBuffer(),
  ADSR(), EnvelopeFollower(),
  <Efx>
  Delay(), Filter(), Reverb(), Compressor(), Waveshaper()

/Blocks
  <Synth>
  Osc2(), Osc3(), FM3(), FM7(), WaveTab3(), Samplex()  
  <Processor>
  ResonZ(), LPF(), HPF(), EQ3(), EQ5(), EQ7(), 
  StereoDelay(), Chorus(), Flanger(),
  ConVerb(), NVerb(), 
  QuadComp(), Limiter(), Gate(), DeEsser(),
  Enhancer(), Exciter(), Overdrive(), Vinyl()
  
/Modules
  SynaMon()
  FMOne()
  Xpler

/Timebase
  Clip()


Milestone
---------
(1.5 week)
BB & Preset: Oscillator() -> Osc2()
BB & Preset: Filter() -> ResonZ(), HPF()
BB: Envelope() -> Fader for OSC2
BB: Envelope() -> Filter
BB & Preset: Delay() -> StereoDelay()
Instrument: SynaMon()
time-base

Questions
---------
1) does offlineAudioContext exist in current implementation?
2) why does "stop()" method irreversible? is this to save resources as well?

