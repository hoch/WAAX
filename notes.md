### Milestone 1 (1/18/2013, 10:00AM)

* completing Unit design (2 days)
  - HPF, EQ4, Chorus, PingPong, Ramp, Distortion
* a short/powerful example like this
  - http://mrdoob.com/projects/htmleditor/
* r1 commit on GitHub -> Chris Rogers, Chris Wilson, Boris Smus

### Milestone 2 (1/22/2013)

* starting instrument/widget design (2 days)
  - web-based IDE, interactive parameter 
* working on instruments
* working on widgets: 2D XY Pad, 1D Slider, Bang Button, Toggle Button, Keyboard
* node.js synch server design 
* start working on Paper

### Milestone 3 (1/27/2013)

* r2 commit with examples with 1 instruments and 3 widgets
* have a look on web editor: 
  - http://mrdoob.com/projects/htmleditor/
  - http://codemirror.net/
* working on paper

### Milestone 3 (1/31/2013)

* publication submission date: 1/31/2013

### TODO-list

* Today
  LFO
  HPF, Ramp, Flanger, Chorus
  Waveshaper

* Units
  Envelope: AHR
  Dynamic: Gate, Expander

* examples
  Keyboard + poly phonic subtractive synth
  Keyboard + drum sampler
  wind/wave generator
  aui sound pallette

* Net Module
  WebSocket

* Interface
  2D XY Pad
  1D Slider
  Bang Button
  Toggle Button
  Keyboard


### Today

* getter and setter
  http://stackoverflow.com/questions/812961/javascript-getters-and-setters-for-dummies
  http://robertnyman.com/javascript/javascript-getters-setters.html


### adding license to multiple source codes

#!/bin/bash

for i in *.js
do
  if ! grep -q Copyright $i
  then
    cat copyright.txt $i > $i.new && mv $i.new $i
  fi
done


### encoding all the wave files into 44.1/16/Mono

sox kick-2.wav -r 44100 -b 16 -c 1 temp/kick-2.wav


### Key layout

DrumPad Layout:
79 80 219,
76 186 222,
190 191 16


