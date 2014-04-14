/**
 * WAAX Core
 * @revision r13 dev
 */
/**
 * @namespace WX
 */
window.WX = {};

(function(WX) {
    "use strict";
    /**
   * @module log
   */
    WX.log = function() {
        var _prefix = "[wx] ", _prefix_info = "[wx:info] ", _prefix_warn = "[wx:warn] ", _prefix_err = "[wx:err] ";
        var _verbose = false;
        function _compose(prefix, msg, ref) {
            var message = prefix + msg;
            if (ref && ref.label) {
                message += " (" + ref.label + ")";
            }
            return message;
        }
        return {
            verbose: function(bool) {
                if (typeof bool === "boolean") {
                    _verbose = bool;
                }
            },
            post: function(msg) {
                console.log(_compose(_prefix, msg));
            },
            info: function(msg, ref) {
                if (_verbose) {
                    console.log(_compose(_prefix_info, msg, ref));
                }
            },
            warn: function(msg, ref) {
                if (_verbose) {
                    console.log(_compose(_prefix_warn, msg, ref));
                }
            },
            error: function(msg, ref) {
                throw new Error(_compose(_prefix_err, msg, ref));
            }
        };
    }();
    /**
   * API support checking and monkey patching
   * @note WAAX only supports: Chrome and Safari
   * TODO: this needs to be more comprehensive. collaborate with Chris Wilson.
   */
    var _kApiAvailable = false;
    var _kLegacySupport = false;
    if (!window.hasOwnProperty("webkitAudioContext") && !window.hasOwnProperty("AudioContext")) {
        WX.log.error("AudioContext seems to be missing. Bye.");
        return null;
    } else {
        _kApiAvailable = true;
        WX.log.info("Web Audio API supported.");
        if (window.hasOwnProperty("webkitAudioContext")) {
            window.AudioContext = window.webkitAudioContext;
        }
        // and implements legacy support for safari
        if (!AudioContext.prototype.hasOwnProperty("createGain")) {
            _kLegacySupport = true;
            WX.log.info("adding legacy support on audio context...");
        }
    }
    /**
   * internal
   */
    // audio context
    var _ctx = new AudioContext();
    // unit stack for patch building
    // var _unitStack = [];
    // ignore function (to avoid prototype propagation)
    var _ignore = function() {
        return;
    };
    /**
   * system variables and utilities
   */
    Object.defineProperties(WX, {
        // system flags and constant
        System: {
            value: {
                REVISION: "r13dev",
                API_AVAILABLE: _kApiAvailable,
                LEGACY_SUPPORT: _kLegacySupport
            }
        },
        // audio context
        context: {
            value: _ctx
        },
        // now (getter)
        now: {
            get: function() {
                return _ctx.currentTime;
            },
            set: _ignore
        },
        // sample rate
        sampleRate: {
            get: function() {
                return _ctx.sampleRate;
            },
            set: _ignore
        }
    });
    /**
   * unit-related utilities, math utilities
   */
    Object.defineProperties(WX, {
        // EXPERIMENTAL (DO NOT USE IN PROD)
        // : creates a patch from a collection of WX units
        // patch_exp: {
        //   set: function (value) {
        //     if (isNaN(value) || value > 0) {
        //       WX.log.warn('not a valid patch.');
        //       _unitStack.length = 0;
        //       return false;
        //     }
        //     if (_unitStack.length < 2) {
        //       WX.log.warn('not enough units to connect.');
        //       _unitStack.length = 0;
        //       return false;
        //     } else {
        //       WX.log.info('building audio graph...');
        //       for (var i = 0; i < _unitStack.length - 1; i++) {
        //         if (_unitStack[i].outlet && _unitStack[i + 1].inlet) {
        //           console.log('  ' + _unitStack[i].params.pLabel + ' >> '+
        //             _unitStack[i+1].params.pLabel);
        //           _unitStack[i].outlet.connect(_unitStack[i+1].inlet);
        //         } else {
        //           WX.log.warn('invalid unit found.');
        //           _unitStack.length = 0;
        //           return false;
        //         }
        //       }
        //       _unitStack.length = 0;
        //       return true;
        //     }
        //   },
        //   get: _ignore
        // },
        patch: {
            value: function() {
                for (var i = 0; i < arguments.length - 1; i++) {
                    arguments[i].outlet.connect(arguments[i + 1].inlet);
                }
            }
        },
        // $: setAudioParam function (internal)
        $: {
            value: function(audioParam, value, transType, time1, time2) {
                // if no trans type, change param immediately
                if (typeof transType === "undefined") {
                    audioParam.setValueAtTime(value, 0);
                    audioParam.value = value;
                    return;
                }
                // branch on transition type
                switch (transType) {
                  case 0:
                  case "step":
                    audioParam.setValueAtTime(value, time1);
                    break;

                  case 1:
                  case "line":
                    audioParam.linearRampToValueAtTime(value, time1);
                    break;

                  case 2:
                  case "expo":
                    audioParam.exponentialRampToValueAtTime(value, time1);
                    break;

                  case 3:
                  case "target":
                    audioParam.setTargetAtTime(value, time1, time2);
                    break;
                }
            }
        },
        // extend source target object with source props (for prototype, preset)
        extend: {
            value: function(target, source) {
                for (var prop in source) {
                    target[prop] = source[prop];
                }
            }
        },
        // returns a duplicated object (for preset)
        clone: {
            value: function(source) {
                var obj = {};
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
                return obj;
            }
        },
        // returns a float random number between (min, max)
        random2f: {
            value: function(min, max) {
                return min + Math.random() * (max - min);
            }
        },
        // returns an integer random number between (min, max)
        random2: {
            value: function(min, max) {
                return Math.round(min + Math.random() * (max - min));
            }
        },
        // clamp
        clamp: {
            value: function(value, min, max) {
                return Math.min(Math.max(value, min), max);
            }
        },
        // converts a MIDI pitch to frequency(Hz)
        pitch2freq: {
            value: function(pitch) {
                return 440 * Math.pow(2, (Math.floor(pitch) - 69) / 12);
            }
        },
        // converts frequency to a MIDI pitch
        freq2pitch: {
            value: function(freq) {
                // Math.log(2) = 0.6931471805599453
                return Math.floor(69 + 12 * Math.log(freq / 440) / .6931471805599453);
            }
        },
        // converts linear amplitude to decibel
        lin2db: {
            value: function(amp) {
                // if below -100dB, set to -100dB to prevent taking log of zero
                // Math.LN10 = 2.302585092994046
                return 20 * (amp > 1e-5 ? Math.log(amp) / 2.302585092994046 : -5);
            }
        },
        // converts decibel to linear amplitude
        db2lin: {
            value: function(db) {
                return Math.pow(10, db / 20);
            }
        }
    });
    /**
   * WAAX node creation shorthand
   * TODO: this should be the monkey patch
   */
    WX.nGain = function() {
        return _ctx.createGain();
    };
    WX.nDelay = function() {
        return _ctx.createDelay();
    };
    WX.nFilter = function() {
        return _ctx.createBiquadFilter();
    };
    WX.nComp = function() {
        return _ctx.createDynamicsCompressor();
    };
    WX.nConvolver = function() {
        return _ctx.createConvolver();
    };
    WX.nWaveShaper = function() {
        return _ctx.createWaveShaper();
    };
    WX.nSource = function() {
        return _ctx.createBufferSource();
    };
    WX.nOSC = function() {
        return _ctx.createOscillator();
    };
    WX.nAnalyzer = function() {
        return _ctx.createAnalyser();
    };
    WX.nPanner = function() {
        return _ctx.createPanner();
    };
    WX.nSplitter = function(numChannel) {
        return _ctx.createChannelSplitter(numChannel);
    };
    WX.nMerger = function(numChannel) {
        return _ctx.createChannelMerger(numChannel);
    };
    WX.nPeriodicWave = function() {
        return _ctx.createPeriodicWave();
    };
    WX.nBuffer = function(nChannel, length, sampleRate) {
        return _ctx.createBuffer(nChannel, length, sampleRate);
    };
    /**
   * ENUMs
   */
    WX.OscilType = {
        sine: 0,
        square: 1,
        sawtooth: 2,
        triangle: 3,
        custom: 4
    };
    /**
   * Unit Mixins, assembling routine
   *
   *         inlet
   *           |
   *      +----+----+
   *    nInput      |
   *      |         |
   *   UnitBody     |
   *      |         |
   *   nOutput      |
   *      |         |
   *   nActive   nBypass
   *      +----+----+
   *           |
   *         outlet
   *
   * 1) base mixin
   *   - params: pActive, pLabel
   *   - nodes: nActive
   *   - methods: get, set, getParams, setParams
   *   - handlers: _Active
   * 2) input mixin
   *   - params: pInputGain
   *   - nodes: inlet >> nInput, nBypass
   *   - handlers: _InputGain
   * 3) output mixin
   *   - params: pGain
   *   - nodes: nOutput >> nActive >> outlet, inlet >> (nBypass) >> outlet
   *   - methods: to, connect, control
   *   - handlers: _Gain
   *
   */
    /**
   * WX.UnitBase
   */
    WX.UnitBase = function() {
        this.params = {
            pLabel: "Unit",
            pActive: true
        };
        this._nActive = WX.nGain();
    };
    WX.UnitBase.prototype = {
        // core method of r12, r13
        // : update params.paramName and call the corresponding handler
        set: function(paramName, value, transType, time1, time2) {
            if (this.params.hasOwnProperty(paramName)) {
                this.params[paramName] = value;
                var handler = "_" + paramName.slice(1);
                if (typeof this[handler] === "function") {
                    this[handler](transType, time1, time2);
                } else {}
            }
            return this;
        },
        get: function(paramName) {
            if (this.params.hasOwnProperty(paramName)) {
                return this.params[paramName];
            } else {
                return null;
            }
        },
        setParams: function(params) {
            for (var param in params) {
                this.set(param, params[param]);
            }
            return this;
        },
        getParams: function() {
            return WX.clone(this.params);
        },
        // handler
        _Active: function() {
            this._nActive.gain.value = this.params.pActive ? 1 : 0;
            if (this._nBypass) {
                this._nBypass.gain.value = this.params.pActive ? 0 : 1;
            }
        }
    };
    /**
   * WX.UnitInput
   */
    WX.UnitInput = function() {
        this.params.pInputGain = 1;
        this.inlet = WX.nGain();
        this._nInput = WX.nGain();
        this._nBypass = WX.nGain();
        this.inlet.connect(this._nInput);
        this.inlet.connect(this._nBypass);
    };
    WX.UnitInput.prototype = {
        _InputGain: function(transType, time1, time2) {
            WX.$(this._nInput.gain, this.params.pInputGain, transType, time1, time2);
        }
    };
    /**
   * WX.UnitOutput
   */
    WX.UnitOutput = function() {
        this.params.pGain = 1;
        this._nOutput = WX.nGain();
        this._nActive = WX.nGain();
        this.outlet = WX.nGain();
        this._nOutput.connect(this._nActive);
        this._nActive.connect(this.outlet);
        if (this._nBypass) {
            this._nBypass.connect(this.outlet);
        }
    };
    WX.UnitOutput.prototype = {
        to: function(unit) {
            if (unit.inlet) {
                this.outlet.connect(unit.inlet);
                return unit;
            } else {
                WX.log.error("invalid unit.");
            }
        },
        connect: function(node) {
            this.outlet.connect(node);
        },
        control: function(unit, paramName) {
            if (unit._modulationTargets.hasOwnProperty(paramName)) {
                var targets = unit._modulationTargets[paramName];
                for (var i = 0; i < targets.length; i++) {
                    this.outlet.connect(targets[i]);
                }
            } else {
                return null;
            }
        },
        _Gain: function(transType, time1, time2) {
            WX.$(this._nOutput.gain, this.params.pGain, transType, time1, time2);
        }
    };
    /**
   * @class buffermap
   */
    function _BufferMap(bufferData, oncomplete, onprogress, verbose) {
        var _buffers = {};
        var _oncomplete = function(name, iteration) {
            WX.log.info("loading completed.");
            if (oncomplete) {
                oncomplete();
            }
        };
        var _onprogress = onprogress || function(event, name, iteration) {
            var pct = ~~(event.loaded / event.total * 100) + "%";
            WX.log.info("loading(" + iteration + "): " + name + "... " + pct);
            if (onprogress) {
                onprogress();
            }
        };
        // serialize for xhr: object -> array
        var _data = [];
        var names = Object.keys(bufferData);
        for (var i = 0; i < names.length; i++) {
            _data[i] = [ names[i], bufferData[names[i]] ];
        }
        // recurse XHR loader
        function _recurseXHR(data, iteration) {
            var entry = data.shift();
            var name = entry[0], url = entry[1];
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onprogress = function(event) {
                _onprogress(event, name, iteration);
            };
            xhr.onload = function() {
                try {
                    var b = WX.context.createBuffer(xhr.response, false);
                    iteration++;
                    _addBuffer(name, b);
                    if (data.length === 0) {
                        _oncomplete("done");
                        return;
                    } else {
                        _recurseXHR(data, iteration);
                    }
                } catch (error) {
                    WX.log.error("XHR failed (" + error.message + "): " + url);
                }
            };
            xhr.send();
        }
        // adding buffer with stereo conversion
        function _addBuffer(name, buffer) {
            // when buffer is mono, make it duplicated stereo
            if (buffer.numberOfChannels === 1) {
                var newBuffer = WX.context.createBuffer(2, buffer.length, WX.sampleRate);
                var channel = buffer.getChannelData(0);
                newBuffer.getChannelData(0).set(new Float32Array(channel));
                newBuffer.getChannelData(1).set(new Float32Array(channel));
                _buffers[name] = newBuffer;
            } else {
                _buffers[name] = buffer;
            }
        }
        return {
            addBuffer: _addBuffer,
            getBufferByName: function(name) {
                if (_buffers.hasOwnProperty(name)) {
                    return _buffers[name];
                } else {
                    return null;
                }
            },
            getBufferByIndex: function(index) {
                var key = Object.keys(_buffers)[index];
                if (typeof key === undefined) {
                    return null;
                } else {
                    return _buffers[key];
                }
            },
            getBufferNames: function() {
                return Object.keys(_buffers);
            },
            /**
       *  Begin loading the buffers.
       **/
            load: function() {
                // start recursion
                _recurseXHR(_data, 0);
            }
        };
    }
    WX.BufferMap = function(bufferMapData, oncomplete, onprogress) {
        return _BufferMap(bufferMapData, oncomplete, onprogress);
    };
    // start loading other units... go!
    WX.log.post("WAAX core loaded. (" + WX.System.REVISION + ")");
})(window.WX);

