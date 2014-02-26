
var index = lunr(function () {
    this.field('body');
    this.ref('url');
});

var documentTitles = {};



documentTitles["what-is-waax.html#what-is-waax"] = "What is WAAX?";
index.add({
    url: "what-is-waax.html#what-is-waax",
    title: "What is WAAX?",
    body: "# What is WAAX?   "
});

documentTitles["what-is-waax.html#introduction"] = "Introduction";
index.add({
    url: "what-is-waax.html#introduction",
    title: "Introduction",
    body: "## Introduction  WAAX (Web Audio API eXtension) is a JavaScript library built on top of Web Audio/MIDI API to facilitate audio programming on Blink-based web browsers - *Chrome, Chrome Canary and Chromium*.  Although Web Audio API provides web devlopers with the unprecedent ability to generate sound on the web browser without additional plug-ins, building a full-blown music application with it still requires vast experience in digital audio, sound synthesis and even acoustics.  Secondly, an audio programmer who is not familiar with the recent web techonologies will be lost in the workflow of web development spending a fair amount time to establish the environment to work on.  The ultimate goal of this project is to fill the gap between two opposite ends:  helping web developers to create music software without the expertise on sound synthesis and signal processing, and offering an instant boilerplate for rapid development of web-based applications to audio programmers.   "
});

documentTitles["what-is-waax.html#features"] = "Features";
index.add({
    url: "what-is-waax.html#features",
    title: "Features",
    body: "## Features    - Unit: production-ready sound generators, processors and visualizers   - Terse and flexible API design   - MUI (Musical User Interface) elements powered by Polymer   - Tight integration with Web MIDI API   - Demos, examples and documentation   "
});

documentTitles["what-is-waax.html#cross-browser-support-smallas-of-92013small"] = "Cross-Browser Support &lt;small&gt;(as of 9.2013)&lt;/small&gt;";
index.add({
    url: "what-is-waax.html#cross-browser-support-smallas-of-92013small",
    title: "Cross-Browser Support &lt;small&gt;(as of 9.2013)&lt;/small&gt;",
    body: "## Cross-Browser Support &lt;small&gt;(as of 9.2013)&lt;/small&gt;  **Web Audio API**: currently WAAX only supports Blink-based browsers (Chrome, Chrome Canary, and Chromium). Except for IE, supporting all the major web browsers is a top prirority on the roadmap of this project. Polyfills for Safari and FireFox will be patched up in the near future.  **Web MIDI API**: Chromium and Chrome Canary (31+) on OSX are the only web browsers that support the native MIDI I/O. It will take a while until it lands on Chrome stable and the support from Safari and FireFox is not clear at the moment.   "
});

documentTitles["what-is-waax.html#cross-platform-support-smallas-of-92013small"] = "Cross-Platform Support &lt;small&gt;(as of 9.2013)&lt;/small&gt;";
index.add({
    url: "what-is-waax.html#cross-platform-support-smallas-of-92013small",
    title: "Cross-Platform Support &lt;small&gt;(as of 9.2013)&lt;/small&gt;",
    body: "## Cross-Platform Support &lt;small&gt;(as of 9.2013)&lt;/small&gt;  The audio/MIDI subsystem on different platforms significantly varies. Thanks to CoreAudio and CoreMIDI, the current implementation of Blink-based browsers on OSX uses 128 samples of audio buffer size (with the expected latency around 3ms, fixed and non-user-configurable) and it also comes with the solid support on Web MIDI API on Chrome Canary.  On the other hand, the land of Windows, Linux and Android will suffer from several issues: high latency, buffer underun over time, and no love on MIDI support. This is simply because these platforms do not provide a viable audio/MIDI subsystem for optimum performance. For cross-platform isseus, please leave your feedback on the WAAX wiki on GitHub."
});



documentTitles["getting-started.html#getting-started"] = "Getting Started";
index.add({
    url: "getting-started.html#getting-started",
    title: "Getting Started",
    body: "# Getting Started   "
});

documentTitles["getting-started.html#installation"] = "Installation";
index.add({
    url: "getting-started.html#installation",
    title: "Installation",
    body: "## Installation  For the local developement, you can download the zipped file or clone the GitHub repository.  ``` $ git clone https://github.com/hoch/WAAX.git ```   "
});

documentTitles["getting-started.html#using-waax-in-html-document"] = "Using WAAX in HTML Document";
index.add({
    url: "getting-started.html#using-waax-in-html-document",
    title: "Using WAAX in HTML Document",
    body: "## Using WAAX in HTML Document  If you are simply using the minified library (core + reference units), include library files from the URL below.  ``` &lt;script src=\&quot;http://waax-static.appspot.com/build/WAAX.min.js\&quot;&gt;&lt;/script&gt; ```  Alternatively, you can choose files you want to use. Note that the core library  and Fader plug-in must be loaded first before you can use any WAAX units. The example below loads the definition of oscillator unit after the WAAX core and Fader.  ``` &lt;script src=\&quot;your_path/WAAX.js\&quot;&gt;&lt;/script&gt; &lt;script src=\&quot;your_path/Fader.js\&quot;&gt;&lt;/script&gt; &lt;script src=\&quot;your_path/Oscil.js\&quot;&gt;&lt;/script&gt; &lt;script&gt;   // your WAAX code here... &lt;/script&gt; ```  The reference list of units can be found in this doucmentation. Once you've done with the developelment, you can compile the core and unit JavaScript files into a single file with your favorite tool chains.   "
});

documentTitles["getting-started.html#hello-sine"] = "\&quot;Hello Sine!\&quot;";
index.add({
    url: "getting-started.html#hello-sine",
    title: "\&quot;Hello Sine!\&quot;",
    body: "## \&quot;Hello Sine!\&quot;  ```javascript var sine = WX.Oscil({ pGain: 0.25 }); sine.to(WX.Master); ```  In the code example above, a sine oscillator is being created and connected to the master output of WAAX system. The oscillator (`sine`) or the master output (`WX.Master`) is called **'WAAX Unit'** or **'unit'** for short. Note that there is no *new* keyword for unit construction. `WX.Oscil()` is a factory method that produces an instance of oscillator with the initial setting, the gain of 0.25 in this case. The `.to()` method connects the oscillator and the master output.   "
});

documentTitles["getting-started.html#making-connections"] = "Making Connections";
index.add({
    url: "getting-started.html#making-connections",
    title: "Making Connections",
    body: "## Making Connections  The `.to()` method can be chained to connect more than 3 units. Also it might be useful to know `WX.patch()` method when connecting several units at once. As shown previously, you can intialize WAAX unit by passing an object of parameters to its factory method.  ``` var noise = WX.Noise({ pGain: 0.5 }),     lpf = WX.LPF({ pCutoff: 250, pQ: 12 }); noise.to(lpf).to(WX.Master); WX.patch(noise, lpf, WX.Master); ```  There we just built our first *audiographs* with WAAX. Try this example here!"
});



documentTitles["intro-preface-web-audio-api.html#waax-introduction"] = "WAAX - introduction";
index.add({
    url: "intro-preface-web-audio-api.html#waax-introduction",
    title: "WAAX - introduction",
    body: "### WAAX - introduction  "
});

