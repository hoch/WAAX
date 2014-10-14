# WAAX: Web Audio API eXtension

#### JavaScript Web Music Framework (1.0.0-alpha)

> NOTE: WAAX and MUI require Web Audio API, Web MIDI API and Web Components. Currently Chrome or Chrome Canary is the only browser that supports them. Run [the client test](http://hoch.github.io/WAAX/test/) to check the platform compatibility.

<!-- travis build image -->


## Introduction

__WAAX__ is a JavaScript library that offers a comprehensive framework for web-based music application. Its goal is to facilitate and support the development of web-based music application.


## Feature Highlight

- Web Audio API Wrapper and audio/music utilities 
- Flexible parameter control and preset management
- Built-in transport function (i.e. sequencer)
- Modular and extensible architecture
    - [WAPL(Web Audio PLug-in)](https://ccrma.stanford.edu/~hongchan/posts/creating-waax-plugin/) interface
    - [MUI(Musical User Interface)](http://hoch.github.io/WAAX/mui/)
- Robust development setup: Pre-configured with Bower and Gulp
- [Web MIDI API Integration](https://github.com/hoch/Ktrl) _(supported behind flag)_


## Installation

Since WAAX repository is pre-configured for the optimum development work flow, the complete installation by cloning the repository is recommended.

The complete development setup requires [NPM](http://nodejs.org/), [Bower](http://bower.io/) and [Gulp](http://gulpjs.com/). If you have them installed, then simply execute the following commands in the terminal to install and configure WAAX. Replace `$YOUR_DIRECTORY` with your installation directory.

~~~bash
git clone https://github.com/hoch/WAAX $YOUR_DIRECTORY
cd $YOUR_DIRECTORY
make
~~~


## Quick Start

The fastest way to get up and running is to start with a template project in `examples/quickstart`. Open `index.html` file and see the comments for the detailed explanation of the structure and the process.

The complete reference for API and plug-ins can be found here.


## Using Workflow

WAAX's workflow is based on Gulp task runner library and a variety of tasks is pre-configured for the convenience. In short, run `gulp` in the WAAX directory.

~~~bash
gulp                    # cleans, builds and starts dev server

gulp clean              # cleans dist, build path
gulp serve              # starts dev server 127.0.0.1:3000 and opens Canary
gulp scripts:core       # minifies and concats WAAX core JS files to build
gulp scripts:plugins    # minifies plug-in JS files to build/plug-ins
gulp scripts:ktrl       # minifies ktrl library
gulp build              # all above
gulp deploy             # build and deploy to gh-pages
~~~



## Basic Usage

To use WAAX in a web page, simply load the `waax.js` in an HTML document. Note that MUI elements packages require Polymer library, so it has to be included before its usage. The following code snippets require `build/` and `mui/` directories to be at the right place.

~~~html
<!-- load WAAX, MUI, Timebase and plug-ins -->
<script src="build/waax.js"></script>
<script src="build/plug_ins/wxs1.js"></script>
<script src="build/plug_ins/converb.js"></script>
<script src="build/plug_ins/stereodelay.js"></script>
<!-- load MUI elements -->
<import src="mui/mui.html"></script>
~~~

For Web MIDI support, the following components should be included as well:

~~~html
<!-- optional: for MIDI support -->
<script src="build/ktrl.js"></script>
~~~

Note that MIDI support depends on [Web MIDI API](http://www.w3.org/TR/webmidi/), which is still behind the flag at the moment even in Chrome and Chrome Canary. __Ktrl__ is a part of WAAX framework for Web MIDI and more info is available [here](https://github.com/hoch/Ktrl).


## Playing Sound

By its design, WAAX accommodates various use cases with different levels. As shown below, it can be as simple as possible.

~~~javascript
// Creating a WXS-1 synth and a stereo delay instance.
var synth = WX.WXS1(),
    delay = WX.StereoDelay();
// Plug-in patching: Synth => Delay => Master
synth.to(delay).to(WX.Master);
// Plays C4 with 100 velocity for 1 second.
synth.noteOn(60, 100);
synth.noteOff(WX.now + 1.0);
~~~

Also it can be as complex as a complete music application. For more examples, check out [MUI showcases](http://hoch.github.io/WAAX/mui/) and [Plug-In Workshop](http://hoch.github.io/WAAX/examples/workshop/).


## Creating UI with MUI elements

MUI(Musical User Interface) package offers essential UI elements for rapid prototyping of instrument design or processing algorithm. By design, MUI supports seamless parameter binding and easy GUI building. A live demo can be found [here](http://hoch.github.io/WAAX/examples/hellowaax/).

First, MUI elements, which are custom HTML elements, should be declared.

~~~html
<!-- MUI knob element -->
<mui-knob id="knob-freq"></mui-knob>
~~~

Secondly, create any plug-in and connect the GUI to a parameter.

~~~javascript
// Creates an oscillator plug-in.
var osc = WX.SimpleOsc();
// Patching: Osc => Master
osc.to(WX.Master);
// Starts audio.
osc.noteOn(60, 100);
// Links the knob and a parameter: link(target_plugin, parameter_name)
MUI.$('knob-freq').link(osc, 'oscFreq');
~~~


## Further Reading

- [Thought behind: Rebirth of WAAX](https://ccrma.stanford.edu/~hongchan/posts/thoughts-behind-rebirth-of-waax/) : Concepts, design choices and the future road map.
- [Creating WAAX Plug-in](https://ccrma.stanford.edu/~hongchan/posts/creating-waax-plugin/) : A step-by-step tutorial on how to create a plug-in for WAAX.

<br>
---
<br>



# License and Contact

MIT License. Copyright (c) 2011-2014 [Hongchan Choi](http://www.hoch.io)