WAAX (Web Audio API eXtension)
------------------------------
**A JavaScript Framework for Music/Audio Programming with Chrome**

```javascript
// FM sound with low-pass filter and ADSR envelope
var mod = new WX.Oscil({ frequency:50, gain:2.0 }),
    car = new WX.Oscil({ type:"sawtooth", frequency:880, gain:0.7 }),
    lpf = new WX.LPF({ cutoff: 1200.0, Q: 4.0 }),
    adsr = new WX.ADSR({ a:0.005, d:0.015, s:0.15, r:0.5 });
// connecting units
mod.to(car).to(lpf).to(adsr).to(WX.Out);
lpf.modulateWith(lfo);

// a simple drum sampler with compressor, reverb, and delay
var kd = new WX.Sampler({ source:"core/samples/kick-1.wav" }),
    sd = new WX.Sampler({ source:"core/samples/snare-1.wav" }),
    hh = new WX.Sampler({ source:"core/samples/hihat-1.wav" }),
    comp1 = new WX.Comp({ threshold:-20.0, ratio:8.0 }),
    verb1 = new WX.ConVerb({ source:"core/ir/1644-ambiencehall.wav", mix: 0.5 }),
    delay1 = new WX.FeedbackDelay({ delayTime:0.2, feedback:0.7, mix:0.25 }),
// connecting and setting units
kd.to(comp1).to(WX.Out);
sd.to(verb1).to(WX.Out);
hh.to(delay1).to(WX.Out);
comp1.gain = 2.0;

// noise with tremolo by LFO
var noise = new WX.Noise(),
    lfo = new WX.LFO({ rate:0.5, shape:'sine' }),
    fader1 = new WX.Fader();
// connecting and setting units    
noise.to(fader1).to(WX.Out);
fader1.modulateWith(lfo);
noise.gain = 0.01;
```
See it in action [here][3]:

WAAX is an experimental javascript framework for [Web Audio API][1] incorporated in Chrome. With music/sound creation in mind, it is designed to provide users with higher level of musical control: complex real-time sound synthesis, ready-made instruments, even a timebase system for sophisticated structure. (However, instruments and the timebase are not implemented in the current revision.)

The goal of this project is to make web audio programming more approachable by expanding the computer music domain with new web technologies that make the browser user-centered, highly-visualized and ever-connected. Also the library is strongly inspired by [THREE.js][2], which is one of WebGL JavaScript libraries being used most for web-based 3D graphics, and hopefully it can be a sonic counterpart in the audiovisual system on the browser.

In addition to core technology, the library is planned to embrace an interactive web-based IDE for rapid experiment and deployment. It will allow users to program music/sound and export a compiled code snippet for other web projects.

[1]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html "Web Audio API: W3C Editor's Draft"
[2]: https://github.com/mrdoob/three.js/ "THREE.js: Github Repo"
[3]: http://hoch.github.com/waax/examples/hellowaax.html


Concept
-------

As a framework rather than a library, it imposes a key concept with its layered structure:

    Node (Web Audio API) > Unit (WAAX Abstraction)
  
- **Node**: A node is a built-in atom of Web Audio API. The object can be interconnected to create an audio graph.

- **Unit**: An object provided by WAAX framework. It is conceptually identical to 'Unit Generator' of other audio programming environments. It consists of more than 2 Nodes encapsulating user-friendly features. Also handles several underlying mechanics for Web Audio API.


Connections
-----------
### Atomic connection
- *Node - Node* (use standard `connect()` method)

### WX-type connection
- *Unit - Unit* (use `to()` method)

### Semi WX-type connection
- *Unit - Node* (use `toNode()` method)
- *Node - Unit* (use `.connect(Unit._inlet)` method)


Unit Classes
------------
### Generators
`Oscil` `LFO` `Noise` `Sampler` 

### Envelopes
`ADSR`

### Effects
`LPF`
`HPF`
`FeedBackDelay`
`ConVerb`
`Compressor`


Instrument Classes
------------------
(not implemented in current revision)


Timebase Classes
----------------
(not implemented in current revision)


Data Classes
------------
(not implemented in current revision)


Networking Classes
------------------
(not implemented in current revision)


Utilities
---------
`random2` `random2f` `db2rms` `rms2db` `midi2freq` `freq2midi`