documentTitles["intro-preface-web-audio-api.html#preface-web-audio-api"] = "Preface: Web Audio API";
index.add({
    url: "intro-preface-web-audio-api.html#preface-web-audio-api",
    title: "Preface: Web Audio API",
    body: "# Preface: Web Audio API  Hey. This is a doc.  ```javascript WX.Oscil = function () {  } ```  | Parameter | Type   	| Description 				| |:----------|:---------:|:--------------------------| | pFreq     | float		| oscillator frequency | | pGain     | float 	| oscillator gain |"
});



documentTitles["license-and-acknowledgement.html#license-acknowledgement"] = "License &amp; Acknowledgement";
index.add({
    url: "license-and-acknowledgement.html#license-acknowledgement",
    title: "License &amp; Acknowledgement",
    body: "# License &amp; Acknowledgement  "
});

documentTitles["license-and-acknowledgement.html#license"] = "License";
index.add({
    url: "license-and-acknowledgement.html#license",
    title: "License",
    body: "## License  The MIT License&lt;br&gt; Copyright (c) 2010-2013 Hongchan Choi  "
});

documentTitles["license-and-acknowledgement.html#acknowldegement"] = "Acknowldegement";
index.add({
    url: "license-and-acknowledgement.html#acknowldegement",
    title: "Acknowldegement",
    body: "## Acknowldegement  Special thanks to Chris Rogers, who invented the world of web audio, for invaluable guidance and feedback. I am also grateful to several Googlers who have been truly supportive on this project: Greg Simon and Dimitri Glazkov, Chris Wilson, and Boris Smus. Lastly, I sincerely thank to my CCRMAlites - Jonathan Berger, Chris Chafe, Ge Wang, John Granzow, Colin Sullivan and Juhan Nam - for their enthusiasm to help me bring new technologies into the computer music."
});



documentTitles["midi.html#using-midi"] = "Using MIDI";
index.add({
    url: "midi.html#using-midi",
    title: "Using MIDI",
    body: "# Using MIDI  **NOTE!** MIDI support in WAAX requires Web MIDI API, which is only available on Chrome Canary on OSX at the time of writing.  This section describes how to program MIDI functionalities in conjuntion with WAAX library. Before launching the browser, MIDI-compatible device (MIDI controller or MIDI interface) needs to be connected to the computer and the proper device driver should be installed. Otherwise you will have to restart the browser to get MIDI devices recognized.  "
});

documentTitles["midi.html#importing-midi-supprot"] = "Importing MIDI Supprot";
index.add({
    url: "midi.html#importing-midi-supprot",
    title: "Importing MIDI Supprot",
    body: "## Importing MIDI Supprot  If you are using the minified version of WAAX, you do not need to do anything further because the MIDI library is already enclosed. However, if you are selectivly importing WAAX components, the MIDI manager, `Ktrl.js`, should be included in the HTML document. (replace `waax_path` with the local WAAX directory.)  ``` &lt;script src=\&quot;waax_path/Ktrl.js\&quot;&gt;&lt;/script&gt; ```  "
});

documentTitles["midi.html#creating-midi-target-and-data-handler"] = "Creating MIDI Target and Data Handler";
index.add({
    url: "midi.html#creating-midi-target-and-data-handler",
    title: "Creating MIDI Target and Data Handler",
    body: "## Creating MIDI Target and Data Handler  `Ktrl.js` offers highly flexible MIDI data routing by abstracting physical and virtual MIDI devices. In order to route MIDI data to a certain destination, a MIDI target must be created.  ``` var midiTarget = Ktrl.createTarget(\&quot;mySynth\&quot;); midiTarget.activate(); ```  The next step is to design MIDI data handler for the newly created `midiTarget` instance. Use `.onData()` method to define the data handler. Programming the data handler is much easier than dealing with raw MIDI data bytes since the `.parse()` method transforms the raw data into human-readable form.  ``` midiTarget.onData(function (midimessage) {   var data = Ktrl.parse(midimessage);   switch (data.type) {     case \&quot;noteon\&quot;:       console.log(data.pitch, data.velocity);       break;     // more handling code...   } }); ```   "
});

documentTitles["midi.html#routing-midi-data"] = "Routing MIDI data";
index.add({
    url: "midi.html#routing-midi-data",
    title: "Routing MIDI data",
    body: "## Routing MIDI data  With the data handler, now we are ready to use the MIDI target for the incoming MIDI data. The final step of MIDI programming is routing MIDI inputs to the MIDI targets. Like the MIDI system in common digital audio workstation, `Ktrl.js` provides an aggregated input device; regardless of the number of devices connected to the system, it can be treated as a single virtual MIDI input device.  ``` Ktrl.ready(function () {   Ktrl.routeAllToTarget(midiTarget); }); ```  This is a safe bet for common usage since whatever MIDI device connected to the system, it will be used by the HTML document without specifying the reference of MIDI device. Alternatively, you can create individual routings as shown below.  ``` Ktrl.ready(function () {   Ktrl.routeSourceToTarget(1, midiTarget); }); ```  The code above demonstrates how to connect the second MIDI device to the web audio synth (MIDI target). However, if the computer does not have the second MIDI device, it will throw an error.  For the API reference, please visit [the project page](https://github.com/hoch/Ktrl)."
});



documentTitles["mui.html#mui-musical-user-interface"] = "MUI (Musical User Interface)";
index.add({
    url: "mui.html#mui-musical-user-interface",
    title: "MUI (Musical User Interface)",
    body: "# MUI (Musical User Interface)  MUI is a collection of custom HTML elements that are specifically disigned for musical applications.   "
});

documentTitles["mui.html#installation"] = "Installation";
index.add({
    url: "mui.html#installation",
    title: "Installation",
    body: "## Installation  Since MUI is a part of WAAX, so no additional installation is necessary if you have already installed the WAAX by cloning the repository or downloading the files. MUI elements are built on top of [Polymer](http://www.polymer-project.org/) and it is already included in the MUI directory.   "
});

documentTitles["mui.html#loading-mui-in-html-document"] = "Loading MUI in HTML document";
index.add({
    url: "mui.html#loading-mui-in-html-document",
    title: "Loading MUI in HTML document",
    body: "## Loading MUI in HTML document  Currently activating MUI needs a bit more work. (It will be fixed soon.) First off, Polymer library must be loaded first and then MUI core and its style sheet should come next.  ```html &lt;script src=\&quot;lib/polymer.min.js\&quot;&gt;&lt;/script&gt; &lt;script src=\&quot;mui-core.js\&quot;&gt;&lt;/script&gt; &lt;link rel=\&quot;stylesheet\&quot; type=\&quot;text/css\&quot; href=\&quot;mui-core.css\&quot;&gt; ```  Once the bootstrap is loaded, you can selectively start loading MUI elements (GUI widgets) you wish to use on the document. The following example shows how to import the knob and the toggle switch.  ```html &lt;link rel=\&quot;import\&quot; href=\&quot;elements/mui-knob.html\&quot;&gt; &lt;link rel=\&quot;import\&quot; href=\&quot;elements/mui-toggle.html\&quot;&gt; ```   "
});

