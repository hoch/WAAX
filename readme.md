WAAX (Web Audio API eXtension)
------------------------------
**JavaScript library for music and audio programming on Chrome**

```javascript
// creating units
var saw = new WX.Oscil({ type:2 }),
    sqr = new WX.Oscil({ type:1 }),
    lpf = new WX.LPRez({ range:4000, Q:12 }),
    env = new WX.ADSR({ a:0.001, d:0.002, s:0.3, r:0.1 }),
    vrb = new WX.ConVerb({ source:"ir/hall.wav", mix:0.3 });
// building an audiograph
WX.link(saw, lpf ,env, vrb ,WX.DAC);
// connecting units
sqr.to(lpf);
```

WAAX is an experimental JavaScript library built on top of [Web Audio API][1] in Chrome. With **music creation and performance** in mind, it offers the higher level of functionality than basic building blocks of Web Audio API.

The goal of this project is 1) to facilitate experiments and iterations of web-based audio programming and 2) to hide audio-specific chores from web developers who are not familiar with audio programming.

The facade of API is strongly inspired by [THREE.js][2] and [ChucK][3]: Three.js is one of WebGL JavaScript libraries being used most for web-based 3D graphics. ChucK is an experimental audio programming language being actively developed and used by computer music communities such as [PLOrk][4](Princeton Laptop Orchestra) and [SLOrk][5](Stanford Laptop Orchestra).

As this library is in early stages of development, it currently demonstrates minimum set of features, however, it will embrace more elements as it grows: ready-made instruments, comprehensive timebase system (in conjunction with Web MIDI API), and musical interconnection between multiple Chrome clients.


[1]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html "Web Audio API: W3C Editor's Draft"
[2]: https://github.com/mrdoob/three.js/ "THREE.js: Github Repo"
[3]: http://chuck.cs.princeton.edu/
[4]: http://plork.cs.princeton.edu/
[5]: http://slork.stanford.edu/


Demo
----
Requirements: _Google Chrome 24+ on any platform(Win/OSX/Linux)._

See its potential in the first demo: **[interactive code editor][6]
_Adjust your volume setting before clicking. It might be loud!_

[6]: http://hoch.github.com/waax/examples/editor.html


Usage
-----


### Unit: Creation

Like the _node_ in Web Audio API, WAAX has its own atomic object called **unit**. It is conceptually identical to 'unit generator' of other audio programming environments and consists of more than 2 nodes in general.

```javascript
// creating WAAX units
var kick = new WX.Sampler({ source: "kd.wav", basePitch: 60 }),
    comp = new WX.Comp();
```

A unit can be created with an object of initial parameters, or it can be set with default parameters when it is created without any argument.


### Unit: Connection

```javascript
// connecting units with .to() method
kick.to(comp).to(WX.DAC);
// connecting units with WX.link() method
WX.link(kick, comp, WX.DAC);
```
As shown above, the connection between several WAAX units can be achieved by chaining `.to()` method. `WX.DAC` is the master channel of WAAX system. 

```javascript
// native Web Audio API node
var node = myAudioContext.createGain();
// unit => node
kick.connect(node);
// node => unit
node.connect(comp._inlet);
```

The connection from a WAAX unit to Web Audio API node can be done by `.connect()` method, which is the same method in Web Audio API, but the connection from a node to a unit should be done manually with `._inlet` node from a unit.


### Unit: Parameters

```javascript
comp.threshold = -12;
comp.ratio = 8.0;
kick.params = { source:"kd2.wav", basePitch:48 };

console.log(kick.source);
>>> "kd2.wav"
console.log(kick.params);
>>> { source:"kd2.wav", basePitch:48 }
```

All the parameters of a unit is accessible by simply setting or getting values. Alternatively, passing an object with parameters into `.params` is also possible. Getting available parameters from a unit can be done by printing out `.params` as well.


Units and Parameters
--------------------
As WAAX is in early stages of development, there are several components (which are yet to be released publicly) to be incorporated into this library in the near future. I am currently expanding its sonic vocabulary by adding more units to the library. The followings are a basic set of units as the first milestone. A detailed documentation of each unit will be available soon.

### Generator
`WX.Oscil` `WX.Noise` `WX.Sampler` `WX.LFO`

### Processors
`WX.ADSR` `WX.LPRez` `WX.TwinDelay` `WX.ConVerb` `WX.Comp` `WX.C2`

### Analyzer _(Not Available Yet)_
`WX.Scope` `WX.Spectrum` `WX.Waterfall` 

### Utilities
`WX.random2` `WX.random2f` `WX.db2lin` `WX.lin2db` `WX.pitch2freq` `WX.freq2pitch`


Futurework
----------
There are several components (which are yet to be released publicly) to be incorporated into this library in the near future. One of these components is [WebRTC][7], the new web technology that enables a peer-to-peer connection between browsers. It realizes the idea of real time collaboration by interconnecting multiple clients without complicated server-side programming. The other one is [Web MIDI API][8] that empowers the browser to access local MIDI devices (i.e. USB-MIDI keyboards and controllers)

[7]: http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcdatachannel
[8]: http://webaudio.github.com/web-midi-api/


Contact and License
-------------------
This project is initiated and managed by hoch([Hongchan Choi][9]). Please refer LICENSE file (MIT License) for more info.

[9]: https://ccrma.stanford.edu/~hongchan/