(function(WX) {
    function ADSR(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nInput.connect(this._nOutput);
        // time constant for -60dB
        this._TimeConstant();
        this.set("pInputGain", 0);
        this._sustainOnset = 0;
        this.setParams(this.params);
    }
    ADSR.prototype = {
        defaultParams: {
            pLabel: "ADSR",
            pAttack: .005,
            pDecay: .015,
            pSustain: .75,
            pRelease: .05,
            pTimeConstant: .01,
            pMode: "polyphonic"
        },
        _TimeConstant: function() {
            this._tau = -Math.log(this.params.pTimeConstant);
        },
        setADSR: function(attack, decay, sustain, release) {
            this.setParams({
                pAttack: attack,
                pDecay: decay,
                pSustain: sustain,
                pRelease: release
            });
        },
        /**
     * logic:
     * polyphonic mode doesn't care previous note
     * monophonic mode should glide up from current gain value
     */
        noteOn: function(time) {
            var g = this._nInput.gain, p = this.params;
            time = time || WX.now;
            this._sustainOnset = time + p.pAttack + p.pDecay;
            if (this.params.pMode === "monophonic") {
                // NOTE: this only works in realtime.
                g.cancelScheduledValues(time);
                g.setValueAtTime(g.value, time);
                g.linearRampToValueAtTime(1, time + p.pAttack);
            } else {
                g.setValueAtTime(0, time);
                g.linearRampToValueAtTime(1, time + p.pAttack);
            }
            g.exponentialRampToValueAtTime(p.pSustain, this._sustainOnset);
        },
        noteOff: function(time) {
            var g = this._nInput.gain, p = this.params;
            time = time || WX.now;
            var release = time > this._sustainOnset ? time : this._sustainOnset;
            g.cancelScheduledValues(release);
            g.setTargetAtTime(1e-4, release, p.pRelease / this._tau);
        }
    };
    WX.extend(ADSR.prototype, WX.UnitBase.prototype);
    WX.extend(ADSR.prototype, WX.UnitInput.prototype);
    WX.extend(ADSR.prototype, WX.UnitOutput.prototype);
    WX.ADSR = function(params) {
        return new ADSR(params);
    };
})(WX);

(function(WX) {
    function Chorus(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        // main
        this._nDry = WX.nGain();
        this._nWet = WX.nGain();
        var _nSplitter = WX.nSplitter(2);
        var _nMerger = WX.nMerger(2);
        // left stream
        this._nLStream = WX.nGain();
        this._nLDelayV = WX.nDelay();
        this._nLDelayF = WX.nDelay();
        this._nLFeedback = WX.nGain();
        this._nLFeedforward = WX.nGain();
        this._nLBlend = WX.nGain();
        // right stream
        this._nRStream = WX.nGain();
        this._nRDelayV = WX.nDelay();
        this._nRDelayF = WX.nDelay();
        this._nRFeedback = WX.nGain();
        this._nRFeedforward = WX.nGain();
        this._nRBlend = WX.nGain();
        // input
        this._nInput.connect(_nSplitter);
        this._nInput.connect(this._nDry);
        // left connection
        _nSplitter.connect(this._nLStream, 0, 0);
        this._nLStream.connect(this._nLDelayF);
        this._nLStream.connect(this._nLDelayV);
        this._nLDelayF.connect(this._nLFeedback);
        this._nLFeedback.connect(this._nLStream);
        this._nLDelayV.connect(this._nLFeedforward);
        this._nLDelayV.connect(_nMerger, 0, 0);
        this._nLBlend.connect(_nMerger, 0, 0);
        // right connection
        _nSplitter.connect(this._nRStream, 1, 0);
        this._nRStream.connect(this._nRDelayF);
        this._nRStream.connect(this._nRDelayV);
        this._nRDelayF.connect(this._nRFeedback);
        this._nRFeedback.connect(this._nRStream);
        this._nRDelayV.connect(this._nRFeedforward);
        this._nRDelayV.connect(_nMerger, 0, 1);
        this._nRBlend.connect(_nMerger, 0, 1);
        // output
        _nMerger.connect(this._nWet);
        this._nDry.connect(this._nOutput);
        this._nWet.connect(this._nOutput);
        // modulation
        this._nLFO = WX.nOSC();
        this._nLDepth = WX.nGain();
        this._nRDepth = WX.nGain();
        this._nLFO.start(0);
        this._nLFO.connect(this._nLDepth);
        this._nLFO.connect(this._nRDepth);
        this._nLDepth.connect(this._nLDelayV.delayTime);
        this._nRDepth.connect(this._nRDelayV.delayTime);
        // initial settings
        this._nLFO.type = "sine";
        this._nLFO.frequency.value = .18;
        this._nLDepth.gain.value = .01;
        this._nRDepth.gain.value = -.011;
        this._nLDelayV.delayTime.value = .017;
        this._nLDelayF.delayTime.value = .011;
        this._nRDelayV.delayTime.value = .013;
        this._nRDelayF.delayTime.value = .019;
        this._nLFeedforward.gain.value = .70701;
        this._nRFeedforward.gain.value = .70701;
        this.setParams(this.params);
    }
    Chorus.prototype = {
        defaultParams: {
            pLabel: "Chorus",
            pRate: .1,
            pDepth: 1,
            pIntensity: .1,
            pBlend: 1,
            pMix: .6
        },
        _Rate: function(transType, time1, time2) {
            var value = (WX.clamp(this.params.pRate, 0, 1) * 29 + 1) * .01;
            WX.$(this._nLFO.frequency, value, transType, time1, time2);
        },
        _Depth: function(transType, time1, time2) {
            var value = this.params.pDepth * .05;
            WX.$(this._nLDepth.gain, value, transType, time1, time2);
            WX.$(this._nRDepth.gain, -value, transType, time1, time2);
        },
        _Intensity: function(transType, time1, time2) {
            var value = -this.params.pIntensity;
            WX.$(this._nLFeedback.gain, value, transType, time1, time2);
            WX.$(this._nRFeedback.gain, value, transType, time1, time2);
        },
        _Blend: function(transType, time1, time2) {
            WX.$(this._nLBlend.gain, this.params.pBlend, transType, time1, time2);
            WX.$(this._nRBlend.gain, this.params.pBlend, transType, time1, time2);
        },
        _Mix: function(transType, time1, time2) {
            WX.$(this._nDry.gain, 1 - this.params.pMix, transType, time1, time2);
            WX.$(this._nWet.gain, this.params.pMix, transType, time1, time2);
        }
    };
    WX.extend(Chorus.prototype, WX.UnitBase.prototype);
    WX.extend(Chorus.prototype, WX.UnitInput.prototype);
    WX.extend(Chorus.prototype, WX.UnitOutput.prototype);
    WX.Chorus = function(params) {
        return new Chorus(params);
    };
})(WX);