documentTitles["mui.html#using-mui-elements"] = "Using MUI elements";
index.add({
    url: "mui.html#using-mui-elements",
    title: "Using MUI elements",
    body: "## Using MUI elements  Here is the fun part. You can create knobs and toggles switches by simply writing  HTML codes below. They are called \&quot;custom elements\&quot; which is made possible by Polymer; highly-componentized, portable, and reusable GUI widgets specifically designed for WAAX unit.  ```html &lt;mui-toggle id=\&quot;kActive\&quot; label=\&quot;ON\&quot;&gt;&lt;/mui-toggle&gt; &lt;mui-knob id=\&quot;kFreq\&quot; label=\&quot;Frequency\&quot; value=\&quot;0.01\&quot; min=\&quot;5000\&quot; max=\&quot;440.0\&quot;&gt;&lt;/mui-knob&gt; ```  Linking the toggle switch and the knob to the oscillator is surprinsingly simple. The good news is you do not have to worry about synchronizing variables in GUI widgets, corresponding parameters in WAAX unit and even values in the abstracted Web Audio API node.  ```javascript var osc = WX.Oscil(); MUI.$('kActive').link(osc, 'pActive'); MUI.$('kFreq').link(osc, 'pFreq'); ```  You can select a MUI element by using the special selector `MUI.$()`. Each MUI element has `.link()` method and the binding to a certain parameter can be done by passing the target unit reference (`osc`) and the parameter name (`pActive` or `pFreq`).  This auto-magical parameter binding is managed by Polymer ensuring all the values across different layers completely synchronized. That means the value in the oscillator will be changed when you touch the knob, and also the knob position will be changed when you modify the parameter value of the oscillator. This takes preset managment and MIDI support to another level. Truly empowering!"
});



documentTitles["parameter-control.html#parameter-control"] = "Parameter Control";
index.add({
    url: "parameter-control.html#parameter-control",
    title: "Parameter Control",
    body: "# Parameter Control  Having a complete control on parameters is crucial in sound synthesis. It gives you the ability to create more complex and interesting sound. With that in mind, WAAX is carefully designed to offer the ease of control with maximum flexibilty.   "
});

documentTitles["parameter-control.html#tweaking-parameters"] = "Tweaking Parameters";
index.add({
    url: "parameter-control.html#tweaking-parameters",
    title: "Tweaking Parameters",
    body: "## Tweaking Parameters  Every WAAX unit has a `.params` object, that includes all the available parameters that user can tweak. It is fairly similar to `AudioParam` object from Web Audio API and it is an abstract layer for `AudioParam` with more simple syntax and other neat features such as saving/loading presets or easy binding to GUI widgets. The unit reference documentation contains detailed information on the unit-specific parameters.  ``` var osc = WX.Oscil({ pFreq: 440.0 }); osc.set('pGain', 0.25); osc.to(WX.Master); ```  The `.set()` method in WAAX is designed for comprehensive parameter control. This method makes it possible to apply the unified parameter control across all the WAAX units. As shown above, the `.set()` method requires **parameter name** and **value** to do the job.  Note that WAAX parameters start with the lowercase *p* such as `pGain` and `pFreq`. It indicates the variable is a parameter that you can *set, automate, link, and bind* with other elements in the WAAX system.   "
});

documentTitles["parameter-control.html#making-transitions"] = "Making Transitions";
index.add({
    url: "parameter-control.html#making-transitions",
    title: "Making Transitions",
    body: "## Making Transitions  The code example below will generate a sine wave with 2 seconds of fade-in and 2 seconds of fade-out. This procedure has so many names: automation, slewing, transition, ramping and so on; it is very important to avoid a sudden change on parameters unless it is required or intended. Without proper ramping up and down, the resulting sound will suffer from clicks and pops.  ```javascript var osc = WX.Oscil({ pGain: 0.0 }); osc.to(WX.Master); osc.set('pGain', 1.0, 'line', WX.now + 2.0); osc.set('pGain', 0,0, 'line', WX.now + 4.0); ```  As shown above, you can add 3 more arguments to achieve time-related tasks. (In this case it uses 2 more arguments, transition type and end time) In addition, the `.set()` method is using `WX.now` variable because we need to specify the temporal structure of this transition. Note that `WX.now` always returns the elapsed time in seconds since the audio context of the page started.   "
});

documentTitles["parameter-control.html#modulation"] = "Modulation";
index.add({
    url: "parameter-control.html#modulation",
    title: "Modulation",
    body: "## Modulation  To make a long story *very* short, the modulation is modifying a signal with the other signal. In Web Audio API, you can change a parameter automatically and programmtically by connecting a signal to the parameter. Usually a synthesizer has a complex routing table for modulation and it is often called a modulation matrix.  ``` var osc = WX.Oscil({ pGain: 0.0 }),     lfo = WX.Oscil({ pFreq: 1.0, Gain: 0.5 }); lfo.modulate(osc, 'pGain'); ```  In the example above, we have the oscillator `lfo` modulate the gain of the `osc` unit to accomplish amplitude modulation (AM). Behind the scene, the `.modulate()` method looks for available modulation targets in the `osc` unit, and create the modulation route with the parameter named 'pGain.'  Not all parameters are modulatable. The information on modulation target on each unit can be found on the unit reference documentation. For more advanced modulation, please have a look at the tutorial on modulation.   "
});

documentTitles["parameter-control.html#saving-and-loading-presets"] = "Saving and Loading Presets";
index.add({
    url: "parameter-control.html#saving-and-loading-presets",
    title: "Saving and Loading Presets",
    body: "## Saving and Loading Presets  Every unit in WAAX has two methods in common: `.getParams()` and `.setParams()`. By using these methods, you can retrieve or set the current parameters in unit. They are useful when you are saving whole paramemters for multiple units as a preset.  ``` var params = osc.getParams(); osc.setParams(params); ```  Note that the method `.getParams()` returns a new (cloned) object, not the reference of parameter object in the unit."
});



documentTitles["toc.html#table-of-contents"] = "Table of contents";
index.add({
    url: "toc.html#table-of-contents",
    title: "Table of contents",
    body: "# Table of contents  "
});

documentTitles["toc.html#what-is-waax"] = "What is WAAX?";
index.add({
    url: "toc.html#what-is-waax",
    title: "What is WAAX?",
    body: "# What is WAAX?   - Introduction   - Features   - Cross-platform Support   - Cross-browser Support  "
});

documentTitles["toc.html#getting-started"] = "Getting Started";
index.add({
    url: "toc.html#getting-started",
    title: "Getting Started",
    body: "# Getting Started   - Installation   - Using WAAX in HTML document   - \&quot;Hello Sine\&quot;  "
});

documentTitles["toc.html#parameter-control"] = "Parameter Control";
index.add({
    url: "toc.html#parameter-control",
    title: "Parameter Control",
    body: "# Parameter Control   - .set()   - Automation   - Modulation   - Saving/loading presets  "
});

documentTitles["toc.html#mui"] = "MUI";
index.add({
    url: "toc.html#mui",
    title: "MUI",
    body: "# MUI   - Installation   - Using MUI in HTML document   - Binding Parameters with MUI  "
});

