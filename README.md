# WAAX

Web Audio API eXtension (1.0.0-alpha3)

> NOTE: WAAX requires Web Audio API and Web Components.

<!-- travis build image -->


## Introduction

__WAAX__ offers a comprehensive framework for web-based music application. Its goal is to facilitate and support the development of web-based music software.


## Feature Highlights

- **Fast** - Built around native Web Audio API nodes.
- **Less code**
    - Web Audio API helpers and utilities
    - Succint parameter control
    - Transport and event management (i.e. sequencer)
- **Modular and extensible**
    - WAPL (Web Audio PLug-in): Plug-in for Web Audio API ecosystem
    - MUI (Musical User Interface): GUI for music apps
- **Robust workflow** - Preconfigured with Bower and Gulp


## Prerequisites

The complete WAAX development setup requires the following software. Make sure they are installed with appropriate scope and permission.

- [Git](http://git-scm.com/) - [Installation](http://git-scm.com/downloads)
- [Node.js](http://nodejs.org/) - [Installation](http://nodejs.org/)
- [Gulp](http://gulpjs.com/) - [Installation](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)


## Installation and Quick Start

If you have all the above installed, execute the following commands in the terminal to install and launch WAAX.

~~~bash
git clone https://github.com/hoch/WAAX waax
cd waax
npm install
gulp
~~~

Note that WAAX is pre-configured for the optimum development workflow. Type `gulp` in the terminal and then your web browser (Chrome by default) will open the project index page automatically.


## What's Next?

Go to the [project landing page](http://hoch.github.io/WAAX) and see what WAAX can do.


## Change Log

- 1.0.0-alpha3
    + Updated dependencies with latest version: Polymer, Gulp-related utilities.
    + mui-vkey polyphonic release issue solved.
    + WXS-1 monophonic legato behavior fixed.
    + New project landing page and API reference are online.
    + Using MUI package is significantly simplified.
    + `bower_components` are now part of MUI package, not WAAX.
    + License for sound resources is added.

- 1.0.0-alpha2
    + Updated dependencies with latest version: Gulp, Polymer.
    + MUI elements updated for new version of Polymer.
    + Timebase code has been cleaned/refactored.
    + Updated README and the temporary landing page is removed.
    + MUI elements and test files are now compatible with FireFox/Safari.
    + Audio assets are converted to MP3.
    - [bug] `WXS1` and `FMK1` plug-ins produce distorted sound in FireFox.
    - [bug] Safari does not load the example with `StereoDelay` plug-in.

- 1.0.0-alpha
    + First alpha version before stable release.
    + Dropped deprecated components from repository.
    + New plug-in builder introduced.

- r17 (dev)
    + Last version of dev/experimental revision.


## License and Contact

MIT License. Copyright 2011-2014 [Hongchan Choi](http://www.hoch.io)