(function(WX) {
    /**
   * WX.Comp
   */
    function Comp(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nComp = WX.nComp();
        this._nInput.connect(this._nComp);
        this._nComp.connect(this._nOutput);
        this.setParams(this.params);
    }
    Comp.prototype = {
        defaultParams: {
            pLabel: "Comp",
            pThreshold: -8,
            pKnee: 0,
            pRatio: 2,
            pAttack: .01,
            pRelease: .25,
            pGain: 1
        },
        _Threshold: function(transType, time1, time2) {
            WX.$(this._nComp.threshold, this.params.pThreshold, transType, time1, time2);
        },
        _Knee: function(transType, time1, time2) {
            WX.$(this._nComp.knee, this.params.pKnee, transType, time1, time2);
        },
        _Ratio: function(transType, time1, time2) {
            WX.$(this._nComp.ratio, this.params.pRatio, transType, time1, time2);
        },
        _Attack: function(transType, time1, time2) {
            WX.$(this._nComp.attack, this.params.pAttack, transType, time1, time2);
        },
        _Release: function(transType, time1, time2) {
            WX.$(this._nComp.release, this.params.pRelease, transType, time1, time2);
        }
    };
    WX.extend(Comp.prototype, WX.UnitBase.prototype);
    WX.extend(Comp.prototype, WX.UnitInput.prototype);
    WX.extend(Comp.prototype, WX.UnitOutput.prototype);
    WX.Comp = function(params) {
        return new Comp(params);
    };
})(WX);

(function(WX) {
    /**
   * WX.Converb
   */
    function Converb(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nDry = WX.nGain();
        this._nWet = WX.nGain();
        this._nConvolver = WX.nConvolver();
        this._nInput.connect(this._nDry);
        this._nInput.connect(this._nConvolver);
        this._nConvolver.connect(this._nWet);
        this._nDry.connect(this._nOutput);
        this._nWet.connect(this._nOutput);
        this.setParams(this.params);
    }
    Converb.prototype = {
        defaultParams: {
            pLabel: "Converb",
            pMix: .2
        },
        _Mix: function(transType, time1, time2) {
            WX.$(this._nDry.gain, 1 - this.params.pMix, transType, time1, time2);
            WX.$(this._nWet.gain, this.params.pMix, transType, time1, time2);
        },
        setImpulseResponse: function(ir) {
            this._nConvolver.buffer = ir;
        }
    };
    WX.extend(Converb.prototype, WX.UnitBase.prototype);
    WX.extend(Converb.prototype, WX.UnitInput.prototype);
    WX.extend(Converb.prototype, WX.UnitOutput.prototype);
    WX.Converb = function(params) {
        return new Converb(params);
    };
})(WX);

(function(WX) {
    /**
   * WX.FMop
   */
    function FMop(params) {
        WX.UnitBase.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nMod = WX.nOSC();
        this._nModGain = WX.nGain();
        this._nCar = WX.nOSC();
        this._nMod.connect(this._nModGain);
        this._nModGain.connect(this._nCar.frequency);
        this._nCar.connect(this._nOutput);
        this.setParams(this.params);
        if (!this.params.pDynamic) {
            this.start();
        }
    }
    FMop.prototype = {
        defaultParams: {
            pLable: "FMop",
            pFreq: 440,
            pHarmonicRatio: 4,
            pModulationIndex: .1,
            pDynamic: false
        },
        _Freq: function(transType, time1, time2) {
            WX.$(this._nCar.frequency, this.params.pFreq, transType, time1, time2);
        },
        _HarmonicRatio: function(transType, time1, time2) {
            WX.$(this._nMod.frequency, this.params.pFreq * this.params.pHarmonicRatio, transType, time1, time2);
        },
        _ModulationIndex: function(transType, time1, time2) {
            WX.$(this._nModGain.gain, this.params.pFreq * this.params.pHarmonicRatio * this.params.pModulationIndex, transType, time1, time2);
        },
        start: function(time) {
            if (this.params.pDynamic) {
                this._nMod = WX.nOSC();
                this._nModGain = WX.nGain();
                this._nCar = WX.nOSC();
                this._nMod.connect(this._nModGain);
                this._nModGain.connect(this._nCar.frequency);
                this._nCar.connect(this._nOutput);
            }
            this._nMod.start(time || WX.now);
            this._nCar.start(time || WX.now);
        },
        stop: function(time) {
            this._nMod.stop(time || WX.now);
            this._nCar.stop(time || WX.now);
        }
    };
    WX.extend(FMop.prototype, WX.UnitBase.prototype);
    WX.extend(FMop.prototype, WX.UnitOutput.prototype);
    WX.FMop = function(params) {
        return new FMop(params);
    };
})(WX);

(function(WX) {
    function Fader(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nInput.connect(this._nOutput);
        this._modulationTargets = {
            pGain: [ this._nOutput.gain ]
        };
        this.setParams(this.params);
    }
    Fader.prototype = {
        defaultParams: {
            pLabel: "Fader",
            pMute: false,
            pdB: 0
        },
        _Mute: function() {
            WX.$(this._nInput.gain, this.params.pMute ? 0 : 1);
        },
        // overide default _Gain helper
        _Gain: function(transType, time1, time2) {
            this.params.pdB = WX.lin2db(this.params.pGain);
            WX.$(this._nOutput.gain, this.params.pGain, transType, time1, time2);
        },
        _dB: function(transType, time1, time2) {
            this.params.pGain = WX.db2lin(this.params.pdB);
            WX.$(this._nOutput.gain, this.params.pGain, transType, time1, time2);
        }
    };
    WX.extend(Fader.prototype, WX.UnitBase.prototype);
    WX.extend(Fader.prototype, WX.UnitInput.prototype);
    WX.extend(Fader.prototype, WX.UnitOutput.prototype);
    WX.Fader = function(params) {
        return new Fader(params);
    };
    // hardcoded master channel
    WX.DAC = WX.Fader({
        pLabel: "DAC"
    });
    WX.DAC.connect(WX.context.destination);
})(WX);

(function(WX) {
    // pre-defined pitch sets: ionian, lydian, aeolian, mixolydian
    // TODO: this is not ideal. this should be managed in the app level.
    var _chords = {
        ionian: [ 0, 7, 14, 21, 28, 35, 43, 48 ],
        lydian: [ 0, 6, 16, 21, 26, 35, 42, 48 ],
        aeolian: [ 0, 7, 15, 22, 26, 34, 39, 48 ],
        mixolydian: [ 0, 5, 16, 23, 26, 33, 41, 48 ]
    };
    // number of filters
    var _numFilters = 8;
    /**
   * WX.FilterBank
   */
    function FilterBank(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nFilters1 = [];
        this._nFilters2 = [];
        this._nGains = [];
        this._nSumming = WX.nGain();
        for (var i = 0; i < _numFilters; ++i) {
            this._nFilters1[i] = WX.nFilter();
            this._nFilters2[i] = WX.nFilter();
            this._nGains[i] = WX.nGain();
            this._nFilters1[i].type = "bandpass";
            this._nFilters2[i].type = "bandpass";
            this._nInput.connect(this._nFilters1[i]);
            this._nFilters1[i].connect(this._nFilters2[i]);
            this._nFilters2[i].connect(this._nGains[i]);
            this._nGains[i].connect(this._nSumming);
        }
        this._nSumming.connect(this._nOutput);
        this._nSumming.gain.value = 50;
        this.setParams(this.params);
    }
    FilterBank.prototype = {
        defaultParams: {
            pLabel: "FilterBank",
            pPitch: 41,
            pChord: "lydian",
            pSlope: .26,
            pWidth: .49,
            pDetune: 0
        },
        // helper
        _setFilterFrequency: function(transType, time1, time2) {
            var fund = WX.pitch2freq(this.params.pPitch);
            var chord = _chords[this.params.pChord];
            for (var i = 0; i < _numFilters; ++i) {
                var freq = fund * Math.pow(2, chord[i] / 12);
                WX.$(this._nFilters1[i].frequency, freq, transType, time1, time2);
                WX.$(this._nFilters2[i].frequency, freq, transType, time1, time2);
            }
        },
        // handler
        _Pitch: function(transType, time1, time2) {
            this._setFilterFrequency(transType, time1, time2);
        },
        _Chord: function(transType, time1, time2) {
            this._setFilterFrequency(transType, time1, time2);
        },
        _Slope: function(transType, time1, time2) {
            this.params.pSlope = WX.clamp(this.params.pSlope, .1, .75);
            for (var i = 0; i < _numFilters; ++i) {
                // balancing formula (lowpass, highpass, or concave)
                var gain = 1 + Math.sin(Math.PI + Math.PI / 2 * (this.params.pSlope + i / _numFilters));
                WX.$(this._nGains[i].gain, gain, transType, time1, time2);
            }
        },
        _Width: function(transType, time1, time2) {
            for (var i = 0; i < _numFilters; ++i) {
                // inverse cubed curve for width
                var q = 2 + 90 * Math.pow(1 - i / _numFilters, this.params.pWidth);
                WX.$(this._nFilters1[i].Q, q, transType, time1, time2);
                WX.$(this._nFilters2[i].Q, q, transType, time1, time2);
            }
        },
        _Detune: function(transType, time1, time2) {
            for (var i = 0; i < _numFilters; ++i) {
                WX.$(this._nFilters1[i].detune, this.params.pDetune, transType, time1, time2);
                WX.$(this._nFilters2[i].detune, -this.params.pDetune, transType, time1, time2);
            }
        }
    };
    WX.extend(FilterBank.prototype, WX.UnitBase.prototype);
    WX.extend(FilterBank.prototype, WX.UnitInput.prototype);
    WX.extend(FilterBank.prototype, WX.UnitOutput.prototype);
    WX.FilterBank = function(params) {
        return new FilterBank(params);
    };
})(WX);