documentTitles["toc.html#midi-support"] = "MIDI Support";
index.add({
    url: "toc.html#midi-support",
    title: "MIDI Support",
    body: "# MIDI Support   - MIDI input and target   - Parsing incoming MIDI data  "
});

documentTitles["toc.html#dynamic-lifecycle"] = "Dynamic Lifecycle";
index.add({
    url: "toc.html#dynamic-lifecycle",
    title: "Dynamic Lifecycle",
    body: "# Dynamic Lifecycle   - Why and when is it useful?   - Usage  "
});

documentTitles["toc.html#using-visualizer"] = "Using Visualizer";
index.add({
    url: "toc.html#using-visualizer",
    title: "Using Visualizer",
    body: "# Using Visualizer  "
});

documentTitles["toc.html#design-your-own-unit"] = "Design Your Own Unit";
index.add({
    url: "toc.html#design-your-own-unit",
    title: "Design Your Own Unit",
    body: "# Design Your Own Unit   - Anatomy of WAAX Unit  "
});

documentTitles["toc.html#unit-reference"] = "Unit Reference";
index.add({
    url: "toc.html#unit-reference",
    title: "Unit Reference",
    body: "# Unit Reference  "
});

documentTitles["toc.html#utilitiy-reference"] = "Utilitiy Reference";
index.add({
    url: "toc.html#utilitiy-reference",
    title: "Utilitiy Reference",
    body: "# Utilitiy Reference  "
});

documentTitles["toc.html#resources"] = "Resources";
index.add({
    url: "toc.html#resources",
    title: "Resources",
    body: "# Resources   - 2013 NIME paper   - Web Audio API W3C spec   - Web MIDI API W3C spec   - Web Audio/MIDI Playground (Chris Wilson)   - Web Audio Demo Collection  "
});

documentTitles["toc.html#license-and-acknowledgement"] = "License and Acknowledgement";
index.add({
    url: "toc.html#license-and-acknowledgement",
    title: "License and Acknowledgement",
    body: "# License and Acknowledgement       ----------------------------------------------------------------- "
});

documentTitles["toc.html#introduction"] = "Introduction";
index.add({
    url: "toc.html#introduction",
    title: "Introduction",
    body: "## Introduction   - Preface: Web Audio API   - What is WAAX?   - Why is it created?  "
});

documentTitles["toc.html#setting-up"] = "Setting up";
index.add({
    url: "toc.html#setting-up",
    title: "Setting up",
    body: "## Setting up   - System requirements   - Using WAAX in your web page  "
});

documentTitles["toc.html#concepts"] = "Concepts";
index.add({
    url: "toc.html#concepts",
    title: "Concepts",
    body: "## Concepts   - Units: generator, processor and analyzer   - Building your first synthesizer   - Parameter control using WAAX  "
});

documentTitles["toc.html#live-examples"] = "Live examples";
index.add({
    url: "toc.html#live-examples",
    title: "Live examples",
    body: "## Live examples   - Interactive Code Editor: WXide   - Using Web MIDI API with _Ktrl_ library  "
});

documentTitles["toc.html#references"] = "References";
index.add({
    url: "toc.html#references",
    title: "References",
    body: "## References   - WAAX Units   - WAAX Utilities   - 2013 NIME paper   - Web Audio API W3C spec   - Web MIDI API W3C spec  "
});

documentTitles["toc.html#tutorial"] = "Tutorial";
index.add({
    url: "toc.html#tutorial",
    title: "Tutorial",
    body: "## Tutorial  "
});

documentTitles["toc.html#waax-101-computer-generated-sound"] = "WAAX 101: Computer-generated Sound";
index.add({
    url: "toc.html#waax-101-computer-generated-sound",
    title: "WAAX 101: Computer-generated Sound",
    body: "### WAAX 101: Computer-generated Sound   - Making a new timbre   - Crafting your first synth   - Art of envelope: FM Drones   - Trigger-happy: a simple sampler  "
});

documentTitles["toc.html#advanced-topic"] = "Advanced topic";
index.add({
    url: "toc.html#advanced-topic",
    title: "Advanced topic",
    body: "###  Advanced topic   - Understanding WAAX unit container   - Creating a new unit with WAAX unit builder   - Using PeriodicWave for complex tone   - Tip: pre-baked array buffer   - Tip: homebrewing IR and warped convolution"
});



documentTitles["unit-reference.html#unit-reference"] = "Unit Reference";
index.add({
    url: "unit-reference.html#unit-reference",
    title: "Unit Reference",
    body: "# Unit Reference  "
});

documentTitles["unit-reference.html#unit-common-parameters-unit-base-class"] = "Unit Common Parameters (Unit Base Class)";
index.add({
    url: "unit-reference.html#unit-common-parameters-unit-base-class",
    title: "Unit Common Parameters (Unit Base Class)",
    body: "### Unit Common Parameters (Unit Base Class) | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pActive` | boolean | unit status (bypass on false) |    | | `pGain` | float | unit output gain | yes  ||  "
});

documentTitles["unit-reference.html#unit-common-methods-unit-base-class"] = "Unit Common Methods (Unit Base Class)";
index.add({
    url: "unit-reference.html#unit-common-methods-unit-base-class",
    title: "Unit Common Methods (Unit Base Class)",
    body: "### Unit Common Methods (Unit Base Class)  "
});

documentTitles["unit-reference.html#setparamname-value"] = "`set(paramName, value)`";
index.add({
    url: "unit-reference.html#setparamname-value",
    title: "`set(paramName, value)`",
    body: "#### `set(paramName, value)` sets value of target parameter immediately.    - `paramName` *(string)* target parameter name   - `value` *(float)* target value  "
});

documentTitles["unit-reference.html#setparamname-value-transtype-time"] = "`set(paramName, value, transType, time)`";
index.add({
    url: "unit-reference.html#setparamname-value-transtype-time",
    title: "`set(paramName, value, transType, time)`",
    body: "#### `set(paramName, value, transType, time)` schedules value of target parameter with specified transition and end time.    - `paramName` *(string)* target parameter name   - `value` *(float)* target value   - `transType` *(int, string)* transition type: [1, 2, 3] or ['line', 'expo', 'target']   - `time` *(float)* transition end time  "
});

documentTitles["unit-reference.html#setparamname-value-target-time1-time2"] = "`set(paramName, value, \&quot;target\&quot;, time1, time2)`";
index.add({
    url: "unit-reference.html#setparamname-value-target-time1-time2",
    title: "`set(paramName, value, \&quot;target\&quot;, time1, time2)`",
    body: "#### `set(paramName, value, \&quot;target\&quot;, time1, time2)` schedules value of target parameter with exponential transition between start and end time.    - `paramName` *(string)* target parameter name   - `value` *(float)* target value   - `time1` *(float)* transition start time   - `time2` *(float)* transition end time  "
});

documentTitles["unit-reference.html#tounit"] = "`to(unit)`";
index.add({
    url: "unit-reference.html#tounit",
    title: "`to(unit)`",
    body: "#### `to(unit)` connects to WAAX unit.    - `unit` *(wxunit)* WAAX Unit with inlet  "
});

