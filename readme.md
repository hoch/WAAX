# WAAX: Web Audio API eXtension

#### Framework for Web-based Music Apps (1.0.0-alpha)

> Currently the repository is under the active development as alpha status. It has passed the initial experimental implementation and is settling down to version 1.0.0. With that said, please use at your own risk.

<!-- travis build image -->



# Introduction
__WAAX__ is a JavaScript library that offers a comprehensive framework for web-based music application. Its goal is to facilitate music and audio programming on the modern web browser. The __WAAX__ features:

- Extending Web Audio API for ease of use
- Web Audio Plug-in Interface
- Parameter & Preset Management
- Timebase, Transport and NoteList (a.k.a. Sequencer Engine)
- Modular GUI elements powered by Polymer
- Web MIDI API Integration _(supported behind flag)_
- Complete Front-end Development setup: NPM, Bower, Grunt, Foundation, Polymer
- Tested with Mocha and Chai: [In-browser Test](http://hoch.github.io/WAAX/test/)

<!-- ### [Play WAAX!](http://playwaax.appspot.com)
You can find playable demos and examples at [PlayWAAX](http://playwaax.appspot.com).
 -->

## Basic Usage

To use WAAX in a web page, simply load the `waax.js` in an HTML document. Note that MUI elements packages require Polymer library, so it has to be included before its usage. (Also make sure to have `plug-ins/` and `mui/` directories in the right place.)

~~~html
<!-- load WAAX and plug-in -->
<script src="build/waax.js"></script>
<script src="build/plug_ins/WXS1.js"></script>
<script src="build/plug_ins/ConVerb.js"></script>
<!-- load Polymer and MUI elements -->
<script src="bower_components/platform/platform.js"></script>
<import src="mui/mui-knob/mui-knob.html"></script>
<import src="mui/mui-vkey/mui-vkey.html"></script>
~~~

For sequencer functionality and Web MIDI support, the following components should be included as well:

~~~html
<!-- optional: for sequencer and MIDI support -->
<script src="build/timebase.js"></script>
<script src="build/ktrl.js"></script>
~~~

Note that MIDI support depends on [Web MIDI API](http://www.w3.org/TR/webmidi/), which is still behind the flag at the moment even in Chrome and Chrome Canary. __Ktrl__ is a part of WAAX framework for Web MIDI and more info is available [here](https://github.com/hoch/Ktrl).

## Playing Sound

By its design, WAAX tries to accommodates various use cases. As shown below, it can be as simple as possible.

~~~javascript
// creating a WXS-1 synth instance.
var synth = WX.WXS1();
// connects the synth to the master output.
synth.to(WX.Master);
// play C4 with 100 velocity for 1 second.
synth.noteOn(60, 100).noteOff(WX.now + 1.0);
~~~

Also it can be as complex as a complete music application. For more examples, please check back WAAX and [MUI showcases](http://hoch.github.io/WAAX/mui/) later.

## Further Reading

- [Thought behind: Rebirth of WAAX](https://ccrma.stanford.edu/~hongchan/posts/thoughts-behind-rebirth-of-waax/) : Concepts, design choices and the future road map.
- [Creating WAAX Plug-in](https://ccrma.stanford.edu/~hongchan/posts/creating-waax-plugin/) : A step-by-step tutorial on how to create a plug-in for WAAX.

<br>

---

# Development

## Installation

The complete WAAX development setup requires [NPM](http://nodejs.org/), [Bower](http://bower.io/) and [Grunt](http://gruntjs.com/). If you have them installed, then simply execute the following commands in the terminal to install and configure WAAX. Make sure to substitute `YOUR_DIRECTORY` to your installation directory.

~~~bash
git clone https://github.com/hoch/WAAX $YOUR_DIRECTORY
cd $YOUR_DIRECTORY
make
~~~


## Grunt Tasks

~~~bash
grunt               # same as 'grunt build'
grunt serve         # starts development server @ localhost:8000
grunt build         # builds the minimized JS files into 'build/' folder
grunt publish       # produces deployment build in 'dist/' folder
~~~

## Documentation

The newer version of documentation will be posted soon, and the previous version is still accessible [here](http://hoch.github.io/WAAX/docs/).


## License and Contact

MIT License. Copyright (c) 2014 [Hongchan Choi](https://ccrma.stanford.edu/~hongchan)