(function(WX) {
    /**
   * class-specific static variables
   */
    // alto formant preset: Synthesis of the Singing Voice, pp.36
    var _formants = {
        a: {
            freq: [ 800, 1150, 2800, 3500, 4950 ],
            bw: [ 80, 90, 120, 130, 140 ],
            amp: [ 1, .6309573444801932, .1, .015848931924611134, .001 ]
        },
        e: {
            freq: [ 400, 1600, 2700, 3300, 4950 ],
            bw: [ 60, 80, 120, 150, 200 ],
            amp: [ 1, .06309573444801933, .03162277660168379, .01778279410038923, .001 ]
        },
        i: {
            freq: [ 350, 1700, 2700, 3700, 4950 ],
            bw: [ 50, 100, 120, 150, 200 ],
            amp: [ 1, .1, .03162277660168379, .015848931924611134, .001 ]
        },
        o: {
            freq: [ 450, 800, 2830, 3500, 4950 ],
            bw: [ 70, 80, 100, 130, 135 ],
            amp: [ 1, .35481338923357547, .15848931924611134, .039810717055349734, .0017782794100389228 ]
        },
        u: {
            freq: [ 325, 700, 2530, 3500, 4950 ],
            bw: [ 50, 60, 170, 180, 200 ],
            amp: [ 1, .251188643150958, .03162277660168379, .01, .000630957344480193 ]
        }
    };
    // points on unit circle
    var _points = [ [ 0, 1 ], [ -.9510565162951535, .3090169943749475 ], [ -.5877852522924732, -.8090169943749473 ], [ .5877852522924729, -.8090169943749476 ], [ .9510565162951536, .3090169943749472 ] ];
    /**
   * WX.FormantV
   */
    function FormantV(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nFilters = [];
        this._nGains = [];
        for (var i = 0; i < 5; ++i) {
            this._nFilters[i] = WX.nFilter();
            this._nGains[i] = WX.nGain();
            this._nFilters[i].type = "bandpass";
            this._nInput.connect(this._nFilters[i]);
            this._nFilters[i].connect(this._nGains[i]);
            this._nGains[i].connect(this._nOutput);
        }
        this._tFreq = [];
        this._tQ = [];
        this._tAmp = [];
        this.setParams(this.params);
    }
    FormantV.prototype = {
        defaultParams: {
            pPositionX: 0,
            pPositionY: .1
        },
        _calculateFormant: function(x, y) {
            var w = [];
            var norm = 0;
            for (var i = 0; i < 5; i++) {
                var dx = x - _points[i][0], dy = y - _points[i][1];
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d === 0) {
                    d = 1e-4;
                } else {
                    w[i] = 1 / d;
                    norm += w[i];
                }
            }
            norm = 1 / norm;
            //interpolateFormants(weight, norm, formant);
            for (var j = 0; j < 5; j++) {
                this._tFreq[j] = w[0] * _formants.a.freq[j] + w[1] * _formants.e.freq[j] + w[2] * _formants.i.freq[j] + w[3] * _formants.o.freq[j] + w[4] * _formants.u.freq[j];
                this._tFreq[j] *= norm;
                this._tQ[j] = w[0] * _formants.a.freq[j] / _formants.a.bw[j] + w[1] * _formants.e.freq[j] / _formants.e.bw[j] + w[2] * _formants.i.freq[j] / _formants.i.bw[j] + w[3] * _formants.o.freq[j] / _formants.o.bw[j] + w[4] * _formants.u.freq[j] / _formants.u.bw[j];
                this._tQ[j] *= norm;
                this._tAmp[j] = w[0] * _formants.a.amp[j] + w[1] * _formants.e.amp[j] + w[2] * _formants.i.amp[j] + w[3] * _formants.o.amp[j] + w[4] * _formants.u.amp[j];
                this._tAmp[j] *= norm;
            }
        },
        _PositionX: function() {},
        _PositionY: function() {},
        setPosition: function(x, y, transType, time1, time2) {
            // this._PositionX(x, transType, time1, time2);
            // this._PositionY(y, transType, time1, time2);
            this._calculateFormant(x, y);
            for (var i = 0; i < 5; i++) {
                WX.$(this._nFilters[i].frequency, this._tFreq[i], transType, time1, time2);
                WX.$(this._nFilters[i].Q, this._tQ[i], transType, time1, time2);
                WX.$(this._nGains[i].gain, this._tAmp[i], transType, time1, time2);
            }
        }
    };
    WX.extend(FormantV.prototype, WX.UnitBase.prototype);
    WX.extend(FormantV.prototype, WX.UnitInput.prototype);
    WX.extend(FormantV.prototype, WX.UnitOutput.prototype);
    WX.FormantV = function(params) {
        return new FormantV(params);
    };
})(WX);

(function(WX) {
    // generating impulse periodic wave
    var binSize = 4096;
    var mag = new Float32Array(binSize);
    var phase = new Float32Array(binSize);
    for (i = 0; i < binSize; ++i) {
        mag[i] = 1;
        phase[i] = 0;
    }
    var impulse;
    // TODO: shim
    if (typeof WX.context.createWaveTable === "function") {
        impulse = WX.context.createWaveTable(mag, phase);
    } else {
        impulse = WX.context.createPeriodicWave(mag, phase);
    }
    /**
   * WX.ImpulseTrain
   */
    function ImpulseTrain(params) {
        WX.UnitBase.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nImpulseTrain = WX.nOSC();
        this._nImpulseTrain.connect(this._nOutput);
        this._modulationTargets = {
            pFreq: [ this._nImpulseTrain.frequency ],
            pGain: [ this._nOutput.gain ]
        };
        // shim
        if (typeof this._nImpulseTrain.setWaveTable === "undefined") {
            this._nImpulseTrain.setPeriodicWave(impulse);
        } else {
            this._nImpulseTrain.setWaveTable(impulse);
        }
        this.setParams(this.params);
        if (!this.params.pDynamic) {
            this.start();
        }
    }
    ImpulseTrain.prototype = {
        defaultParams: {
            pLabel: "ImpulseTrain",
            pFreq: 1,
            pGain: .25,
            pDynamic: false
        },
        _Freq: function(transType, time1, time2) {
            WX.$(this._nImpulseTrain.frequency, this.params.pFreq, transType, time1, time2);
        },
        start: function(time) {
            if (this.params.pDynamic) {
                this._nImpulseTrain = WX.nOSC();
                this._nImpulseTrain.connect(this._nOutput);
                if (typeof this._nImpulseTrain.setWaveTable === "undefined") {
                    this._nImpulseTrain.setPeriodicWave(impulse);
                } else {
                    this._nImpulseTrain.setWaveTable(impulse);
                }
                this.setParams(this.params);
            }
            this._nImpulseTrain.start(time || WX.now);
        },
        stop: function(time) {
            this._nImpulseTrain.stop(time || WX.now);
        }
    };
    WX.extend(ImpulseTrain.prototype, WX.UnitBase.prototype);
    WX.extend(ImpulseTrain.prototype, WX.UnitOutput.prototype);
    WX.ImpulseTrain = function(params) {
        return new ImpulseTrain(params);
    };
})(WX);

/*
  Copyright 2013, Google Inc.
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are
  met:

      * Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the following disclaimer
  in the documentation and/or other materials provided with the
  distribution.
      * Neither the name of Google Inc. nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/**
 * @namespace Ktrl
 * @version r1
 * @author Hongchan Choi (hoch, hongchan@google.com)
 */
