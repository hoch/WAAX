## WAAX (Web Audio API eXtension)

Web Music Framework (1.0.0-alpha2)

> NOTE: WAAX requires Web Audio API and Web Components. Run [the test suite](http://hoch.github.io/WAAX/test/) to check the browser compatibility.

<!-- travis build image -->

## Introduction

__WAAX__ offers a comprehensive framework for web-based music application. Its goal is to facilitate and support the development of web-based music application.


## Feature Highlights

- **Fast** - Built around native Web Audio API nodes.
- **Less code**
    - Web Audio API helpers and utilities
    - Parameter control and plug-in builder
    - Transport and time management (i.e. sequencer)
- **Modular and extensible**
    - [WAPL](https://ccrma.stanford.edu/~hongchan/posts/creating-waax-plugin/) (Web Audio PLug-in): Plug-in for Web Audio API ecosystem
    - [MUI](http://hoch.github.io/WAAX/mui/) (Musical User Interface): GUI for music apps
- **Robust workflow** - Preconfigured with Bower and Gulp


## Prerequisites

The complete WAAX development setup requires the following software. Make sure they are installed with appropriate scope and permission.

- [Git](http://git-scm.com/) - [Installation](http://git-scm.com/downloads)
- [Node.js](http://nodejs.org/) - [Installation](http://nodejs.org/)
- [Bower](http://bower.io/) - [Installation](http://bower.io/#install-bower)
- [Gulp](http://gulpjs.com/) - [Installation](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)


## Installation

If you have them installed, then simply execute the following commands in the terminal to install WAAX. Replace `$YOUR_DIRECTORY` with your installation directory.

~~~bash
git clone https://github.com/hoch/WAAX $YOUR_DIRECTORY
cd $YOUR_DIRECTORY
npm install
bower install
~~~


## Quick Start with Gulp

WAAX is pre-configured for the optimum development workflow. Type `gulp` in the terminal and then your web browser will open the project landing page automatically.

~~~bash
gulp                    # cleans, builds and starts dev server
gulp clean              # cleans dist, build path
gulp serve              # starts dev server 127.0.0.1:3000 and opens Canary
gulp scripts:core       # minifies and concats WAAX core JS files to build
gulp scripts:plugins    # minifies plug-in JS files to build/plug-ins
gulp build              # all above
~~~


## What's Next?

- "Still not sure what it does."
    + Visit project page and have a look on examples.
- "Want to see more details."
    + Visit documentation/API reference page.
- "Are there any videos?"
    + Watch some recorded talks.


## Change Log

- 1.0.0-alpha2
    + Updated dependencies with latest version: Gulp, Polymer
    + MUI elements updated for new version of Polymer
    + Timebase cleaned/refactored.
    + Updated README.

- 1.0.0-alpha
    + First alpha version before stable release.
    + Dropped deprecated components from repository.
    + New plug-in builder introduced.

- r17 (dev)
    + Last version of dev/experimental release.


## License and Contact

MIT License. Copyright (c) 2011-2014 [Hongchan Choi](http://www.hoch.io)