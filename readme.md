# WAAX: Web Audio API eXtension

#### Framework for Web-based Music Apps (1.0.0-alpha)

> Currently the repository is under the active development as alpha status. It has passed the initial experimental implementation and is stabilizing to version 1.0.0. With that said, please use at your own risk.

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


### [Play WAAX!](http://playwaax.appspot.com)

You can find playable demos and examples at [PlayWAAX](http://playwaax.appspot.com).


## Basic Usage

To use WAAX in a web page, simply load the `waax.min.js` at the end of `<body>`. Note that MUI elements packages require Polymer library, so it has to be included before its usage. (Also make sure to have `plug-ins/` and `mui/` directories in the right place.)

~~~html
<!-- load WAAX and plug-in -->
<script src="waax.min.js"></script>
<script src="plug-ins/samplex.js"></script>
<!-- load Polymer and MUI elements -->
<script src="platform.js"></script>
<import src="mui/mui-knob.html"></script>
~~~

For sequencer functionality and Web MIDI support, the following components should be included as well:

~~~html
<!-- optional: for sequencer and MIDI support -->
<script src="timebase.min.js"></script>
<script src="ktrl.min.js"></script>
<!-- piano roll MUI element -->
<import src="mui/mui-pianoroll.html"></script>
~~~


## Further Reading

- [Thought behind: Rebirth of WAAX](https://ccrma.stanford.edu/~hongchan/posts/thoughts-behind-rebirth-of-waax/) : design choices and concepts.
- [Creating WAAX Plug-in](https://ccrma.stanford.edu/~hongchan/posts/creating-waax-plugin/) : step-by-step tutorial on how to create plug-in for WAAX.

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
grunt dev           # start dev server @ localhost:8000
grunt build         # build minimized core, plug-in scripts
~~~

## Documentation

_Coming soon..._

## Directory Structure

        .
        |
        +- bower_components/
        +- build/                       // flattened, minified js files
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
        |       +- ...
        +- test/                        // client-side testing (mocha + chai)
        |   +- index.html
        |   +- test-core.js
        |   +- test-timebase.js
        +- bower.json           
        +- Gruntfiles.js        
        +- index.html                   // project landing page
        +- package.json
        +- README.md


## License and Contact

MIT License. Copyright (c) 2014 [Hongchan Choi](https://ccrma.stanford.edu/~hongchan)