Ktrl = function() {
    // MIDI support flag
    var supportMIDI = true;
    // available MIDI sources (inputs) and targets (outputs)
    var sources = [];
    var targets = [];
    // target ID counter
    var targetId = 0;
    // on ready event function
    var onready = null;
    // system-ready flag
    var status = false;
    // version
    var version = "r1";
    if (typeof navigator.requestMIDIAccess === "undefined") {
        supportMIDI = false;
    }
    /**
   * @class [internal] MIDI source (input port abstraction)
   * @param {MIDIInput} midiinput MIDI input from MIDIAccess instance
   */
    function MIDISource(midiinput) {
        this.input = midiinput;
        this.targets = [];
        var me = this;
        this.input.onmidimessage = function(e) {
            var c = me.targets.length;
            while (c--) {
                me.targets[c].ondata(e);
            }
        };
    }
    // class MIDISource prototype
    MIDISource.prototype = {
        constructor: MIDISource,
        /**
     * removes a target from the source
     * @param {object} target target object to be removed
     */
        removeTarget: function(target) {
            // traverse array looking for the target and remove when found
            var me = this;
            this.targets.map(function(t) {
                if (t === target) {
                    var idx = me.targets.indexOf(target);
                    me.targets.splice(idx, 1);
                }
            });
        },
        /**
     * adds a target to this source (creating a connection)
     * @param {object} target target object to be added
     */
        addTarget: function(target) {
            // if target already exists, ignore
            for (var i = 0; i < this.targets.length; ++i) {
                if (this.targets[i] === target) {
                    post("duplicate target.");
                    return;
                }
            }
            this.targets.push(target);
        }
    };
    /**
   * @class [internal] MIDI target (MIDI receiving end abstraction)
   */
    function MIDITarget(label) {
        this.id = targetId++;
        this.label = label || "Untitled";
        this.active = false;
        this.process = function() {};
        var me = this;
        this.ondata = function(e) {
            if (me.active) {
                me.process(e);
            }
        };
        targets.push(this);
    }
    // class MIDItarget prototype
    MIDITarget.prototype = {
        constructor: MIDITarget,
        /**
     * defines message handler for "on data" event
     * @param {function} fn MIDI data handler
     */
        onData: function(fn) {
            this.process = fn;
        },
        /**
     * activates the incoming data processing
     */
        activate: function() {
            this.active = true;
        },
        /**
     * disables the incoming data processing
     */
        disable: function() {
            this.active = false;
        },
        /**
     * get target's ID number
     * @return {int} unique target ID
     */
        getID: function() {
            return this.id;
        }
    };
    /**
   * [helper, factory] creates a new MIDI target
   * @return {object} MIDI target object
   */
    function createTarget(label) {
        return new MIDITarget(label);
    }
    /**
   * routes all sources to a target
   * @param  {object} target MIDI target
   * @return {boolean} result
   */
    function routeAllToTarget(target) {
        // NOTE: this won't work after closure compilation
        // if (target.constructor.name !== "MIDITarget") {
        //   post("invalid argument. (must use MIDITarget)");
        //   return false;
        // }
        // connect all sources to the target
        sources.map(function(s) {
            s.addTarget(target);
        });
        return true;
    }
    /**
   * routes a specific source to a target
   * @param  {int} sourceId MIDI source ID (see Ktrl.report() for available ID)
   * @param  {object} target MIDI target
   * @return {boolean} result
   */
    function routeSourceToTarget(sourceId, target) {
        // check id first
        if (sourceId < sources.length) {
            // remove target from all sources
            sources.map(function(s) {
                s.removeTarget(target);
            });
            // connect a source to target
            sources[sourceId].addTarget(target);
            return true;
        } else {
            post("invalid source id or target.");
            return false;
        }
    }
    /**
   * disconnect a target from all sources (while not removing)
   * @param  {MIDITarget} target a target to be disconnected
   * @return {boolean} result
   */
    function disconnectTarget(target) {
        // NOTE: this won't work after closure compilation
        // if (target.constructor.name !== "MIDITarget") {
        //   post("invalid argument. (must use MIDITarget)");
        //   return false;
        // }
        sources.map(function(s) {
            s.removeTarget(target);
        });
        return true;
    }
    /**
   * disconnect and remove a target from the system
   * @param  {MIDITarget} target a target to be disconnected
   * @return {boolean} result
   */
    function removeTarget(target) {
        // disconnect first
        if (Ktrl.disconnectTarget(target)) {
            // remove target from system wide target pool
            targets.map(function(t) {
                if (t === target) {
                    var idx = targets.indexOf(target);
                    targets.splice(idx, 1);
                }
            });
            return true;
        } else {
            return false;
        }
    }
    /**
   * [helper] defines onReady function
   * @param {function} fn user-defined function
   */
    function ready(fn) {
        if (typeof fn !== "function") {
            post("invalid handler function.");
        } else {
            if (supportMIDI) {
                report();
            }
            onready = fn;
        }
    }
    /**
   * [helper] reports available input ports
   */
    function report() {
        var counter = 0;
        post("listing available MIDI sources...");
        sources.map(function(s) {
            console.log("source", counter++, "	", s.input.name, "	", s.input.manufacturer);
        });
        post("listing available MIDI targets...");
        targets.map(function(t) {
            console.log("target", t.id, "	", t.label, "	", t.active);
        });
    }
    /**
   * [helper] post message with the library tag
   * @param  {string} msg log message
   */
    function post(msg) {
        console.log("[ktrl] " + msg);
    }
    /**
   * [helper] parses MIDI message
   * @param  {array} midimsg 3-bytes MIDI message
   * @return {object} parsed MIDI message (see below for property names)
   *
   * ["noteoff", "noteon"]: { type, channel, pitch, velocity }
   * ["polypressure"]: { type, channel, pitch, pressure }
   * ["controlchange"]: { type, channel, control, value }
   * ["programchange"]: { type, channel, program }
   * ["channelpressure"]: { type, channel, pressure }
   * ["pitchwheel"]: { type, channel, wheel }
   */
    parse = function(midimsg) {
        var data = midimsg.data;
        var timestamp = midimsg.timeStamp * .001;
        var type = data[0] >> 4;
        var channel = (data[0] & 15) + 1;
        var parsedData;
        switch (type) {
          case 8:
            parsedData = {
                type: "noteoff",
                channel: channel,
                pitch: data[1],
                velocity: data[2],
                timestamp: timestamp
            };
            break;

          case 9:
            parsedData = {
                type: "noteon",
                channel: channel,
                pitch: data[1],
                velocity: data[2],
                timestamp: timestamp
            };
            break;

          case 10:
            parsedData = {
                type: "polypressure",
                channel: channel,
                pitch: data[1],
                pressure: data[2],
                timestamp: timestamp
            };
            break;

          case 11:
            parsedData = {
                type: "controlchange",
                channel: channel,
                control: data[1],
                value: data[2],
                timestamp: timestamp
            };
            break;

          case 12:
            parsedData = {
                type: "programchange",
                channel: channel,
                program: data[1],
                timestamp: timestamp
            };
            break;

          case 13:
            parsedData = {
                type: "channelpressure",
                channel: channel,
                pressure: data[1],
                timestamp: timestamp
            };
            break;

          case 14:
            parsedData = {
                type: "pitchwheel",
                channel: channel,
                wheel: data[1] << 8 | data[2],
                timestamp: timestamp
            };
            break;
        }
        return parsedData;
    };
    // curve utilities
    var curves = {
        linear: new Array(128),
        smooth: new Array(128),
        smooth2: new Array(128),
        sqaured: new Array(128),
        cubed: new Array(128),
        invSquared: new Array(128),
        invCubed: new Array(128),
        sine: new Array(128),
        invSine: new Array(128)
    };
    // filling them up
    for (var i = 0; i < 128; i++) {
        var x = i / 127;
        curves.linear[i] = x;
        curves.smooth[i] = x * x * (3 - 2 * x);
        curves.smooth2[i] = curves.smooth[i] * curves.smooth[i] * (3 - 2 * curves.smooth[i]);
        curves.sqaured[i] = x * x;
        curves.cubed[i] = x * x * x;
        curves.invSquared[i] = 1 - (1 - x) * (1 - x);
        curves.invCubed[i] = 1 - (1 - x) * (1 - x) * (1 - x);
        curves.sine[i] = Math.sin(x * Math.PI / 2);
        curves.invSine[i] = 1 - Math.sin(x * Math.PI / 2 + Math.PI / 2);
    }
    /**
   * scaler
   */
    function scale(value, target0, target1) {
        return value * ((target1 || 1) - (target0 || 0)) + (target0 || 0);
    }
    function CurveLinear(MIDIValue) {
        return curves.linear[MIDIValue];
    }
    function CurveSmooth(MIDIValue) {
        return curves.smooth[MIDIValue];
    }
    function CurveSmooth2(MIDIValue) {
        return curves.smooth2[MIDIValue];
    }
    function CurveSquared(MIDIValue) {
        return curves.sqaured[MIDIValue];
    }
    function CurveCubed(MIDIValue) {
        return curves.cubed[MIDIValue];
    }
    function CurveInvSquared(MIDIValue) {
        return curves.invSquared[MIDIValue];
    }
    function CurveInvCubed(MIDIValue) {
        return curves.invCubed[MIDIValue];
    }
    function CurveSine(MIDIValue) {
        return curves.sine[MIDIValue];
    }
    function CurveInvSine(MIDIValue) {
        return curves.invSine[MIDIValue];
    }
    /**
   * * MIDI note names (A0~C8) associated to MIDI pitch (21~108)
   * @memberOf WX
   * @type {int}
   */
    var NoteName = {
        A0: 21,
        B0: 23,
        C1: 24,
        D1: 26,
        E1: 28,
        F1: 29,
        G1: 31,
        A1: 33,
        B1: 35,
        C2: 36,
        D2: 38,
        E2: 40,
        F2: 41,
        G2: 43,
        A2: 45,
        B2: 47,
        C3: 48,
        D3: 50,
        E3: 52,
        F3: 53,
        G3: 55,
        A3: 57,
        B3: 59,
        C4: 60,
        D4: 62,
        E4: 64,
        F4: 65,
        G4: 67,
        A4: 69,
        B4: 71,
        C5: 72,
        D5: 74,
        E5: 76,
        F5: 77,
        G5: 79,
        A5: 81,
        B5: 83,
        C6: 84,
        D6: 86,
        E6: 88,
        F6: 89,
        G6: 91,
        A6: 93,
        B6: 95,
        C7: 96,
        D7: 98,
        E7: 100,
        F7: 101,
        G7: 103,
        A7: 105,
        B7: 107,
        C8: 108
    };
    // requestMIDIAccess is async, so this is needed sometimes...
    function _waitForOnReady() {
        if (typeof onready === "function") {
            post("executing onReady!");
            onready();
        } else {
            post("onReady is not specified. Wait for it...");
            setTimeout(_waitForOnReady, 1e3);
        }
    }
    // ENTRY POINT: scan input port and boot up
    if (supportMIDI) {
        navigator.requestMIDIAccess().then(function(midiAccess) {
            // check input ports
            if (midiAccess.inputs().length === 0) {
                post("no input ports available");
                return;
            }
            // creating MIDI sources
            for (var i = 0; i < midiAccess.inputs().length; ++i) {
                sources[i] = new MIDISource(midiAccess.inputs()[i]);
            }
            post("Ktrl (" + version + ") is ready.");
            status = true;
            // wait and execute onready
            _waitForOnReady();
        }, function(msg) {
            post("failed to get MIDI access: " + msg);
            status = false;
            return;
        });
    } else {
        post("Your browser does not support MIDI. Ktrl is inactive.");
    }
    // exposes handles
    return {
        createTarget: createTarget,
        removeTarget: removeTarget,
        disconnectTarget: disconnectTarget,
        routeAllToTarget: routeAllToTarget,
        routeSourceToTarget: routeSourceToTarget,
        ready: ready,
        parse: parse,
        report: report,
        scale: scale,
        CurveLinear: CurveLinear,
        CurveSmooth: CurveSmooth,
        CurveSmooth2: CurveSmooth2,
        CurveSquared: CurveSquared,
        CurveCubed: CurveCubed,
        CurveInvSquared: CurveInvSquared,
        CurveInvCubed: CurveInvCubed,
        CurveSine: CurveSine,
        CurveInvSine: CurveInvSine,
        NoteName: NoteName
    };
}();