documentTitles["unit-reference.html#connectaudionode"] = "`connect(audioNode)`";
index.add({
    url: "unit-reference.html#connectaudionode",
    title: "`connect(audioNode)`",
    body: "#### `connect(audioNode)` connects to Web Audio API node.    - `unit` *(wxunit)* WAAX Unit (with inlet)  "
});

documentTitles["unit-reference.html#modulateunit-paramname"] = "`modulate(unit, paramName)`";
index.add({
    url: "unit-reference.html#modulateunit-paramname",
    title: "`modulate(unit, paramName)`",
    body: "#### `modulate(unit, paramName)` modulates a parameter in target WAAX unit.    - `unit` *(wxunit)* WAAX Unit   - `paramName` *(string)* unit parameter   "
});

documentTitles["unit-reference.html#wxadsr"] = "WX.ADSR";
index.add({
    url: "unit-reference.html#wxadsr",
    title: "WX.ADSR",
    body: "## WX.ADSR Multi-phase envelope generator: attack, decay, sustain, release.  "
});

documentTitles["unit-reference.html#wxadsr-parameters"] = "WX.ADSR: Parameters";
index.add({
    url: "unit-reference.html#wxadsr-parameters",
    title: "WX.ADSR: Parameters",
    body: "### WX.ADSR: Parameters | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pAttack` | float | attacking time in seconds |  | | `pDecay` | float | decay time in seconds |  | | `pSustain` | float | gain in sustain phase |  | | `pRelease` | float | release time in seconds |  | | `pTimeConstant` | float | time constant of exponential curve for release phase |  ||  "
});

documentTitles["unit-reference.html#wxadsr-methods"] = "WX.ADSR: Methods";
index.add({
    url: "unit-reference.html#wxadsr-methods",
    title: "WX.ADSR: Methods",
    body: "### WX.ADSR: Methods  "
});

documentTitles["unit-reference.html#setadsrattack-decay-sustain-release"] = "`setADSR(attack, decay, sustain, release)`";
index.add({
    url: "unit-reference.html#setadsrattack-decay-sustain-release",
    title: "`setADSR(attack, decay, sustain, release)`",
    body: "#### `setADSR(attack, decay, sustain, release)`   - `attack` *(float)* attack time in seconds   - `decay` *(float)* decay time in seconds   - `sustain` *(float)* gain in sustain phase   - `release` *(float)* release time in seconds   "
});

documentTitles["unit-reference.html#wxchorus"] = "WX.Chorus";
index.add({
    url: "unit-reference.html#wxchorus",
    title: "WX.Chorus",
    body: "## WX.Chorus Chorus effect based on [the paper by Jon Dattorro](https://ccrma.stanford.edu/~dattorro/EffectDesignPart2.pdf).  "
});

documentTitles["unit-reference.html#wxchorus-parameters"] = "WX.Chorus: Parameters";
index.add({
    url: "unit-reference.html#wxchorus-parameters",
    title: "WX.Chorus: Parameters",
    body: "### WX.Chorus: Parameters | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pRate` | float | LFO speed for modulation |    | | `pDepth` | float | LFO depth for modulation |    | | `pIntensity` | float | internal feedback intensity |    | | `pBlend` | float | blend amount between feedback and feedforward |    | | `pMix` | float | mix amount between wet and dry signal |    ||   "
});

documentTitles["unit-reference.html#wxcomp"] = "WX.Comp";
index.add({
    url: "unit-reference.html#wxcomp",
    title: "WX.Comp",
    body: "## WX.Comp Compressor with variable knee setting. DynamicCompressor node in WAAX wrapper.  "
});

documentTitles["unit-reference.html#wxcomp-parameters"] = "WX.Comp: Parameters";
index.add({
    url: "unit-reference.html#wxcomp-parameters",
    title: "WX.Comp: Parameters",
    body: "### WX.Comp: Parameters | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pThreshold` | float | threshold in decibles |    | | `pKnee` | float | knee (in decibels) |    | | `pRatio` | float | compression ratio |    | | `pAttack` | float | attack time |    | | `pRelease` | float | release time |    ||   "
});

documentTitles["unit-reference.html#wxconverb"] = "WX.Converb";
index.add({
    url: "unit-reference.html#wxconverb",
    title: "WX.Converb",
    body: "## WX.Converb Convolution reverb with mix balance control.  "
});

documentTitles["unit-reference.html#wxconverb-parameters"] = "WX.Converb: Parameters";
index.add({
    url: "unit-reference.html#wxconverb-parameters",
    title: "WX.Converb: Parameters",
    body: "### WX.Converb: Parameters | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pMix` | float | mix amount between wet and dry signal |    ||  "
});

documentTitles["unit-reference.html#wxconverb-methods"] = "WX.Converb: Methods";
index.add({
    url: "unit-reference.html#wxconverb-methods",
    title: "WX.Converb: Methods",
    body: "### WX.Converb: Methods  "
});

documentTitles["unit-reference.html#setimpulseresponseimpulseresponse"] = "`setImpulseResponse(impulseResponse)`";
index.add({
    url: "unit-reference.html#setimpulseresponseimpulseresponse",
    title: "`setImpulseResponse(impulseResponse)`",
    body: "#### `setImpulseResponse(impulseResponse)`   - `impulseResponse` *(audioBuffer)* impulse response buffer   "
});

documentTitles["unit-reference.html#wxfader"] = "WX.Fader";
index.add({
    url: "unit-reference.html#wxfader",
    title: "WX.Fader",
    body: "## WX.Fader Fader abstraction. Supports muting, gain control in decibels. Note that `WX.Master` is a pre-declared instance of this unit class.  "
});

documentTitles["unit-reference.html#wxfader-parameters"] = "WX.Fader: Parameters";
index.add({
    url: "unit-reference.html#wxfader-parameters",
    title: "WX.Fader: Parameters",
    body: "### WX.Fader: Parameters | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pMute` | boolean | muted when true |    | | `pdB` | float | gain in decibels |    ||   "
});

documentTitles["unit-reference.html#wxfilterbank"] = "WX.FilterBank";
index.add({
    url: "unit-reference.html#wxfilterbank",
    title: "WX.FilterBank",
    body: "## WX.FilterBank Filterbank with 16 bandpass filters. Custom design for FrostPad demo.  "
});

documentTitles["unit-reference.html#wxfilterbank-parameters"] = "WX.FilterBank: Parameters";
index.add({
    url: "unit-reference.html#wxfilterbank-parameters",
    title: "WX.FilterBank: Parameters",
    body: "### WX.FilterBank: Parameters | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pPitch` | int | base pitch of filterbank |    | | `pChord` | string | chord type* for harmonic structure |    | | `pSlope` | float | gain balance between high end and low end |    | | `pWidth` | float | bandwidth of filters |    | | `pDetune` | float | detune of filter frequency |    ||  * chord type: 'ionian', 'lydian', 'mixolydian', 'aeolian'   "
});

documentTitles["unit-reference.html#wxfmop"] = "WX.FMop";
index.add({
    url: "unit-reference.html#wxfmop",
    title: "WX.FMop",
    body: "## WX.FMop FM operator consists of 2 sine oscillator.  "
});

