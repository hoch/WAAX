# MUI (Musical User Interface)

MUI is a collection of custom HTML elements that are specifically disigned for musical applications.


## Installation

Since MUI is a part of WAAX, so no additional installation is necessary if you have already installed the WAAX by cloning the repository or downloading the files. MUI elements are built on top of [Polymer](http://www.polymer-project.org/) and it is already included in the MUI directory.


## Loading MUI in HTML document

Currently activating MUI needs a bit more work. (It will be fixed soon.) First off, Polymer library must be loaded first and then MUI core and its style sheet should come next.

```html
<script src="lib/polymer.min.js"></script>
<script src="mui-core.js"></script>
<link rel="stylesheet" type="text/css" href="mui-core.css">
```

Once the bootstrap is loaded, you can selectively start loading MUI elements (GUI widgets) you wish to use on the document. The following example shows how to import the knob and the toggle switch.

```html
<link rel="import" href="elements/mui-knob.html">
<link rel="import" href="elements/mui-toggle.html">
```


## Using MUI elements

Here is the fun part. You can create knobs and toggles switches by simply writing  HTML codes below. They are called "custom elements" which is made possible by Polymer; highly-componentized, portable, and reusable GUI widgets specifically designed for WAAX unit.

```html
<mui-toggle id="kActive" label="ON"></mui-toggle>
<mui-knob id="kFreq" label="Frequency" value="0.01" min="5000" max="440.0"></mui-knob>
```

Linking the toggle switch and the knob to the oscillator is surprinsingly simple. The good news is you do not have to worry about synchronizing variables in GUI widgets, corresponding parameters in WAAX unit and even values in the abstracted Web Audio API node.

```javascript
var osc = WX.Oscil();
MUI.$('kActive').link(osc, 'pActive');
MUI.$('kFreq').link(osc, 'pFreq');
```

You can select a MUI element by using the special selector `MUI.$()`. Each MUI element has `.link()` method and the binding to a certain parameter can be done by passing the target unit reference (`osc`) and the parameter name (`pActive` or `pFreq`).

This auto-magical parameter binding is managed by Polymer ensuring all the values across different layers completely synchronized. That means the value in the oscillator will be changed when you touch the knob, and also the knob position will be changed when you modify the parameter value of the oscillator. This takes preset managment and MIDI support to another level. Truly empowering!