(function(WX) {
    /**
   * WX.LPF
   */
    function LPF(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nFilter1 = WX.nFilter();
        this._nFilter2 = WX.nFilter();
        this._nFilter1.type = this._nFilter2.type = "lowpass";
        this._nInput.connect(this._nFilter1);
        this._nFilter1.connect(this._nOutput);
        this._nFilter2.connect(this._nOutput);
        this._modulationTargets = {
            pCutoff: [ this._nFilter1.frequency, this._nFilter2.frequency ],
            pQ: [ this._nFilter1.Q, this._nFilter2.Q ]
        };
        this.setParams(this.params);
    }
    LPF.prototype = {
        defaultParams: {
            pCutoff: 250,
            pQ: 0,
            pEnhanced: false
        },
        _Cutoff: function(transType, time1, time2) {
            WX.$(this._nFilter1.frequency, this.params.pCutoff, transType, time1, time2);
            WX.$(this._nFilter2.frequency, this.params.pCutoff, transType, time1, time2);
        },
        _Q: function(transType, time1, time2) {
            WX.$(this._nFilter1.Q, this.params.pQ, transType, time1, time2);
            WX.$(this._nFilter2.Q, this.params.pQ, transType, time1, time2);
        },
        _Enhanced: function(bool) {
            this._nFilter1.disconnect();
            if (bool) {
                this._nFilter1.connect(this._nFilter2);
            } else {
                this._nFilter1.connect(this._nOutput);
            }
        }
    };
    WX.extend(LPF.prototype, WX.UnitBase.prototype);
    WX.extend(LPF.prototype, WX.UnitInput.prototype);
    WX.extend(LPF.prototype, WX.UnitOutput.prototype);
    WX.LPF = function(params) {
        return new LPF(params);
    };
})(WX);

(function(WX) {
    // getNoiseBUffer_Gaussian
    function getNoiseBuffer_Gaussian(duration, sampleRate) {
        var L = Math.floor(WX.sampleRate * duration);
        var noiseFloat32 = new Float32Array(L);
        for (var i = 0; i < L; i++) {
            var r1 = Math.random(), r2 = Math.random();
            noiseFloat32[i] = Math.sqrt(-2 * Math.log(r1)) * Math.cos(2 * Math.PI * r2) * .5;
        }
        var noiseBuffer = WX.context.createBuffer(2, L, sampleRate);
        noiseBuffer.getChannelData(0).set(noiseFloat32, 0);
        noiseBuffer.getChannelData(1).set(noiseFloat32, 0);
        return noiseBuffer;
    }
    // creating white noise (gaussian distribution) buffer (10s)
    var duration = 10;
    var baseNoiseBuffer = getNoiseBuffer_Gaussian(duration, WX.sampleRate);
    // var whiteNoise1 = new Float32Array(bufferLength);
    // var whiteNoise2 = new Float32Array(bufferLength);
    // var noiseBuffer1 = WX.context.createBuffer(2, bufferLength, WX.sampleRate);
    // var noiseBuffer2 = WX.context.createBuffer(2, bufferLength, WX.sampleRate);
    // // gaussian white noise
    // // http://www.musicdsp.org/showone.php?id=113
    // for (var i = 0; i < bufferLength; i++) {
    //   var r1 = Math.random(), r2 = Math.random();
    //   r1 = (r1 === 0.0) ? Number.MIN_VALUE : r1;
    //   whiteNoise1[i] = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2) * 0.5;
    //   r1 = Math.random();
    //   r2 = Math.random();
    //   r1 = (r1 === 0.0) ? Number.MIN_VALUE : r1;
    //   whiteNoise2[i] = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2) * 0.5;
    // }
    // noiseBuffer1.getChannelData(0).set(whiteNoise1, 0);
    // noiseBuffer1.getChannelData(1).set(whiteNoise1, 0);
    // noiseBuffer2.getChannelData(0).set(whiteNoise2, 0);
    // noiseBuffer2.getChannelData(1).set(whiteNoise2, 0);
    /**
   * WX.Noise
   */
    function Noise(params) {
        WX.UnitBase.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._noiseBuffer = getNoiseBuffer_Gaussian(9.73, WX.sampleRate);
        this.__init();
        this._modulationTargets = {
            pGain: [ this._nOutput.gain ]
        };
        this.setParams(this.params);
        if (!this.params.pDynamic) {
            this.start();
        }
    }
    Noise.prototype = {
        defaultParams: {
            pLabel: "Noise",
            pGrain: 1,
            pGain: .1,
            pDynamic: false
        },
        __init: function() {
            this._nNoise1 = WX.nSource();
            this._nNoise2 = WX.nSource();
            this._nNoise1.connect(this._nOutput);
            this._nNoise2.connect(this._nOutput);
            this._nNoise1.buffer = baseNoiseBuffer;
            this._nNoise2.buffer = this._noiseBuffer;
            this._nNoise1.loop = true;
            this._nNoise2.loop = true;
            this._nNoise1.loopStart = Math.random() * baseNoiseBuffer.duration;
            this._nNoise2.loopStart = Math.random() * this._noiseBuffer.duration;
        },
        _Grain: function(transType, time1, time2) {
            WX.$(this._nNoise1.playbackRate, this.params.pGrain, transType, time1, time2);
            WX.$(this._nNoise2.playbackRate, this.params.pGrain, transType, time1, time2);
        },
        start: function(time) {
            if (this.params.pDynamic) {
                this.__init();
            }
            this._nNoise1.start(time || WX.now);
            this._nNoise2.start(time || WX.now);
        },
        stop: function(time) {
            this._nNoise1.stop(time || WX.now);
            this._nNoise2.stop(time || WX.now);
        }
    };
    WX.extend(Noise.prototype, WX.UnitBase.prototype);
    WX.extend(Noise.prototype, WX.UnitOutput.prototype);
    WX.Noise = function(params) {
        return new Noise(params);
    };
})(WX);

(function(WX) {
    /**
   * WX.Oscil
   */
    function Oscil(params) {
        WX.UnitBase.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nOSC = WX.nOSC();
        this._nOSC.connect(this._nOutput);
        this._modulationTargets = {
            pFreq: [ this._nOSC.frequency ],
            pGain: [ this._nOutput.gain ]
        };
        this.setParams(this.params);
        // this unit supports dynamic lifetime
        // if instance runs as non-dynamic mode, start osc immediately
        if (!this.params.pDynamic) {
            this.start();
        }
    }
    Oscil.prototype = {
        defaultParams: {
            pLabel: "Oscil",
            pType: "sine",
            pFreq: 440,
            pGain: .25,
            pDynamic: false
        },
        _Type: function() {
            if (WX.System.LEGACY_SUPPORT) {
                this._nOSC.type = WX.OscilType[this.params.pType];
            } else {
                this._nOSC.type = this.params.pType;
            }
        },
        _Freq: function(transType, time1, time2) {
            WX.$(this._nOSC.frequency, this.params.pFreq, transType, time1, time2);
        },
        start: function(time) {
            if (this.params.pDynamic) {
                this._nOSC = WX.nOSC();
                this._nOSC.connect(this._nOutput);
                this.setParams(this.params);
            }
            this._nOSC.start(time || WX.now);
        },
        stop: function(time) {
            this._nOSC.stop(time || WX.now);
        }
    };
    WX.extend(Oscil.prototype, WX.UnitBase.prototype);
    WX.extend(Oscil.prototype, WX.UnitOutput.prototype);
    WX.Oscil = function(params) {
        return new Oscil(params);
    };
})(WX);

