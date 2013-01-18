WAAX (Web Audio API eXtension)
------------------------------
**A JavaScript library for Music/Audio Programming with Chrome**

```javascript
mySaw.to(myLPF).to(myADSR).to(WX.Out);
myLPF.modulateWith(myLFO);
```

WAAX is an experimental JavaScript library for [Web Audio API][1] incorporated in Chrome. With **music creation and performance** in mind, it is designed to provide users with higher level of abstraction.

The goal of this project is to make audio programming more approachable by encapsulating technical steps that web developers/designers have to go through to make sound out of Web Audio API. From computer musician's perspective, it will open up more possibility by integrating powerful web technologies to audio programming without sophisticated setup.

The library is strongly inspired by [THREE.js][2] and [ChucK][3]; Three.js is one of WebGL JavaScript libraries being used most for web-based 3D graphics. ChucK is "strongly-timed" audio programming language being actively developed and used by computer music communities of Princeton/Stanford university.

As the project grows, this library will embrace more features such as: ready-made instruments, comprehensive timebase system (in conjunction with Web MIDI API), and musical interconnection between Chrome clients.

See the demo ["hello WAAX"][4].

[1]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html "Web Audio API: W3C Editor's Draft"
[2]: https://github.com/mrdoob/three.js/ "THREE.js: Github Repo"
[3]: http://chuck.cs.princeton.edu/
[4]: http://hoch.github.com/waax/examples/hellowaax.html


Patching WAAX Units
-------------------

As Web Audio API has the "node" object, WAAX has its own atomic object called "unit". It is conceptually identical to 'Unit Generator' of other audio programming environments and consists of more than 2 Web Audio API nodes in general.
```javascript
// creating WAAX units
var kick = new WX.Sampler({ source: "kd.wav", basePitch: 60 }),
    comp = new WX.Comp({ threshold: -20.0, ratio: 8.0 });
// connect units
kick.to(comp).to(WX.Out);
```
As shown above, a WAAX unit is basically a JavaScript object that encapsulates user-friendly features by handling several underlying chores. The connection between several WAAX units can be achieved by chaining `.to()` method. `WX.Out` is the master fader of WAAX system.

The connection from a WAAX unit to Web Audio API node can be done by `.toNode()` method, but the connection from a node to an unit should be done manually.
```javascript
var node = myAudioContext.createGainNode();
// unit => node
kick.toNode(node);
// node => unit
node.connect(comp._inlet);
```

Class: Unit
-----------
**NOTE**: still in progress!
Unit classes in WAAX are largely based on the UGen structure of [STK][5]. All the unit classes are extended from the base class "WX._Unit" and have two default nodes: `_inlet` and `_outlet`.

### Generators
`Oscil` `LFO` `Noise` `Sampler`

### Control
`ADSR`

### Processor
`LPF` `FeedBackDelay` `ConVerb` `Compressor`

[5]: https://ccrma.stanford.edu/software/stk/classes.html

Class: Module
-------------
**NOTE**: Currently not implemented yet.
The `Module` object is a collection of units that functions at the higher level of interaction. You can think of it as a "virtual instrument" in modern digital audio workstations. (VSTi, effect plug-ins and etc) It provides more musically-oriented feature like synthesizer, sampler and effect plug-in.

Class: Timebase
---------------
**NOTE**: Currently not implemented yet.
The `Timebase` will be a singleton object that manages all the timing/sequencing tasks. Hopefully it can be used in conjunction with Web MIDI API in near future.

Class: Networking
-----------------
**NOTE**: Currently not implemented yet.
This class will include network-related features based on WebSocket and PeerConnection API from WebRTC. It will enable users to interact with the audience of web-based music applications or other player/performer for collaboration.

Utilities
---------
Some useful functions for the music application.
`random2` `random2f` `db2rms` `rms2db` `midi2freq` `freq2midi`