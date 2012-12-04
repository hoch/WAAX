### Current Milestone (12/4~12/7)

* Sampler.js : `S1`
  - calculating pitch, noteOn noteOff?
  - looping
* Comp.js : `C1`
* Timebase.js : `Clip` `Clock`
* First public commit on 12/10 as r1


### Next Milestone (12/10~12/15)

* Oscil3.js (2 Oscs + Noise Gen)
* WaveTab.js : `WaveTab`
* LPF24.js : `LPF24`


### Notes
1. does offlineAudioContext exist in current implementation?
2. why does "stop()" method irreversible? is this to save resources as well?
3. using "worker" for virtual machine/timing mechanism
4. Clock(dispatcher) needs to be just one shot (no needs to start/stop)
5. Clip registered to Timeline and it advances/updates all the clips with consistent callback from onaudioprocess (256 samples interval)
6. using web workers for... offline FFT?