(function(WX) {
    var kMaxNotches = 12;
    /**
   * WX.Phasor
   */
    function Phasor(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        // phasor audio graph
        this._nDry = WX.nGain();
        this._nWet = WX.nGain();
        var _nSplitter = WX.nSplitter();
        var _nMerger = WX.nMerger();
        this._nNotches = [];
        for (var i = 0; i < kMaxNotches; i++) {
            this._nNotches[i] = WX.nFilter();
            this._nNotches[i].type = "notch";
        }
        this._inputGain.connect(this._nDry);
        this._inputGain.connect(_nSplitter);
        _nSplitter.connect(this._nNotches[0], 0, 0);
        _nSplitter.connect(this._nNotches[1], 1, 0);
        for (var j = 0; j < kMaxNotches - 2; j += 2) {
            this._nNotches[j].connect(this._nNotches[j + 2]);
            this._nNotches[j + 1].connect(this._nNotches[j + 3]);
        }
        this._nNotches[kMaxNotches - 2].connect(_nMerger, 0, 0);
        this._nNotches[kMaxNotches - 1].connect(_nMerger, 0, 1);
        _nMerger.connect(this._nWet);
        this._nDry.connect(this._nOutput);
        this._nWet.connect(this._nOutput);
        // modulation
        this._nLFO = WX.nOSC();
        this._nLDepth = WX.nGain();
        this._nRDepth = WX.nGain();
        this._nLFO.start(0);
        this._nLFO.connect(this._nLDepth);
        this._nLFO.connect(this._nRDepth);
        for (var k = 0; k < kMaxNotches; k++) {
            if (k % 2) {
                this._nRDepth.connect(this._nNotches[k].frequency);
            } else {
                this._nLDepth.connect(this._nNotches[k].frequency);
            }
        }
        this._nLFO.type = "triangle";
        // this._nLFO.frequency.value = 4.0;
        // this._nLDepth.gain.value = 200.0;
        // this._nRDepth.gain.value = -200.0;
        this.setParams(this.params);
    }
    Phasor.prototype = {
        defaultParams: {
            pLabel: "Phasor",
            pRate: .5,
            pDepth: 1,
            pBaseFrequency: 1,
            pSpacing: .1,
            pMix: .6
        },
        _setNotchFrequency: function() {
            for (var i = 0; i < kMaxNotches; i++) {
                var freq = this.params.pBaseFrequency + Math.pow(this.params.pSpacing, i);
                WX.$(this._nNotches[i].frequency, freq, transType, time1, time2);
            }
        },
        _Rate: function(transType, time1, time2) {
            WX.$(this._nLFO.frequency, WX.clamp(this.params.pRate, 0, 1) * 4 + 2, transType, time1, time2);
        },
        _Depth: function(transType, time1, time2) {
            var value = WX.clamp(this.params.pDepth, 0, 1) * 200;
            WX.$(this._nLDepth.gain, value, transType, time1, time2);
            WX.$(this._nRDepth.gain, -value, transType, time1, time2);
        },
        _BaseFrequency: function(transType, time1, time2) {
            this._setNotchFrequency();
        },
        _Spacing: function(transType, time1, time2) {
            this._setNotchFrequency();
        },
        _Mix: function(transType, time1, time2) {
            WX.$(this._nDry.gain, 1 - this.params.pMix, transType, time1, time2);
            WX.$(this._nWet.gain, this.params.pMix, transType, time1, time2);
        }
    };
    WX.extend(Phasor.prototype, WX.UnitBase.prototype);
    WX.extend(Phasor.prototype, WX.UnitInput.prototype);
    WX.extend(Phasor.prototype, WX.UnitOutput.prototype);
    WX.Phasor = function(params) {
        return new Phasor(params);
    };
})(WX);

(function(WX) {
    /**
   * WX.Pingpong
   */
    function Pingpong(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        // node building
        this._nLDelay = WX.nDelay();
        this._nRDelay = WX.nDelay();
        this._nLFeedback = WX.nGain();
        this._nRFeedback = WX.nGain();
        this._nLCrosstalk = WX.nGain();
        this._nRCrosstalk = WX.nGain();
        this._nDry = WX.nGain();
        this._nWet = WX.nGain();
        var nSplitter = WX.nSplitter(2);
        var nMerger = WX.nMerger(2);
        // source distribution
        this._nInput.connect(nSplitter);
        this._nInput.connect(this._nDry);
        // interconnection: delay, fb, crosstalk
        nSplitter.connect(this._nLDelay, 0, 0);
        this._nLDelay.connect(this._nLFeedback);
        this._nLFeedback.connect(this._nLDelay);
        this._nLFeedback.connect(this._nRCrosstalk);
        this._nRCrosstalk.connect(this._nRDelay);
        this._nLDelay.connect(nMerger, 0, 0);
        nSplitter.connect(this._nRDelay, 1, 0);
        this._nRDelay.connect(this._nRFeedback);
        this._nRFeedback.connect(this._nRDelay);
        this._nRFeedback.connect(this._nLCrosstalk);
        this._nLCrosstalk.connect(this._nLDelay);
        this._nRDelay.connect(nMerger, 0, 1);
        // summing
        nMerger.connect(this._nWet);
        this._nDry.connect(this._nOutput);
        this._nWet.connect(this._nOutput);
        // initialization
        this.setParams(this.params);
    }
    Pingpong.prototype = {
        defaultParams: {
            pLabel: "Pingpong",
            pDelayTimeLeft: .125,
            pDelayTimeRight: .25,
            pFeedbackLeft: .25,
            pFeedbackRight: .125,
            pCrosstalk: .1,
            pMix: 1
        },
        _DelayTimeLeft: function(transType, time1, time2) {
            WX.$(this._nLDelay.delayTime, this.params.pDelayTimeLeft, transType, time1, time2);
        },
        _DelayTimeRight: function(transType, time1, time2) {
            WX.$(this._nRDelay.delayTime, this.params.pDelayTimeRight, transType, time1, time2);
        },
        _FeedbackLeft: function(transType, time1, time2) {
            WX.$(this._nLFeedback.gain, this.params.pFeedbackLeft, transType, time1, time2);
        },
        _FeedbackRight: function(transType, time1, time2) {
            WX.$(this._nRFeedback.gain, this.params.pFeedbackRight, transType, time1, time2);
        },
        _Crosstalk: function(transType, time1, time2) {
            WX.$(this._nLCrosstalk.gain, this.params.pCrosstalk, transType, time1, time2);
            WX.$(this._nRCrosstalk.gain, this.params.pCrosstalk, transType, time1, time2);
        },
        _Mix: function(transType, time1, time2) {
            WX.$(this._nDry.gain, 1 - this.params.pMix, transType, time1, time2);
            WX.$(this._nWet.gain, this.params.pMix, transType, time1, time2);
        },
        setDelayTime: function(dtLeft, dtRight, transType, time1, time2) {
            this.set("pDelayTimeLeft", dtLeft, transType, time1, time2);
            this.set("pDelayTimeLeft", dtRight, transType, time1, time2);
        },
        setFeedback: function(fbLeft, fbRight, transType, time1, time2) {
            this.set("pFeedbackLeft", fbLeft, transType, time1, time2);
            this.set("pFeedbackRight", fbRight, transType, time1, time2);
        }
    };
    WX.extend(Pingpong.prototype, WX.UnitBase.prototype);
    WX.extend(Pingpong.prototype, WX.UnitInput.prototype);
    WX.extend(Pingpong.prototype, WX.UnitOutput.prototype);
    WX.Pingpong = function(params) {
        return new Pingpong(params);
    };
})(WX);

(function(WX) {
    /**
   * WX.Sampler
   */
    function Sampler(params) {
        WX.UnitBase.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._buffer = null;
        // a list of active source nodes, removed from this list when the
        // `onended` event is fired.
        //
        // NOTE: This implementation is not meant to be a polyphonic sampler,
        // although it could evolve into one.  This list of active nodes is just
        // maintained so the nodes have time to finish and call `onended` before
        // they are removed from the heap.  It also allows `stop` to be called
        // multiple times, because we wait until the sound actually finishes
        // to remove the reference to the node.
        this._nBufferSources = [];
        this.setParams(params);
    }
    Sampler.prototype = {
        defaultParams: {
            pPitch: 60,
            pBasePitch: 60,
            pLoop: false,
            pGain: 1
        },
        onload: function() {},
        /**
     *  User overrideable `onended` callback for when a node is finished.
     **/
        onended: function() {},
        setBuffer: function(buffer) {
            // TODO: is this working on other browsers?
            if (buffer.constructor.name === "AudioBuffer") {
                this._buffer = buffer;
                this.onload();
            }
        },
        getDuration: function() {
            return this._buffer ? this._buffer.duration : 0;
        },
        /**
     *  Actual source node `onended` callback for the passed-in node.
     *
     *  @param  {BufferSourceNode}  nBufferSource - The node that will use
     *  this as its `onended` callback.
     **/
        _createOnendedCallback: function(nBufferSource) {
            var me = this;
            return function() {
                // remove node from our list
                me._removeSourceNode(nBufferSource);
                // call our user-overrideable onended callback
                me.onended();
            };
        },
        /**
     *  Create a new BufferSourceNode to play at a certain time.
     *
     *  @param  {Number}  time - Absolute time this node will play.
     *  @param  {Boolean}  loop - The value to set the loop property of the
     *  node
     **/
        _createSourceNode: function(time, loop) {
            var nBufferSource = WX.nSource(), r = Math.pow(2, (this.params.pPitch - this.params.pBasePitch) / 12);
            time = time || WX.now;
            nBufferSource.buffer = this._buffer;
            nBufferSource.connect(this._nOutput);
            nBufferSource.playbackRate.setValueAtTime(r, time);
            nBufferSource.loop = loop;
            nBufferSource.start(time);
            // add node to our list
            this._nBufferSources.push(nBufferSource);
            // handle node life end
            nBufferSource.onended = this._createOnendedCallback(nBufferSource);
            return nBufferSource;
        },
        /**
     *  Remove buffer source node from our list of active nodes.
     *  Called when a buffer node ends.
     *
     *  @param  {BufferSourceNode}  node - The node we are removing from the
     *  list.
     **/
        _removeSourceNode: function(node) {
            var i;
            for (i = 0; i < this._nBufferSources.length; i++) {
                if (this._nBufferSources[i] == node) {
                    this._nBufferSources.splice(i, 1);
                    return;
                }
            }
        },
        // play sample for certain period of time and stop
        oneshot: function(time, dur) {
            var nBufferSource;
            if (this._buffer) {
                dur = dur || this._buffer.duration;
                nBufferSource = this._createSourceNode(time, false);
                nBufferSource.stop(time + dur);
            }
        },
        // start (and loop)
        start: function(time) {
            var nBufferSource;
            if (this._buffer) {
                nBufferSource = this._createSourceNode(time, this.params.pLoop);
            }
        },
        /**
     *  Stops all nodes.  When the nodes actually stop rendering, their
     *  `onended` callback will be fired and they will be removed from
     *  the list.
     **/
        stop: function(time) {
            var i;
            if (this._nBufferSources.length) {
                for (i = 0; i < this._nBufferSources.length; i++) {
                    this._nBufferSources[i].stop(time);
                }
            }
        }
    };
    WX.extend(Sampler.prototype, WX.UnitBase.prototype);
    WX.extend(Sampler.prototype, WX.UnitOutput.prototype);
    WX.Sampler = function(params) {
        return new Sampler(params);
    };
})(WX);

