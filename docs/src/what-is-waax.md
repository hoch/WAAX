# What is WAAX?


## Introduction

WAAX (Web Audio API eXtension) is a JavaScript library built on top of Web Audio/MIDI API to facilitate audio programming on Blink-based web browsers - *Chrome, Chrome Canary and Chromium*.

Although Web Audio API provides web devlopers with the unprecedent ability to generate sound on the web browser without additional plug-ins, building a full-blown music application with it still requires vast experience in digital audio, sound synthesis and even acoustics.

Secondly, an audio programmer who is not familiar with the recent web techonologies will be lost in the workflow of web development spending a fair amount time to establish the environment to work on.

The ultimate goal of this project is to fill the gap between two opposite ends:  helping web developers to create music software without the expertise on sound synthesis and signal processing, and offering an instant boilerplate for rapid development of web-based applications to audio programmers.


## Features

  - Unit: production-ready sound generators, processors and visualizers
  - Terse and flexible API design
  - MUI (Musical User Interface) elements powered by Polymer
  - Tight integration with Web MIDI API
  - Demos, examples and documentation


## Cross-Browser Support <small>(as of 9.2013)</small>

**Web Audio API**: currently WAAX only supports Blink-based browsers (Chrome, Chrome Canary, and Chromium). Except for IE, supporting all the major web browsers is a top prirority on the roadmap of this project. Polyfills for Safari and FireFox will be patched up in the near future.

**Web MIDI API**: Chromium and Chrome Canary (31+) on OSX are the only web browsers that support the native MIDI I/O. It will take a while until it lands on Chrome stable and the support from Safari and FireFox is not clear at the moment.


## Cross-Platform Support <small>(as of 9.2013)</small>

The audio/MIDI subsystem on different platforms significantly varies. Thanks to CoreAudio and CoreMIDI, the current implementation of Blink-based browsers on OSX uses 128 samples of audio buffer size (with the expected latency around 3ms, fixed and non-user-configurable) and it also comes with the solid support on Web MIDI API on Chrome Canary.

On the other hand, the land of Windows, Linux and Android will suffer from several issues: high latency, buffer underun over time, and no love on MIDI support. This is simply because these platforms do not provide a viable audio/MIDI subsystem for optimum performance. For cross-platform isseus, please leave your feedback on the WAAX wiki on GitHub.