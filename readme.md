WAAX (Web Audio API eXtension)
------------------------------
**JavaScript library for music and audio programming with Chrome**

```javascript
mySaw.to(myLPF).to(myADSR).to(WX.Out);
myLPF.modulateWith(myLFO);
```

WAAX is an experimental JavaScript library for [Web Audio API][1] incorporated in Chrome. With **music creation and performance** in mind, it is designed to provide users with the higher level of abstraction.

The goal of this project is to make audio programming more approachable by encapsulating several technical steps that web developers and designers have to go through to set up Web Audio API. From computer musician's perspective, it is also inspiring to integrate powerful web technologies to audio programming.

The library is strongly inspired by [THREE.js][2] and [ChucK][3]: Three.js is one of WebGL JavaScript libraries being used most for web-based 3D graphics. ChucK is "strongly-timed" audio programming language being actively developed and used by computer music communities of Princeton/Stanford university.

As the project grows, this library will embrace more features such as: ready-made instruments, comprehensive timebase system (in conjunction with Web MIDI API), and musical interconnection between Chrome clients.

See the demo [hello WAAX][4] and [interactive code editor][5].

[1]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html "Web Audio API: W3C Editor's Draft"
[2]: https://github.com/mrdoob/three.js/ "THREE.js: Github Repo"
[3]: http://chuck.cs.princeton.edu/
[4]: http://hoch.github.com/waax/examples/hellowaax.html
[5]: http://hoch.github.com/waax/examples/editor.html


Using WAAX
----------

As Web Audio API has the "node" object, WAAX has its own atomic object called "unit". It is conceptually identical to 'Unit Generator' of other audio programming environments and consists of more than 2 Web Audio API nodes in general.
```javascript
// creating WAAX units
var kick = new WX.Sampler({ source: "kd.wav", basePitch: 60 }),
    comp = new WX.Comp({ threshold: -20.0, ratio: 4.0 });
// connecting units
kick.to(comp).to(WX.Out);
// setting parameter
comp.ratio = 8.0;
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
**NOTE**: _still in progress!_

Unit classes in WAAX are largely based on the UGen structure of [STK][6]. All the unit classes are extended from the base class "WX._Unit" and have two default nodes: `_inlet` and `_outlet`.

### Generators
`Oscil` `LFO` `Noise` `Sampler`

### Envelopes
`ADSR`

### Processors
`LPF` `FeedBackDelay` `ConVerb` `Compressor`

[6]: https://ccrma.stanford.edu/software/stk/classes.html

Class: Module
-------------
**NOTE**: _Currently not implemented yet._

The `Module` object is a collection of units that functions at the higher level of interaction. You can think of it as a "virtual instrument" in modern digital audio workstations. (VSTi, effect plug-ins and etc) It provides more musically-oriented feature like synthesizer, sampler and effect plug-in.

Class: Timebase
---------------
**NOTE**: _Currently not implemented yet._

The `Timebase` will be a singleton object that manages all the timing/sequencing tasks. Hopefully it can be used in conjunction with Web MIDI API in near future.

Class: Networking
-----------------
**NOTE**: _Currently not implemented yet._

This class will include network-related features based on WebSocket and PeerConnection API from WebRTC. It will enable users to interact with the audience of web-based music applications or other player/performer for collaboration.

Utilities
---------
Some useful functions for the music application.
`random2` `random2f` `db2lin` `lin2db` `midi2freq` `freq2midi`