(function(WX) {
    // static curve size
    var kCurveSize = 65536;
    var kCenter = kCurveSize / 2;
    // saturate curve generator:
    // http://musicdsp.org/showone.php?id=42
    // TODO: need some tuning here.
    function _setSaturateCurve(curveArray, quality) {
        for (var i = kCenter, dec = 0; i < kCurveSize; i++, dec++) {
            var x = i / kCurveSize * 2 - 1;
            if (x < quality) {
                curveArray[i] = x;
                curveArray[kCenter - dec] = -x;
            } else {
                var c = quality + (x - quality) / (1 + (x - quality) / (1 - quality) ^ 2);
                curveArray[i] = c;
                curveArray[kCenter - dec] = -c;
            }
            curveArray[i] *= 1 / ((quality + 1) / 2);
            curveArray[kCenter - dec] *= 1 / ((quality + 1) / 2);
        }
    }
    /**
   * WX.Saturator
   * @note this class has the race condition issue upon array assignemnt.
   *       do expect API changes...
   */
    function Saturator(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nShaper = WX.nWaveShaper();
        this._nInput.connect(this._nShaper);
        this._nShaper.connect(this._nOutput);
        this._curve = new Float32Array(kCurveSize);
        this._nShaper.curve = this._curve;
        // this is race condition...
        this._nShaper.oversampleType = "2x";
        this._curveFactor = .2;
        this.setParams(this.params);
    }
    Saturator.prototype = {
        defaultParams: {
            pQuality: 1,
            pDrive: 1
        },
        _Quality: function() {
            _setSaturateCurve(this._curve, this.params.pQuality);
        },
        _Drive: function(transType, time1, time2) {
            WX.$(this._nInput.gain, this.params.pDrive, transType, time1, time2);
        }
    };
    WX.extend(Saturator.prototype, WX.UnitBase.prototype);
    WX.extend(Saturator.prototype, WX.UnitInput.prototype);
    WX.extend(Saturator.prototype, WX.UnitOutput.prototype);
    WX.Saturator = function(params) {
        return new Saturator(params);
    };
})(WX);

(function(WX) {
    // static
    var kOctaves = 10;
    var kFrequencyGrid = [ 30, 65, 125, 250, 500, 1e3, 2e3, 4e3, 8e3, 16e3 ];
    var kNyquist = WX.sampleRate * .5;
    var kLogBase = 2;
    /**
   * WX.Spectrum
   */
    function Spectrum(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nAnalyzer = WX.nAnalyzer();
        this._nInput.connect(this._nAnalyzer);
        this._ctx2d = null;
        this._buffer = new Float32Array(this._nAnalyzer.frequencyBinCount);
        this._renderSetting = {
            binCount: this._nAnalyzer.frequencyBinCount,
            binSize: WX.sampleRate / this._nAnalyzer.frequencyBinCount,
            logMax: Math.log((this._nAnalyzer.frequencyBinCount - 1) / 1, 2),
            baseX: 0,
            unitX: 0,
            scaleY: 0
        };
        this.setParams(this.params);
    }
    Spectrum.prototype = {
        defaultParams: {
            pLabel: "Spectrum",
            pSmoothingTimeConstant: .9,
            pMaxDecibels: 0,
            pMinDecibels: -60,
            pScale: "log",
            pAutoClear: true,
            pShowGrid: false
        },
        _SmoothingTimeConstant: function() {
            this._nAnalyzer.smoothingTimeConstant = this.params.pSmoothingTimeConstant;
        },
        _MaxDecibels: function() {
            this._nAnalyzer.maxDecibels = this.params.pMaxDecibels;
        },
        _MinDecibels: function() {
            this._nAnalyzer.minDecibels = this.params.pMinDecibels;
        },
        _updateSize: function() {
            this._renderSetting.baseX = this._ctx2d.canvas.width / 4;
            this._renderSetting.unitX = this._ctx2d.canvas.width / this._buffer.length;
            this._renderSetting.scaleY = this._ctx2d.canvas.height;
        },
        _drawGrid: function(gridColor) {
            var c = this._ctx2d;
            c.lineWidth = .5;
            c.strokeStyle = gridColor || "#666";
            c.beginPath();
            for (var oct = 0; oct < kOctaves; oct++) {
                var x = oct * c.canvas.width / kOctaves;
                var f = kNyquist * Math.pow(2, oct - kOctaves);
                c.moveTo(x, 0);
                c.lineTo(x, c.canvas.height);
                c.fillText(~~f + "Hz", x + 5, c.canvas.height - 10);
            }
            // 6dB grid size
            var numDecibelGrid = this.params.pMinDecibels / 6;
            for (var grid = 0; grid < numDecibelGrid; grid++) {
                var y = grid * c.canvas.height / numDecibelGrid;
                var d = 0 + -6 * grid;
                c.moveTo(0, y);
                c.lineTo(c.canvas.width, y);
                c.fillText(~~d + "dB", c.canvas.width - 30, y + 15);
            }
            c.stroke();
        },
        setContext2D: function(context) {
            this._ctx2d = context;
            this._updateSize();
        },
        draw: function(color, gridColor) {
            var c = this._ctx2d, p = this.params, s = this._renderSetting;
            if (p.pAutoClear) {
                c.clearRect(0, 0, c.canvas.width, c.canvas.height);
            }
            if (p.pShowGrid) {
                this.drawGrid(gridColor);
            }
            // drawing spectrum
            c.lineWidth = .75;
            c.strokeStyle = color || "#222";
            c.beginPath();
            this._nAnalyzer.getFloatFrequencyData(this._buffer);
            for (var i = 1; i < s.binCount; i++) {
                if (p.pScale === "linear") {
                    c.moveTo(i * s.unitX, s.scaleY);
                    c.lineTo(i * s.unitX, this._buffer[i] * -.01 * s.scaleY);
                } else {
                    var x = c.canvas.width * Math.log(i / 1, kLogBase) / s.logMax;
                    c.lineTo(x, this._buffer[i] * -.01 * s.scaleY);
                }
            }
            c.stroke();
        }
    };
    WX.extend(Spectrum.prototype, WX.UnitBase.prototype);
    WX.extend(Spectrum.prototype, WX.UnitInput.prototype);
    WX.Spectrum = function(params) {
        return new Spectrum(params);
    };
})(WX);

(function(WX) {
    // DC offset of 1 second for step function
    var dcOffset = WX.nBuffer(1, WX.context.sampleRate, WX.context.sampleRate);
    var temp = new Float32Array(WX.context.sampleRate);
    for (var i = 0; i < WX.context.sampleRate; ++i) {
        temp[i] = 1;
    }
    dcOffset.getChannelData(0).set(temp, 0);
    /**
   * WX.Step
   * @desc control signal (DC offset) generator
   */
    function Step(params) {
        WX.UnitBase.call(this);
        WX.UnitOutput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nStep = WX.nSource();
        this._nStep.connect(this._nOutput);
        this._nStep.buffer = dcOffset;
        this._nStep.loop = true;
        this._nStep.loopEnd = 1;
        this.setParams(this.params);
        this._nStep.start(WX.now);
    }
    Step.prototype = {
        defaultParams: {
            pLabel: "Step",
            pGain: 1
        },
        stop: function(time) {
            this._nStep.stop(time || WX.now);
        }
    };
    WX.extend(Step.prototype, WX.UnitBase.prototype);
    WX.extend(Step.prototype, WX.UnitOutput.prototype);
    WX.Step = function(params) {
        return new Step(params);
    };
})(WX);

(function(WX) {
    /**
   * WX.StereoVisualizer
   */
    function StereoVisualizer(params) {
        WX.UnitBase.call(this);
        WX.UnitInput.call(this);
        WX.extend(this.params, this.defaultParams);
        WX.extend(this.params, params);
        this._nAnalyzer1 = WX.nAnalyzer();
        this._nAnalyzer2 = WX.nAnalyzer();
        var _nSplitter = WX.nSplitter(2);
        this._nInput.connect(_nSplitter);
        _nSplitter.connect(this._nAnalyzer1, 0, 0);
        _nSplitter.connect(this._nAnalyzer2, 1, 0);
        this._f32Buffer1 = new Float32Array(this._nAnalyzer1.frequencyBinCount);
        this._f32Buffer2 = new Float32Array(this._nAnalyzer2.frequencyBinCount);
        this._u8Buffer1 = new Uint8Array(this._nAnalyzer1.frequencyBinCount);
        this._u8Buffer2 = new Uint8Array(this._nAnalyzer2.frequencyBinCount);
        this.setParams(this.params);
    }
    StereoVisualizer.prototype = {
        defaultParams: {
            pLabel: "StereoVisualizer",
            pSmoothingTimeConstant: .9,
            pMaxDecibels: 0,
            pMinDecibels: -60
        },
        _SmoothingTimeConstant: function() {
            this._nAnalyzer1.smoothingTimeConstant = this.params.pSmoothingTimeConstant;
            this._nAnalyzer2.smoothingTimeConstant = this.params.pSmoothingTimeConstant;
        },
        _MaxDecibels: function() {
            this._nAnalyzer1.maxDecibels = this.params.pMaxDecibels;
            this._nAnalyzer2.maxDecibels = this.params.pMaxDecibels;
        },
        _MinDecibels: function() {
            this._nAnalyzer1.minDecibels = this.params.pMinDecibels;
            this._nAnalyzer2.minDecibels = this.params.pMinDecibels;
        },
        _ondraw: function(buffer1, buffer2) {},
        drawSpectrum: function() {
            this._nAnalyzer1.getFloatFrequencyData(this._f32Buffer1);
            this._nAnalyzer2.getFloatFrequencyData(this._f32Buffer2);
            this._ondraw(this._f32Buffer1, this._f32Buffer2);
        },
        drawWaveform: function() {
            this._nAnalyzer1.getByteTimeDomainData(this._u8Buffer1);
            this._nAnalyzer2.getByteTimeDomainData(this._u8Buffer2);
            this._ondraw(this._u8Buffer1, this._u8Buffer2);
        },
        onDraw: function(fn) {
            this._ondraw = fn;
        }
    };
    WX.extend(StereoVisualizer.prototype, WX.UnitBase.prototype);
    WX.extend(StereoVisualizer.prototype, WX.UnitInput.prototype);
    WX.StereoVisualizer = function(params) {
        return new StereoVisualizer(params);
    };
})(WX);