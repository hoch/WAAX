## WAAX (Web Audio API eXtension)

Web Music Framework (1.0.0-alpha2)

> WAAX requires Web Audio API and Web Components!

<!-- travis build image -->

## Introduction

__WAAX__ offers a comprehensive framework for web-based music application. Its goal is to facilitate and support the development of web-based music application.


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
- [Bower](http://bower.io/) - [Installation](http://bower.io/#install-bower)
- [Gulp](http://gulpjs.com/) - [Installation](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)


## Installation

If you have all the above installed, then simply execute the following commands in the terminal to install WAAX. Replace `$YOUR_DIRECTORY` with your installation directory.

~~~bash
git clone https://github.com/hoch/WAAX $YOUR_DIRECTORY
cd $YOUR_DIRECTORY
npm install
bower install
~~~


## Quick Start with Gulp

WAAX is pre-configured for the optimum development workflow. Type `gulp` in the terminal and then your web browser (Chrome by default) will open the project landing page automatically.

~~~bash
gulp                    # build everything and serve at 127.0.0.1:3000

gulp clean              # cleans dist, build path
gulp core               # minifies and concats core JS files to build/
gulp plugins            # minifies plug-in JS files to build/plug_ins
gulp mui                # copies MUI elements files to build/
gulp serve              # starts dev server 127.0.0.1:3000 and opens Chrome
gulp build              # build and minify core, plug-ins
~~~


<!--
## What's Next?

Go to the [project landing page](http://hoch.github.io/WAAX) and see what WAAX can do.
-->

## Change Log

- 1.0.0-alpha2
    + Updated dependencies with latest version: Gulp, Polymer
    + MUI elements updated for new version of Polymer
    + Timebase cleaned/refactored.
    + Updated README and the temporary landing page is removed.
    + MUI elements and test files are now compatible with FireFox/Safari.

- 1.0.0-alpha
    + First alpha version before stable release.
    + Dropped deprecated components from repository.
    + New plug-in builder introduced.

- r17 (dev)
    + Last version of dev/experimental revision.


## License and Contact

MIT License. Copyright (c) 2011-2014 [Hongchan Choi](http://www.hoch.io)