documentTitles["unit-reference.html#wxfmop-parameters"] = "WX.FMop: Parameters";
index.add({
    url: "unit-reference.html#wxfmop-parameters",
    title: "WX.FMop: Parameters",
    body: "### WX.FMop: Parameters | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pFreq` | float | frequency of carrier, related to base pitch |    | | `pHarmonicRatio` | float | harmonic coefficient between modulator and carrier frequency |    | | `pModulationIndex` | float | gain coefficient of modulator output |    ||   "
});

documentTitles["unit-reference.html#wxfmop-methods"] = "WX.FMop: Methods";
index.add({
    url: "unit-reference.html#wxfmop-methods",
    title: "WX.FMop: Methods",
    body: "### WX.FMop: Methods "
});

documentTitles["unit-reference.html#starttime"] = "`start(time)`";
index.add({
    url: "unit-reference.html#starttime",
    title: "`start(time)`",
    body: "#### `start(time)`   - `time` *(float)* time in seconds for unit activation. optional. "
});

documentTitles["unit-reference.html#stoptime"] = "`stop(time)`";
index.add({
    url: "unit-reference.html#stoptime",
    title: "`stop(time)`",
    body: "#### `stop(time)`   - `time` *(float)* time in seconds for unit deactivation. optional.   "
});

documentTitles["unit-reference.html#wxformantv"] = "WX.FormantV";
index.add({
    url: "unit-reference.html#wxformantv",
    title: "WX.FormantV",
    body: "## WX.FormantV Formant filter for simple vowel synthesis based on 2D vector positioning. It is heavily inspired by Ge Wang's joystick-formant demo.  "
});

documentTitles["unit-reference.html#wxformantv-parameters"] = "WX.FormantV: Parameters";
index.add({
    url: "unit-reference.html#wxformantv-parameters",
    title: "WX.FormantV: Parameters",
    body: "### WX.FormantV: Parameters | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pPositionX` | float | x position of 2d vector |    | | `pPositionY` | float | y position of 2d vector |    ||  "
});

documentTitles["unit-reference.html#wxformantv-methods"] = "WX.FormantV: Methods";
index.add({
    url: "unit-reference.html#wxformantv-methods",
    title: "WX.FormantV: Methods",
    body: "### WX.FormantV: Methods  "
});

documentTitles["unit-reference.html#setpositionx-y-transtype-time1-time2"] = "`setPosition(x, y, transType, time1, time2)`";
index.add({
    url: "unit-reference.html#setpositionx-y-transtype-time1-time2",
    title: "`setPosition(x, y, transType, time1, time2)`",
    body: "#### `setPosition(x, y, transType, time1, time2)`   - `x` *(float)* x position of 2d vector   - `y` *(float)* y position of 2d vector   - `transType` *(string | int)* additional argument for `.set()` method   - `time1` *(float)* additional argument for `.set()` method   - `time2` *(float)* additional argument for `.set()` method   "
});

documentTitles["unit-reference.html#wximpulsetrain"] = "WX.ImpulseTrain";
index.add({
    url: "unit-reference.html#wximpulsetrain",
    title: "WX.ImpulseTrain",
    body: "## WX.ImpulseTrain Impulse train generator based on oscillator node.  "
});

documentTitles["unit-reference.html#wximpulsetrain-parameters"] = "WX.ImpulseTrain: Parameters";
index.add({
    url: "unit-reference.html#wximpulsetrain-parameters",
    title: "WX.ImpulseTrain: Parameters",
    body: "### WX.ImpulseTrain: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pFreq` | float | frequency of impulse train | yes | | `pDynamic` | boolean | use dynamic mode |   ||  "
});

documentTitles["unit-reference.html#wximpulsetrain-methods"] = "WX.ImpulseTrain: Methods";
index.add({
    url: "unit-reference.html#wximpulsetrain-methods",
    title: "WX.ImpulseTrain: Methods",
    body: "### WX.ImpulseTrain: Methods  "
});

documentTitles["unit-reference.html#starttime"] = "`start(time)`";
index.add({
    url: "unit-reference.html#starttime",
    title: "`start(time)`",
    body: "#### `start(time)`   - `time` *(float)* time in seconds for unit activation. optional.  "
});

documentTitles["unit-reference.html#stoptime"] = "`stop(time)`";
index.add({
    url: "unit-reference.html#stoptime",
    title: "`stop(time)`",
    body: "#### `stop(time)`   - `time` *(float)* time in seconds for unit deactivation. optional.    "
});

documentTitles["unit-reference.html#wxlpf"] = "WX.LPF";
index.add({
    url: "unit-reference.html#wxlpf",
    title: "WX.LPF",
    body: "## WX.LPF Low pass filter based on two biquad filter nodes. Enhanced mode will cascade two filters in serial resulting higher and narrow resonance.  "
});

documentTitles["unit-reference.html#wxlpf-parameters"] = "WX.LPF: Parameters";
index.add({
    url: "unit-reference.html#wxlpf-parameters",
    title: "WX.LPF: Parameters",
    body: "### WX.LPF: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pCutoff` | float | filter frequency | yes | | `pQ` | float | filter resonance | yes  | | `pEnhanced` | boolean | enhanced mode |   ||   "
});

documentTitles["unit-reference.html#wxnoise"] = "WX.Noise";
index.add({
    url: "unit-reference.html#wxnoise",
    title: "WX.Noise",
    body: "## WX.Noise White noise (gaussian distribution) generator. The implementation is based on buffer source node to unsure the optimum performance.  "
});

documentTitles["unit-reference.html#wxnoise-parameters"] = "WX.Noise: Parameters";
index.add({
    url: "unit-reference.html#wxnoise-parameters",
    title: "WX.Noise: Parameters",
    body: "### WX.Noise: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pGrain` | float | granularity of noise | yes | | `pDynamic` | boolean | use dynamic mode |   ||  "
});

documentTitles["unit-reference.html#wxnoise-methods"] = "WX.Noise: Methods";
index.add({
    url: "unit-reference.html#wxnoise-methods",
    title: "WX.Noise: Methods",
    body: "### WX.Noise: Methods  "
});

documentTitles["unit-reference.html#starttime"] = "`start(time)`";
index.add({
    url: "unit-reference.html#starttime",
    title: "`start(time)`",
    body: "#### `start(time)`   - `time` *(float)* time in seconds for unit activation. optional.  "
});

documentTitles["unit-reference.html#stoptime"] = "`stop(time)`";
index.add({
    url: "unit-reference.html#stoptime",
    title: "`stop(time)`",
    body: "#### `stop(time)`   - `time` *(float)* time in seconds for unit deactivation. optional.   "
});

documentTitles["unit-reference.html#wxoscil"] = "WX.Oscil";
index.add({
    url: "unit-reference.html#wxoscil",
    title: "WX.Oscil",
    body: "## WX.Oscil Multi-waveform oscillator with gain control.  "
});

documentTitles["unit-reference.html#wxoscil-parameters"] = "WX.Oscil: Parameters";
index.add({
    url: "unit-reference.html#wxoscil-parameters",
    title: "WX.Oscil: Parameters",
    body: "### WX.Oscil: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pType` | string | waveform type* | | | `pFreq` | float | oscillator frequency | yes | | `pDynamic` | boolean | use dynamic mode |   ||  * waveform type: 'sine', 'square', 'sawtooth', 'triangle'  "
});

