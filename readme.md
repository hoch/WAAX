# WAAX: Web Audio API eXtension

> NOTE: Currently the repo is under the active developement. Please advise and use it at your own risk.

<!-- travis build image -->

[In-browser Test](#)

### Example

```javascript
var osc = WX.Osc3({ osc1type: 'square', osc2detune: 700 }),
    afx = WX.AwesomeEffect();
osc.to(afx).to(WX.Master);   

var env = WX.Envelope([0.0, 0.0], [1.0, 0.01, 1], [0.0, 0.5, 2]);
osc.set('osc2type', 'triangle');
osc.set('freq', WX.mtof(60)).set('gain', env(WX.now + 0.5));
```


# Introduction
__WAAX__ is a JavaScript library that offers a comprehensive framework for web-based music application. Its goal is to facilitate music and audio programming on the modern web browser. The WAAX core library features:

### Plug-in interface
WAAX proposes a draft of __audio plug-in format__ for web-based music application, such as [VST, RTAS and AudioUnit](http://en.wikipedia.org/wiki/Audio_plug-in). With this framework, developers can solely focus on designing instruments, sound effect and visualizer units. More info on creating a WAAX plug-in, see [here](#).

```javascript
var osc = WX.Osc3(),
    afx = WX.AwesomeEffect();   // your own effect plug-in

// connects osc -> afx -> Master    
osc.to(afx).to(WX.Master);              
```

### Parameter & Preset Management
Web Audio API's `AudioParam` is a hassle for developers without computer music background. A systemic wrapper for parameter control is provided users or plug-in designers with succint syntax and flexiblity. Plus, saving and loading plug-in setting as a preset only gets easier as it should.

```javascript
// freq changes to MIDI pitch 60 immediately
osc.set('freq', WX.mtof(60));

// gain ramps up linear and ramps down expoentially with an envelope
osc.set('gain', [0.0, 0.0], [1.0, 0.01, 1], [0.0, 0.5, 2]);

// returns a preset object (a collection of parameters)
osc.getPreset();
```

### Polymer-ready: Modular GUI elements
The current version of WAAX is completely redesigned with [Polymer](http://www.polymer-project.org/) (or Web Component) in mind. With the help of __MUI(Musical User Interface)__, A developer can easily design a polymer GUI element and bind it to WAAX plug-in parameters. 

Two-way binding between a parameter and a GUI element not only saves you from the _"callback hell"_ but also helps you write human-readable code.

```javascript
MUI.$('knobFreq').bind(osc, 'freq');    // #knobFreq connects to freq
```

### Planned: Web MIDI API integration
Since Web MIDI API is only supported in Chrome Canary behind the flag at the time of writing, the integration of [__Ktrl__](https://github.com/hoch/Ktrl) library into WAAX is not considered yet. In the meantime, __Ktrl__ should be loaded and used separately.


# Usage

To use WAAX in a web page, simply load the `waax.js` at the end of `<body>`. This will load `MUI` features as well. Note that you can skip the Platform/Polymer part if you do not need MUI elements in your project. Then Plug-ins and GUI elements can be loaded separately as needed.

```html
<!-- load WAAX and Platform/Polymer -->
<script src="build/waax.min-0.0.1.js"></script>
<script src="bower_component/platform.js"></script>
<!-- load WAAX plug-ins and MUI elements -->
<script src="build/plugins/awesome-synth.js"></script>
<import src="mui/mui-knob.html"></script>
```

More in-depth examples and comments, please visit [my development journal](https://ccrma.stanford.edu/~hongchan/posts/).


# Development


### Installation

__Requirements__: [npm](http://nodejs.org/download/), [bower](http://bower.io/)

To install everything including the developement setup:

```bash
$> git clone git://github.com/hoch/WAAX.git waax
$> cd waax
$> npm install && bower install
```

### Directory Structure

        .
        |
        +- bower_components/
        +- build/                       // flattened, minified dist files
        |   +- waax.min.js
        |   +- plugins/
        |       +- Boilerplate.js
        +- doc/                         // documentation
        |   +- index.html
        |   +- ...       
        +- examples/
        +- mui/                         // MUI elements
        |   +- mui-knob.html
        |   +- mui-knobh.html
        |   +- mui-toggle.html
        |   +- mui-select.html
        |   +- ...
        +- node_modules/
        +- sound/                       // audio (sample) files
        +- src/                         // development files
        |   +- waax.js
        |   +- plugins/
        |       +- Boilerplate.js       // plug-in boilerplate file 
        +- test/                        // client-side testing (mocha + chai)
        |   +- index.html
        |   +- test-waax.js
        |   +- ...
        +- bower.json           
        +- Gruntfiles.js        
        +- index.html                   // project landing page
        +- package.json
        +- README.md


### Grunt Tasks

```bash
$> grunt dev            # Run the development server.
$> grunt build          # Generate minimized JS files (core library, all plug-ins)
```


# LICENSE

MIT


