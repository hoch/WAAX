function Control (targetView, name, unit, defaultValue, minValue, maxValue, useLogScale) {
    this.targetView = targetView;
    this.name = name;
    this.unit = unit;
    this.value = defaultValue;
    this.minValue = minValue;
    this.maxValue = maxValue;
    // some edge cases
    // 1) when min = max
    // 2) when value = 0.0.. norm is unconditionally zero    
    this.normValue = this.value / (this.maxValue - this.minValue);
    this.useLogScale = (useLogScale || false);
    this.onchange = function () {};
    
    // should be in prototype
    this._calculateValueLinear = function (normValue) {
        this.value = this.minValue + normValue * (this.maxValue - this.minValue);
    }
    this._calculateValueLog = function (normValue) {
        var max = Math.log(this.maxValue),
            min = Math.log(this.minValue);
        this.value = Math.exp(min + normValue * (max - min));
    }
    this.getName = function () {
        return this.name;
    }
    this.getUnit = function () {
        return this.unit;
    }
    this.getValue = function (precision) {
        return this.value.toFixed(precision || 2);
    }
    this.getNormValue = function () {
        return (this.value - this.minValue) / (this.maxValue - this.minValue);
    }
    this.setValue = function (value) {
        this.value = value;
        this.normValue = this.value / (this.maxValue - this.minValue);
        this.updateView();
    }
    this.updateView = function () {
        this.targetView.setName(this.getName());
        this.targetView.setUnit(this.getUnit());
        this.targetView.setValue(this.getValue());
        this.targetView.setSliderPosition(this.getNormValue()); 
        this.onchange(this.getValue());
    }
    this._initTargetView = function () {
        this.targetView.setName(this.getName());
        this.targetView.setUnit(this.getUnit());
        this.targetView.setValue(this.getValue());
        this.targetView.setSliderPosition(this.getNormValue());
        this.targetView.onchange = function (normValue) {
            this.calculateValue(normValue);
            this.targetView.setValue(this.getValue());
            this.onchange(this.getValue());
        }.bind(this);
    }
    
    // init    
    this.calculateValue = this._calculateValueLinear;
    if (this.useLogScale) {
        this.calculateValue = this._calculateValueLog;
    }
    this._initTargetView();
}

function SliderView (UIContainerID) {
    
    this.container = document.getElementById(UIContainerID);
    
    this.viewDiv = document.createElement('div');
    this.headerDiv = document.createElement('div');
    this.labelDiv = document.createElement('div');
    this.midiTargetToggleDiv = document.createElement('div');
    this.touchableDiv = document.createElement('div');
    var dataDiv = document.createElement('div');
    this.valueDiv = document.createElement('div');
    this.unitDiv = document.createElement('div');
    var barDiv = document.createElement('div');
    this.handleDiv = document.createElement('div');
    
    this.viewDiv.className = "slider-view";
    this.headerDiv.className = "slider-header";
    this.midiTargetToggleDiv.className = "slider-midi-target-toggle";
    this.labelDiv.className = "slider-label";
    this.touchableDiv.className = "slider-touchable";
    dataDiv.className = "slider-data";
    this.valueDiv.className = "slider-value";
    this.unitDiv.className = "slider-unit";
    barDiv.className = "slider-bar";
    this.handleDiv.className = "slider-handle";
    
    this.headerDiv.appendChild(this.labelDiv);
    this.headerDiv.appendChild(this.midiTargetToggleDiv);
    this.touchableDiv.appendChild(dataDiv);
    this.touchableDiv.appendChild(barDiv);
    dataDiv.appendChild(this.valueDiv);
    dataDiv.appendChild(this.unitDiv);
    barDiv.appendChild(this.handleDiv);
    this.viewDiv.appendChild(this.headerDiv);
    this.viewDiv.appendChild(this.touchableDiv);
    this.container.appendChild(this.viewDiv);
    
    this.pos = 0;
    this.width = 0;
    this.px = 0;
    this.py = 0;
    this.left = this.touchableDiv.getBoundingClientRect().left;
    this.top = this.touchableDiv.getBoundingClientRect().top;
    this.midiTargetToggle = false;
    
    this.setName = function (name) {
        this.labelDiv.textContent = name;
    }
    this.setUnit = function (unit) {
        this.unitDiv.textContent = unit;
    }
    this.setValue = function (value) {
        this.valueDiv.textContent = value;
    }
    this.setSliderPosition = function (normValue) {
        this.pos = normValue * (150 - 6) + 6;
        this.pos = Math.max(Math.min(this.pos, 150 - 6), 0);
        this.handleDiv.style.width = this.pos + "px";
    }
    this.update = function () {
        this.pos = Math.max(Math.min(this.pos, 150 - 6), 0);
        this.handleDiv.style.width = this.pos + "px";
        this.normValue = (this.pos) / (150 - 6);
        this.onchange(this.normValue);
    }
    
    this.initialize = function () {
        this.touchableDiv.onmousedown = function (e) {
            this.px = e.clientX - this.left;
            this.py = e.clientY - this.top;
            window.addEventListener("mousemove", this.dragged, false);
            window.addEventListener("mouseup", this.released, false);
        }.bind(this);
        this.midiTargetToggleDiv.onmousedown = function (e) {
            this.midiTargetToggle = !this.midiTargetToggle;
            if (this.midiTargetToggle) {
                this.midiTargetToggleDiv.className = "slider-midi-target-toggle-highlight";
            } else {
                this.midiTargetToggleDiv.className = "slider-midi-target-toggle";
            }
        }.bind(this);
    }
    
    this.dragged = function (e) {
        var x = e.clientX - this.left;
        var y = e.clientY - this.top;
        var dx = x - this.px;
        var dy = y - this.py;
        // TODO: check vector...
        if (e.shiftKey) {
            this.pos += (dx - dy) * 0.25;
        } else {
            this.pos += dx - dy;
        }
        this.update();
        this.px = x;
        this.py = y;
    }.bind(this);
    
    this.released = function () {
        window.removeEventListener("mousemove", this.dragged, false);   
        window.removeEventListener("mouseup", this.released, false);   
    }.bind(this);
    
    this.initialize();
}

/*
var ctx = new webkitAudioContext();
var osc = ctx.createOscillator();
var g = ctx.createGain();

osc.start(0);
osc.stop(0);
osc.connect(g);
g.connect(ctx.destination);

var freqSlider = new SliderView("container");
var freqControl = new Control(freqSlider, "Frequency", "Hz", 440, 20, 22050, true);

var gainSlider = new SliderView("container");
var gainControl = new Control(gainSlider, "Gain", "-", 0.05, 0.0, 1.0);

var filterSlider = new SliderView("container");
var filterControl = new Control(filterSlider, "Filter Gain", "dB", 0.0, -24, 24);


freqControl.onchange = function (value) {
    osc.frequency.setTargetAtTime(value, ctx.currentTime, 0.02);
}

gainControl.onchange = function (value) {
    g.gain.setTargetAtTime(value, ctx.currentTime, 0.02);
}

var dd = document.getElementById('dropdown');
dd.onchange = function (e) {    
    switch (e.target.value) {
        case "1":
            freqControl.setValue(220.0);
            gainControl.setValue(0.5);
            filterControl.setValue(-3.0);
            break;
        case "2":
            freqControl.setValue(880.0);
            gainControl.setValue(0.1);
            filterControl.setValue(-18.0);
            break;
    }
}
*/