# Parameter Control

Having a complete control on parameters is crucial in sound synthesis. It gives you the ability to create more complex and interesting sound. With that in mind, WAAX is carefully designed to offer the ease of control with maximum flexibilty.


## Tweaking Parameters

Every WAAX unit has a `.params` object, that includes all the available parameters that user can tweak. It is fairly similar to `AudioParam` object from Web Audio API and it is an abstract layer for `AudioParam` with more simple syntax and other neat features such as saving/loading presets or easy binding to GUI widgets. The unit reference documentation contains detailed information on the unit-specific parameters.

```
var osc = WX.Oscil({ pFreq: 440.0 });
osc.set('pGain', 0.25);
osc.to(WX.Master);
```

The `.set()` method in WAAX is designed for comprehensive parameter control. This method makes it possible to apply the unified parameter control across all the WAAX units. As shown above, the `.set()` method requires **parameter name** and **value** to do the job.

Note that WAAX parameters start with the lowercase *p* such as `pGain` and `pFreq`. It indicates the variable is a parameter that you can *set, automate, link, and bind* with other elements in the WAAX system.


## Making Transitions

The code example below will generate a sine wave with 2 seconds of fade-in and 2 seconds of fade-out. This procedure has so many names: automation, slewing, transition, ramping and so on; it is very important to avoid a sudden change on parameters unless it is required or intended. Without proper ramping up and down, the resulting sound will suffer from clicks and pops.

```javascript
var osc = WX.Oscil({ pGain: 0.0 });
osc.to(WX.Master);
osc.set('pGain', 1.0, 'line', WX.now + 2.0);
osc.set('pGain', 0,0, 'line', WX.now + 4.0);
```

As shown above, you can add 3 more arguments to achieve time-related tasks. (In this case it uses 2 more arguments, transition type and end time) In addition, the `.set()` method is using `WX.now` variable because we need to specify the temporal structure of this transition. Note that `WX.now` always returns the elapsed time in seconds since the audio context of the page started.


## Modulation

To make a long story *very* short, the modulation is modifying a signal with the other signal. In Web Audio API, you can change a parameter automatically and programmtically by connecting a signal to the parameter. Usually a synthesizer has a complex routing table for modulation and it is often called a modulation matrix.

```
var osc = WX.Oscil({ pGain: 0.0 }),
    lfo = WX.Oscil({ pFreq: 1.0, Gain: 0.5 });
lfo.modulate(osc, 'pGain');
```

In the example above, we have the oscillator `lfo` modulate the gain of the `osc` unit to accomplish amplitude modulation (AM). Behind the scene, the `.modulate()` method looks for available modulation targets in the `osc` unit, and create the modulation route with the parameter named 'pGain.'

Not all parameters are modulatable. The information on modulation target on each unit can be found on the unit reference documentation. For more advanced modulation, please have a look at the tutorial on modulation.


## Saving and Loading Presets

Every unit in WAAX has two methods in common: `.getParams()` and `.setParams()`. By using these methods, you can retrieve or set the current parameters in unit. They are useful when you are saving whole paramemters for multiple units as a preset.

```
var params = osc.getParams();
osc.setParams(params);
```

Note that the method `.getParams()` returns a new (cloned) object, not the reference of parameter object in the unit.