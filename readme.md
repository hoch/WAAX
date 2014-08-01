# WAAX: Web Audio API eXtension

Framework for Web-based Music Apps

> Currently the repository is under the active development as alpha status. It has passed the initial experimental implementation and is stabilizing to version 1.0.0. With that said, please use at your own risk.

<!-- travis build image -->

[In-browser Test (v1.0.0-alpha)](#)

# Introduction
__WAAX__ is a JavaScript library that offers a comprehensive framework for web-based music application. Its goal is to facilitate music and audio programming on the modern web browser. The __WAAX__ features:

- Plug-in Interface
- Parameter & Preset Management
- Timebase, Transport and NoteList (a.k.a. Sequencer Engine)
- Modular GUI elements powered by Polymer
- Web MIDI API Integration _(supported behind flag)_
- Complete Development setup: NPM, Bower, Grunt


# [Play WAAX!](http://playwaax.appspot.com)

You can find playable demos and examples at [PlayWAAX](http://playwaax.appspot.com).

# Basic Usage


# Development: Installation

The complete WAAX development setup requires [NPM](http://nodejs.org/), [Bower](http://bower.io/) and [Grunt](http://gruntjs.com/). If you have them installed, then simply execute the following commands in the terminal to install and configure WAAX. Make sure to substitute `YOUR_DIRECTORY` to your installation directory.

~~~bash
git clone https://github.com/hoch/WAAX YOUR_DIRECTORY
cd YOUR_DIRECTORY
make
~~~


# Getting Started: Development

The following grunt command will start development server, which can be accessed at [http://localhost:8000](http://localhost:8000)

~~~bash
grunt dev
~~~

# Documentation

# What's Next?


## License and Contact

MIT License. Copyright (c) 2014 [Hongchan Choi](https://ccrma.stanford.edu/~hongchan)


---





The introduction with more detail can be found [here](https://ccrma.stanford.edu/~hongchan/posts/thoughts-behind-rebirth-of-waax/).

### Plug-in interface
WAAX version 1 proposes a draft of __audio plug-in format__ for web-based music application, such as [VST, RTAS and AudioUnit](http://en.wikipedia.org/wiki/Audio_plug-in). With this framework, developers can solely focus on designing instruments, sound effect and visualizer units. More info on creating a WAAX plug-in, see [here](https://ccrma.stanford.edu/~hongchan/posts/creating-waax-plugin/).

```javascript
var osc = WX.Osc3(),
    afx = WX.AwesomeEffect();   // your own effect plug-in

// connects osc -> afx -> Master    
osc.to(afx).to(WX.Master);              
```


### Parameter & Preset Management
Web Audio API's `AudioParam` is a hassle for developers without computer music background. A systemic wrapper for parameter control is provided users or plug-in designers with succinct syntax and flexibility. Plus, saving and loading plug-in setting as a preset only gets easier as it should.

```javascript
// freq changes to MIDI pitch 60 immediately
osc.set('freq', WX.mtof(60));

// gain ramps up linear and ramps down exponentially with an envelope
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
<script src="build/waax.min.js"></script>
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
        |       +- TestPlugin.js
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
        |       +- TestPlugin.js        // plug-in boilerplate file 
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


