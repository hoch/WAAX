# Getting Started


## Installation

For the local developement, you can download the zipped file or clone the GitHub repository.

```
$ git clone https://github.com/hoch/WAAX.git
```


## Using WAAX in HTML Document

If you are simply using the minified library (core + reference units), include library files from the URL below.

```
<script src="http://waax-static.appspot.com/build/WAAX.min.js"></script>
```

Alternatively, you can choose files you want to use. Note that the core library  and Fader plug-in must be loaded first before you can use any WAAX units. The example below loads the definition of oscillator unit after the WAAX core and Fader.

```
<script src="your_path/WAAX.js"></script>
<script src="your_path/Fader.js"></script>
<script src="your_path/Oscil.js"></script>
<script>
  // your WAAX code here...
</script>
```

The reference list of units can be found in this doucmentation. Once you've done with the developelment, you can compile the core and unit JavaScript files into a single file with your favorite tool chains.


## "Hello Sine!"

```javascript
var sine = WX.Oscil({ pGain: 0.25 });
sine.to(WX.Master);
```

In the code example above, a sine oscillator is being created and connected to the master output of WAAX system. The oscillator (`sine`) or the master output (`WX.Master`) is called **'WAAX Unit'** or **'unit'** for short. Note that there is no *new* keyword for unit construction. `WX.Oscil()` is a factory method that produces an instance of oscillator with the initial setting, the gain of 0.25 in this case. The `.to()` method connects the oscillator and the master output.


## Making Connections

The `.to()` method can be chained to connect more than 3 units. Also it might be useful to know `WX.patch()` method when connecting several units at once. As shown previously, you can intialize WAAX unit by passing an object of parameters to its factory method.

```
var noise = WX.Noise({ pGain: 0.5 }),
    lpf = WX.LPF({ pCutoff: 250, pQ: 12 });
noise.to(lpf).to(WX.Master);
WX.patch(noise, lpf, WX.Master);
```

There we just built our first *audiographs* with WAAX. Try this example here!