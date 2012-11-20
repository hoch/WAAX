###Current Milestone (11/19~11/25)

* Gen3.js (2 Osc + Noise Gen)
* FMOp.js
* WaveTab.js

* LPF24.js
* ConVerb.js
* Comp.js

* Timebase.js `Clip` `Clock`


###Questions
1. does offlineAudioContext exist in current implementation?
2. why does "stop()" method irreversible? is this to save resources as well?
3. using "worker" for virtual machine/timing mechanism

4. Clock(dispatcher) needs to be just one shot (no needs to start/stop)
5. Clip registered to dispatcher and dispatcher advance/update all the clip with consistent callback
5.5 WXevent = Measure:Beat:Tick

ex) 
  var e = new WX.Event([1, 2, 120]);
  var note = new WX.Note(e, Vel, Pitch);
  

6. using web workers for... offline FFT?


----------


WAAX (Web Audio API eXtension)
------------------------------
**A JavaScript Framework for Music/Audio Programming on Modern Browsers (Chrome/Safari/FireFox)**

```javascript
var myMod = new WX.Osc("SIN");
var myCar = new WX.Osc("SAW");
var myLpf = new WX.LPF();
var myAdsr = new WX.ADSR(5, 15, 0.35, 60);
var myDly = new WX.Delay(250, 0.15);
var myVerb = new WX.ConVerb("core/ir/1644-960ambiencehall.wav");
var myClip = new WX.Clip(5.0);

myMod.setGain(10.0).setFreq(100);
myCar.setGain(0.4).setFreq(880);
myLpf.setCutoff(1200.0).setQ(4.0);
myDly.setFeedbackGain(0.5);
myVerb.setMix(0.25);

myMod.to(myCar).to(myLpf).to(myAdsr).to(myDly).to(myVerb).to(WX.Out);
```

WAAX is an experimental javascript framework for [Web Audio API][1] incorporated in the modern browsers such as Chrome, Safari and FireFox. With music/sound creation in mind, it is designed to provide users with higher level of musical control: complex real-time sound synthesis, ready-made instruments, even a timebase system for sophisticated structure.

The goal of this project is to make web audio programming more approachable by expanding the audio domain with new web technologies that make the browser user-centered, highly-visualized and ever-connected. Also the library is strongly inspired by [THREE.js][2], which is one of WebGL JavaScript libraries being used most in the scene, and hopefully it can be a sonic counterpart in the web-based audiovisual system.

In addition to core technology, the library comes with an interactive web-based IDE for rapid experiment and deployment. It allows users to perform JavaScript audio programming and export the code snippet for other web projects.

The author of this project is Hongchan Choi at [CCRMA][3], Stanford University.

[1]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html "Web Audio API: W3C Editor's Draft"
[2]: https://github.com/mrdoob/three.js/ "THREE.js: Github Repo"
[3]: https://ccrma.stanford.edu/ "The Center for Computer Research in Music and Acoustics at Stanford"



Concept
-------

As a framework rather than a library, it imposes a key concept and methodology with its layered structure:

    Node (pure Web Audio API level) > Unit (WAAX Abstraction)
  
- **Node**: A node is a built-in atom of Web Audio API. The object can be interconnected to create an audio graph.

- **Unit**: A atom object provided by WAAX framework. It is conceptually identical to 'Unit Generator' of other audio programming environment. It consists of more than 2 Nodes encapsulating user-friendly features. Also handles several underlying mechanics for Web Audio API.



Connections
-----------

###Atomic connection
- *Node - Node* (connection between Web Audio API nodes)

###WX-type connection
- *Unit - Unit*



Unit Classes
------------
###Generators
`Osc` `Osc3`
`FMOp` `FM3` `FM7`
`WaveTab` `WaveTab3`
`Samp1` `SampX`

###Envelopes
`Ramp` `ADSR` `EnvFol`

###Effects
`LPF` `HPF` `Notch` `EQ3` `EQ5`
`Delay` `FBDelay` `StereoDelay` `NTapDelay` `Chorus` `Flanger`
`APVerb` `ConVerb`
`Compressor` `Gate` `DeEsser` `QuadComp` `Limiter`
`OverD` `Dist` `WaveShaper` `Enhancer` `Exciter`
`Vinyl`



Timebase Classes
----------------
- `Clock` a master clock for the context (singleton)
- `Clip` a logical unit of musical data (audio graph, note on/off, continuous parameter changes)
- `Dispatcher` a central device (singleton) that manages clips - user can add/remove clips to/from dispatcher, and also the dispatcher will terminate a clip when its life cycle is over.
- `Parser' 


Networking Classes
------------------
- `socket` enables full-duplex connection to other remote WAAX clients



Utilities
---------
`random2` `random2f`
`scale` 
`db2rms` `rms2db`
`midi2freq` `freq2midi`