documentTitles["unit-reference.html#wxoscil-methods"] = "WX.Oscil: Methods";
index.add({
    url: "unit-reference.html#wxoscil-methods",
    title: "WX.Oscil: Methods",
    body: "### WX.Oscil: Methods  "
});

documentTitles["unit-reference.html#starttime"] = "`start(time)`";
index.add({
    url: "unit-reference.html#starttime",
    title: "`start(time)`",
    body: "#### `start(time)`   - `time` *(float)* time in seconds for unit activation. optional.  "
});

documentTitles["unit-reference.html#stoptime"] = "`stop(time)`";
index.add({
    url: "unit-reference.html#stoptime",
    title: "`stop(time)`",
    body: "#### `stop(time)`   - `time` *(float)* time in seconds for unit deactivation. optional.   "
});

documentTitles["unit-reference.html#wxphasor"] = "WX.Phasor";
index.add({
    url: "unit-reference.html#wxphasor",
    title: "WX.Phasor",
    body: "## WX.Phasor Phasor implementation based on Chris Roger's idea of cascaded notch filters.  "
});

documentTitles["unit-reference.html#wxphasor-parameters"] = "WX.Phasor: Parameters";
index.add({
    url: "unit-reference.html#wxphasor-parameters",
    title: "WX.Phasor: Parameters",
    body: "### WX.Phasor: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pRate` | float | LFO modulation speed | | | `pDepth` | float | LFO modulation depth | | | `pBaseFrequency` | float | base frequency of filter group |   | | `pSpacing` | float | spacing factor for filter frequencies |   | | `pMix` | float | mix amount between wet and dry signal |    ||   "
});

documentTitles["unit-reference.html#wxpingpong"] = "WX.Pingpong";
index.add({
    url: "unit-reference.html#wxpingpong",
    title: "WX.Pingpong",
    body: "## WX.Pingpong Stereo ping-pong delay with variable crosstalk between channels.  "
});

documentTitles["unit-reference.html#wxpingpong-parameters"] = "WX.pingpong: Parameters";
index.add({
    url: "unit-reference.html#wxpingpong-parameters",
    title: "WX.pingpong: Parameters",
    body: "### WX.pingpong: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pDelayTimeLeft` | float | left delay time in seconds | | | `pDelayTimeRight` | float | right delay time in seconds | | | `pFeedbackLeft` | float | feedback amount for left delay channel | | | `pFeedbackRight` | float | feedback amount for right delay channel | | | `pCrosstlak` | float | crosstalk amount | | | `pMix` | float | mix amount between wet and dry signal |    ||  "
});

documentTitles["unit-reference.html#wxpingpong-methods"] = "WX.pingpong: Methods";
index.add({
    url: "unit-reference.html#wxpingpong-methods",
    title: "WX.pingpong: Methods",
    body: "### WX.pingpong: Methods  "
});

documentTitles["unit-reference.html#setdelaytimeleft-right-transtype-time1-time2"] = "`setDelayTime(left, right, transtype, time1, time2)`";
index.add({
    url: "unit-reference.html#setdelaytimeleft-right-transtype-time1-time2",
    title: "`setDelayTime(left, right, transtype, time1, time2)`",
    body: "#### `setDelayTime(left, right, transtype, time1, time2)`   - `left` *(float)* left delay time in seconds   - `right` *(float)* right delay time in seconds  "
});

documentTitles["unit-reference.html#setfeedbackleft-right-transtype-time1-time2"] = "`setFeedback(left, right, transtype, time1, time2)`";
index.add({
    url: "unit-reference.html#setfeedbackleft-right-transtype-time1-time2",
    title: "`setFeedback(left, right, transtype, time1, time2)`",
    body: "#### `setFeedback(left, right, transtype, time1, time2)`   - `left` *(float)* feedback amount for left delay channel   - `right` *(float)* feedback amount for right delay channel   "
});

documentTitles["unit-reference.html#wxsampler"] = "WX.Sampler";
index.add({
    url: "unit-reference.html#wxsampler",
    title: "WX.Sampler",
    body: "## WX.Sampler Buffer source node abstraction with additional features.  "
});

documentTitles["unit-reference.html#wxsampler-parameters"] = "WX.Sampler: Parameters";
index.add({
    url: "unit-reference.html#wxsampler-parameters",
    title: "WX.Sampler: Parameters",
    body: "### WX.Sampler: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pPitch` | int | MIDI pitch for sample playback | | | `pBasePitch` | int | base pitch for sample | | | `pLoop` | boolean | loop mode | ||  "
});

documentTitles["unit-reference.html#wxsampler-methods"] = "WX.Sampler: Methods";
index.add({
    url: "unit-reference.html#wxsampler-methods",
    title: "WX.Sampler: Methods",
    body: "### WX.Sampler: Methods  "
});

documentTitles["unit-reference.html#onloadfn"] = "`onload(fn)`";
index.add({
    url: "unit-reference.html#onloadfn",
    title: "`onload(fn)`",
    body: "#### `onload(fn)` Specifies callback function for sample buffer 'onload' event.    - `fn` *(function)* function to be executed on sample loaded  "
});

documentTitles["unit-reference.html#setbufferbuffer"] = "`setBuffer(buffer)`";
index.add({
    url: "unit-reference.html#setbufferbuffer",
    title: "`setBuffer(buffer)`",
    body: "#### `setBuffer(buffer)` Assigns a sample buffer to sampler.    - `buffer` *(audioBuffer)* sample buffer for sampler  "
});

documentTitles["unit-reference.html#getdruation"] = "`getDruation()`";
index.add({
    url: "unit-reference.html#getdruation",
    title: "`getDruation()`",
    body: "#### `getDruation()` Returns duration of sample buffer in seconds.  "
});

documentTitles["unit-reference.html#oneshottime-duration"] = "`oneshot(time, duration)`";
index.add({
    url: "unit-reference.html#oneshottime-duration",
    title: "`oneshot(time, duration)`",
    body: "#### `oneshot(time, duration)` Starts sample playback at specified time for duration. Useful for *trigger and forget* approach.    - `time` *(float)* function to be executed on sample loaded   - `duration` *(float)* function to be executed on sample loaded  "
});

documentTitles["unit-reference.html#starttime"] = "`start(time)`";
index.add({
    url: "unit-reference.html#starttime",
    title: "`start(time)`",
    body: "#### `start(time)`   - `time` *(float)* time in seconds for unit activation. optional.  "
});

documentTitles["unit-reference.html#stoptime"] = "`stop(time)`";
index.add({
    url: "unit-reference.html#stoptime",
    title: "`stop(time)`",
    body: "#### `stop(time)`   - `time` *(float)* time in seconds for unit deactivation. optional.   "
});

documentTitles["unit-reference.html#wxsaturator"] = "WX.Saturator";
index.add({
    url: "unit-reference.html#wxsaturator",
    title: "WX.Saturator",
    body: "## WX.Saturator Implements saturation effect based on WaveShaper node.  "
});

