# Using MIDI

**NOTE!** MIDI support in WAAX requires Web MIDI API, which is only available on Chrome Canary on OSX at the time of writing.

This section describes how to program MIDI functionalities in conjuntion with WAAX library. Before launching the browser, MIDI-compatible device (MIDI controller or MIDI interface) needs to be connected to the computer and the proper device driver should be installed. Otherwise you will have to restart the browser to get MIDI devices recognized.

## Importing MIDI Supprot

If you are using the minified version of WAAX, you do not need to do anything further because the MIDI library is already enclosed. However, if you are selectivly importing WAAX components, the MIDI manager, `Ktrl.js`, should be included in the HTML document. (replace `waax_path` with the local WAAX directory.)

```
<script src="waax_path/Ktrl.js"></script>
```

## Creating MIDI Target and Data Handler

`Ktrl.js` offers highly flexible MIDI data routing by abstracting physical and virtual MIDI devices. In order to route MIDI data to a certain destination, a MIDI target must be created.

```
var midiTarget = Ktrl.createTarget("mySynth");
midiTarget.activate();
```

The next step is to design MIDI data handler for the newly created `midiTarget` instance. Use `.onData()` method to define the data handler. Programming the data handler is much easier than dealing with raw MIDI data bytes since the `.parse()` method transforms the raw data into human-readable form.

```
midiTarget.onData(function (midimessage) {
  var data = Ktrl.parse(midimessage);
  switch (data.type) {
    case "noteon":
      console.log(data.pitch, data.velocity);
      break;
    // more handling code...
  }
});
```


## Routing MIDI data

With the data handler, now we are ready to use the MIDI target for the incoming MIDI data. The final step of MIDI programming is routing MIDI inputs to the MIDI targets. Like the MIDI system in common digital audio workstation, `Ktrl.js` provides an aggregated input device; regardless of the number of devices connected to the system, it can be treated as a single virtual MIDI input device.

```
Ktrl.ready(function () {
  Ktrl.routeAllToTarget(midiTarget);
});
```

This is a safe bet for common usage since whatever MIDI device connected to the system, it will be used by the HTML document without specifying the reference of MIDI device. Alternatively, you can create individual routings as shown below.

```
Ktrl.ready(function () {
  Ktrl.routeSourceToTarget(1, midiTarget);
});
```

The code above demonstrates how to connect the second MIDI device to the web audio synth (MIDI target). However, if the computer does not have the second MIDI device, it will throw an error.

For the API reference, please visit [the project page](https://github.com/hoch/Ktrl).