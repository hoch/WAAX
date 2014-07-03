# WAAX: Web Audio API eXtension

> NOTE: Currently the repo is under the active developement. Please advise and use it at your own risk.

<!-- travis build image -->

[In-browser Test](#)

### Examples

```javascript
var osc = WX.Osc3({ osc1type: 'square', osc2detune: 700 }),
    afx = WX.AwesomeEffect();
osc.to(afx).to(WX.Master);   
osc.set('freq', WX.mtof(60));
osc.set('gain', [0.0, 0.0], [1.0, 0.01, 1], [0.0, 0.5, 2]);
```


# Introduction
WAAX is a JavaScript library that offers a comprehensive framework for web-based music application. Its goal is to facilitate music and audio programming on the modern web browser. The WAAX core library features:

### Plug-in interface
WAAX proposes a draft of plug-in format for web-based music application, such as VST, RTAS and AudioUnit. With the framework and boilerplate, developers can solely focus on designing instruments, sound effect and visualizer units.

```javascript
var osc = WX.Osc3(),
    afx = WX.AwesomeEffect();

// connects osc -> afx -> Master    
osc.to(afx).to(WX.Master);              
```

### Better Parameter Control and Efficient Preset Management
Web Audio API's AudioParam is a hassle for developers without computer music background. A systemic wrapper for parameter control is provided users or plug-in designers with succint syntax and without loosing flexiblity. Plus, saving and loading presets for plug-in setting are simple and easy as well.

```javascript
// freq changes to MIDI pitch 60 immediately
osc.set('freq', WX.mtof(60));

// gain ramps up linear and ramps down expoentially with an envelope
osc.set('gain', [0.0, 0.0], [1.0, 0.01, 1], [0.0, 0.5, 2]);
```

### Polymer-ready: Modular GUI elements
WAAX is designed with Polymer (or Web Component) in mind. With the help of MUI(Musical User Interface), A developer can easily design a polymer GUI element and bind it to WAAX plug-in parameters. Two-way binding between parameters and a GUI element will not only save you from 'callback hell' but also helps you write human-readable code.

```javascript
MUI.$('knobFreq').bind(osc, 'freq');    // #knobFreq connects to freq
```

### Planned: Web MIDI API integration
Since it is only supported in Chrome Canary behind the flag, the integration of Ktrl.js library into WAAX is not completed yet. In the meantime, Ktrl.js should be loaded and used separately.


# Usage

To use WAAX in a web page, simply load the `waax.js` at the end of `<body>`. This will load `MUI` features as well. Note that you can skip the Platform/Polymer part if you do not need MUI elements in your project. Then Plug-ins and GUI elements can be loaded separately as needed.

```html
<!-- load WAAX and Platform/Polymer -->
<script src="build/waax.min-0.0.1.js"></script>
<script src="bower_component/platform.js"></script>
<!-- load WAAX plug-ins and MUI elements -->
<script src="plugins/myWXSynth.js"></script>
<import src="mui/mui-knob.html"></script>
```


# Development

### Installation

__Requirements__: npm, bower

To install everything including the developement setup:

        $> git clone git://github.com/hoch/WAAX.git waax
        $> cd waax
        $> ./setup

Note that `./setup` command will install all the dependencies via npm and bower. Make sure to have them installed first.

### Directory Structure

        .
        |
        +- build/               // flattened, minified dist files
        |   +- waax.min.js
        +- dev/                 // development files
        |   +- waax.js
        +- examples/            // example pages
        +- mui/                 // MUI elements repository
        |   +- mui-knob.html
        |   +- mui-knobh.html
        |   +- mui-toggle.html
        |   +- mui-select.html
        +- plugins/             // plug-in repository
        |   +- Boilerplate.js   // plug-in boilerplate file 
        +- test/                // client-side testing (mocha + chai)
        |   +- index.html
        |   +- test-core.js     // WAAX core test
        +- bower.json           // bower package info
        +- index.html           // dev landing page
        +- Gruntfiles.js        // grunt tasks
        +- package.json         // npm package info
        +- README.md

### Grunt Tasks

To run the development server:

        $> grunt dev

To build a minimized JS file:

        $> grunt build