documentTitles["unit-reference.html#wxsaturator-parameters"] = "WX.Saturator: Parameters";
index.add({
    url: "unit-reference.html#wxsaturator-parameters",
    title: "WX.Saturator: Parameters",
    body: "### WX.Saturator: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pQuality` | float | saturation quality | | | `pDrive` | float | saturation amount | ||   "
});

documentTitles["unit-reference.html#wxspectrum"] = "WX.Spectrum";
index.add({
    url: "unit-reference.html#wxspectrum",
    title: "WX.Spectrum",
    body: "## WX.Spectrum Spectrum visualizer based on Analyser node.  "
});

documentTitles["unit-reference.html#wxspectrum-parameters"] = "WX.Spectrum: Parameters";
index.add({
    url: "unit-reference.html#wxspectrum-parameters",
    title: "WX.Spectrum: Parameters",
    body: "### WX.Spectrum: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pSmoothingTimeConstant` | float | smoothing factor between succesive frames | | | `pMaxDecibels` | float | maximum gain in decibels | | | `pMinDecibels` | float | minimum gain in decibels | | | `pScale` | string | frequency axis scale* | | | `pAutoClear` | boolean | clear drawn visualization every frame | | | `pShowGrid` | boolean | show reference(frequency/decibels) grid | ||  * scale: log | linear  "
});

documentTitles["unit-reference.html#wxspectrum-methods"] = "WX.Spectrum: Methods";
index.add({
    url: "unit-reference.html#wxspectrum-methods",
    title: "WX.Spectrum: Methods",
    body: "### WX.Spectrum: Methods  "
});

documentTitles["unit-reference.html#setcontext2dcontext"] = "`setContext2D(context)`";
index.add({
    url: "unit-reference.html#setcontext2dcontext",
    title: "`setContext2D(context)`",
    body: "#### `setContext2D(context)` Sets 2d context (canvas) for visualization.    - `context` *(context2d)* 2d context from canvas  "
});

documentTitles["unit-reference.html#drawcolor-gridcolor"] = "`draw(color, gridColor)`";
index.add({
    url: "unit-reference.html#drawcolor-gridcolor",
    title: "`draw(color, gridColor)`",
    body: "#### `draw(color, gridColor)` Draws visualization and reference grid with color setting. Use inside animation rendering loop.    - `color` *(string)* visualization color   - `gridColor` *(string)* reference grid color   "
});

documentTitles["unit-reference.html#wxstep"] = "WX.Step";
index.add({
    url: "unit-reference.html#wxstep",
    title: "WX.Step",
    body: "## WX.Step Control signal (DC offset) generator. Use with oscillator or envelope to generate modulation source signal.  "
});

documentTitles["unit-reference.html#wxstep-methods"] = "WX.Step: Methods";
index.add({
    url: "unit-reference.html#wxstep-methods",
    title: "WX.Step: Methods",
    body: "### WX.Step: Methods  "
});

documentTitles["unit-reference.html#stoptime"] = "`stop(time)`";
index.add({
    url: "unit-reference.html#stoptime",
    title: "`stop(time)`",
    body: "#### `stop(time)`   - `time` *(float)* time in seconds for unit deactivation. optional.   "
});

documentTitles["unit-reference.html#wxstereovisualizer"] = "WX.StereoVisualizer";
index.add({
    url: "unit-reference.html#wxstereovisualizer",
    title: "WX.StereoVisualizer",
    body: "## WX.StereoVisualizer Stereo visualizer with user-defined render method.  "
});

documentTitles["unit-reference.html#wxstereovisualizer-parameters"] = "WX.StereoVisualizer: Parameters";
index.add({
    url: "unit-reference.html#wxstereovisualizer-parameters",
    title: "WX.StereoVisualizer: Parameters",
    body: "### WX.StereoVisualizer: Parameters  | name | type | description | modulatable | |:-------:|:-----:|:-------------------------:|:-----:| | `pSmoothingTimeConstant` | float | smoothing factor between succesive frames | | | `pMaxDecibels` | float | maximum gain in decibels | | | `pMinDecibels` | float | minimum gain in decibels | ||  "
});

documentTitles["unit-reference.html#wxstereovisualizer-methods"] = "WX.StereoVisualizer: Methods";
index.add({
    url: "unit-reference.html#wxstereovisualizer-methods",
    title: "WX.StereoVisualizer: Methods",
    body: "### WX.StereoVisualizer: Methods  "
});

documentTitles["unit-reference.html#drawspectrum"] = "`drawSpectrum()`";
index.add({
    url: "unit-reference.html#drawspectrum",
    title: "`drawSpectrum()`",
    body: "#### `drawSpectrum()` Draws frequency-domain visualization with user-defined render method. Use inside animation rendering loop.  "
});

documentTitles["unit-reference.html#drawwaveform"] = "`drawWaveform()`";
index.add({
    url: "unit-reference.html#drawwaveform",
    title: "`drawWaveform()`",
    body: "#### `drawWaveform()` Draws time-domain visualization with user-defined render method. Use inside animation rendering loop.  "
});

documentTitles["unit-reference.html#ondrawfn"] = "`onDraw(fn)`";
index.add({
    url: "unit-reference.html#ondrawfn",
    title: "`onDraw(fn)`",
    body: "#### `onDraw(fn)` Defines render algorithm for drawing methods.    - `fn` *(function)* function to be executed every animation frame.  "
});

documentTitles["unit-reference.html#ondrawbuffer1-buffer2"] = "`_ondraw(buffer1, buffer2)`";
index.add({
    url: "unit-reference.html#ondrawbuffer1-buffer2",
    title: "`_ondraw(buffer1, buffer2)`",
    body: "#### `_ondraw(buffer1, buffer2)` Callback function for frame rendering. Defined by '.onDraw()' method.    - `buffer1` *(Float32Array | Uint8Array)* buffer data for left channel   - `buffer2` *(Float32Array | Uint8Array)* buffer data for right channel"
});



documentTitles["wx-oscil.html#wxoscil"] = "WX.Oscil";
index.add({
    url: "wx-oscil.html#wxoscil",
    title: "WX.Oscil",
    body: "# WX.Oscil Multi-waveform oscillator with gain control.  "
});

documentTitles["wx-oscil.html#parameters"] = "Parameters";
index.add({
    url: "wx-oscil.html#parameters",
    title: "Parameters",
    body: "## Parameters | Parameter | Type    | Description     | Default  | Range | |:---------:|:-------:|:---------------:|:--------:|:-----:| | pType     | string  | waveform type   | 'sine'   | 'sine', 'square', 'sawtooth', 'triangle'| | pFreq     | float   | frequency  | 440.0   |            | | pGain     | float   | gain       | 0.25    |            ||   "
});

documentTitles["wx-oscil.html#usage"] = "Usage";
index.add({
    url: "wx-oscil.html#usage",
    title: "Usage",
    body: "## Usage ```javascript var osc = WX.Oscil({ pFreq: 440 }); osc.set('pType', 'sawtooth'); // gain ramping (0.5 to 0.0 in 2 seconds) osc.set('pGain', 0.5).set('pGain', 0.0, 1, WX.now + 2); WX.patch(osc, WX.Master); ```"
});


