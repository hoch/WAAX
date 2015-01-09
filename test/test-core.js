// test-core.js

// caching
var expect = chai.expect,
    should = chai.should();

// Utilities
describe('Core: Utilities - object, music math and more.', function() {
  describe('getVersion()', function () {
    it('should return API version number.', function () {
      expect(WX.getVersion()).to.equal('1.0.0-alpha3');
    });
  });
  describe('Log.info(arg)', function () {
    it('should print info message in the console.', function (done) {
      WX.Log.info('this is', 'info', 'message.');
      done();
    });
  });
  describe('Log.warn(arg)', function () {
    it('should print warning message in the console.', function (done) {
      WX.Log.warn('this is', 'warning', 'message.');
      done();
    });
  });
  describe('Log.error(arg)', function () {
    it('should print message and throw error.', function () {
      expect(function () {
        WX.Log.error('this is', 'error', 'message.');
      }).to.throw(Error);
    });
  });
  describe('isObject(arg)', function () {
    it('should return true when input is JS object.', function () {
      expect(WX.isObject({})).to.equal(true);
      expect(WX.isObject([])).to.equal(true);
      expect(WX.isObject('Hey')).to.equal(false);
      expect(WX.isObject(1.0)).to.equal(false);
    });
  });
  describe('isArray(arg)', function () {
    it('should return true when input is Array.', function () {
      expect(WX.isArray([])).to.equal(true);
      expect(WX.isArray({})).to.equal(false);
      expect(WX.isArray(1.0)).to.equal(false);
    });
  });
  describe('isNumber(arg)', function () {
    it('should return true when input is Number.', function () {
      expect(WX.isNumber(1.0)).to.equal(true);
      expect(WX.isNumber('Number')).to.equal(false);
      expect(WX.isNumber({})).to.equal(false);
    });
  });
  describe('isBoolean(arg)', function () {
    it('should return true when input is Boolean.', function () {
      expect(WX.isBoolean(true)).to.equal(true);
      expect(WX.isBoolean(false)).to.equal(true);
      expect(WX.isBoolean(1)).to.equal(false);
    });
  });
  describe('hasParam(plugin, param)', function () {
    it('should return true when plugin has the parameter.', function () {
      var plugin = { params: { 'parameter': 0.0 } };
      expect(WX.hasParam(plugin, 'parameter')).to.equal(true);
      expect(WX.hasParam(plugin, 'notParameter')).to.equal(false);
    });
  });
  describe('extend(target, source)', function () {
    it('should add source to target object and return the extended target.',
      function () {
        var source = { a: 1, b: 2 },
            target = { b: 3, c: 4 },
            result = { a: 1, b: 2, c: 4 };
        expect(WX.extend(target, source)).deep.equal(result);
      }
    );
  });
  describe('clone(source)', function () {
    it('should return a cloned object.', function () {
      var source = { a: 1, b: 2 },
          result = { a: 1, b: 2 };
      expect(WX.clone(source)).deep.equal(result);
    });
  });
  describe('validateModel(model)', function () {
    it('returns true when all the keys are unique in a model.', function () {
      var valid = [
        { key:'Sine', value:'sine' },
        { key:'Sinusoid', value:'sine' }
      ];
      var invalid = [
        { key:'Sine', value:'sine' },
        { key:'Sine', value:'sinusoid' }
      ];
      expect(WX.validateModel(valid)).to.equal(true);
      expect(WX.validateModel(invalid)).to.equal(false);
    });
  });
  describe('findKeyByValue(model, value)', function () {
    it('returns a key assodicated with a value. null when not found.',
      function () {
        var model = [
          { key:'Sine', value:'sine' },
          { key:'Sinusoid', value:'sine' }
        ];
        expect(WX.findKeyByValue(model, 'sine')).to.equal('Sine');
        expect(WX.findKeyByValue(model, 'sinusoid')).to.equal(null);
      }
    );
  });
  describe('findValueByKey(model, key)', function () {
    it('returns a key assodicated with a value. null when not found.',
      function () {
        var model = [
          { key:'Sine', value:'sine' },
          { key:'Sine', value:'sinusoid' }
        ];
        expect(WX.findValueByKey(model, 'Sine')).to.equal('sine');
        expect(WX.findValueByKey(model, 'Sawtooth')).to.equal(null);
      }
    );
  });
  describe('clamp(value, min, max)', function () {
    it('should clamp value into between min and max.', function () {
      expect(WX.clamp(1.5, 0.0, 1.0)).to.equal(1.0);
      expect(WX.clamp(-0.5, 0.0, 1.0)).to.equal(0.0);
    });
  });
  describe('random2f(min, max)', function () {
    it('should generate a floating point random value between min and max.',
      function () {
        var rnd = WX.random2f(0.0, 10.0);
        expect(rnd).to.be.within(0.0, 10.0);
        expect(parseInt(rnd, 10) === rnd).to.equal(false);
      }
    );
  });
  describe('random2(min, max)', function () {
    it('should generate an integer random value between min and max.',
      function () {
        var rnd = WX.random2(0, 10);
        expect(rnd).to.be.within(0, 10);
        expect(parseInt(rnd, 10) === rnd).to.equal(true);
      }
    );
  });
  describe('mtof(midi)', function () {
    it('should return frequency from MIDI pitch.', function () {
      expect(WX.mtof(69)).to.equal(440.0);
      expect(WX.mtof(-1500)).to.equal(0);
      expect(WX.mtof(1500)).to.equal(3.282417553401589e+38);
    });
  });
  describe('ftom(freq)', function () {
    it('should return MIDI pitch from frequency.', function () {
      expect(WX.ftom(440)).to.equal(69);
      expect(WX.ftom(-1)).to.equal(-1500);
      expect(WX.ftom(22050)).to.equal(136);
    });
  });
  describe('powtodb(power)', function () {
    it('should return decibel from signal power.', function () {
      expect(WX.powtodb(1.0)).to.equal(100.0);
      expect(WX.powtodb(10.0)).to.equal(110.0);
    });
  });
  describe('dbtopow(db)', function () {
    it('should return power from decibel.', function () {
      expect(WX.dbtopow(0.0)).to.equal(0.0);
      expect(WX.dbtopow(100.0)).to.equal(1.0);
    });
  });
  describe('rmstodb(rms)', function () {
    it('should return decibel from RMS.', function () {
      expect(WX.rmstodb(0.0)).to.equal(0.0);
      expect(WX.rmstodb(100.0)).to.equal(140.0);
    });
  });
  describe('dbtorms(db)', function () {
    it('should return RMS from decibel.', function () {
      expect(WX.dbtorms(0.0)).to.equal(0.0);
      expect(WX.dbtorms(100.0)).to.equal(1.0);
    });
  });
  describe('veltoamp(vel)', function () {
    it('should return linear amp from velocity.', function () {
      expect(WX.veltoamp(0)).to.equal(0);
      expect(WX.veltoamp(63)).to.equal(0.49606299212598426);
      expect(WX.veltoamp(64)).to.equal(0.5039370078740157);
      expect(WX.veltoamp(127)).to.equal(1.0);
    });
  });

});

// Core: Audio System
describe('Core: Audio System', function() {

  describe('context', function () {
    it('should be AudioContext.', function () {
      expect(typeof WX._ctx.createGain).to.equal('function');
    });
  });
  // TODO: there might be inconsistent between now and currentTime. be advise.
  describe('now (getter)', function () {
    it('should return current time in audio context.', function () {
      expect(WX.now).to.be.at.least(0.0);
      expect(WX.now).to.equal(WX._ctx.currentTime);
    });
  });
  describe('srate (getter)', function () {
    it('should return current sample rate of audio context.', function () {
      expect(WX.srate).to.be.above(22050);
      expect(WX.srate).to.equal(WX._ctx.sampleRate);
    });
  });
  describe('Gain()', function () {
    it('should return a gain node.', function () {
      expect(WX.Gain()).to.have.property('gain');
    });
  });
  describe('OSC()', function () {
    it('should return an oscillator node.', function () {
      expect(WX.OSC()).to.have.property('frequency');
    });
  });
  describe('Delay()', function () {
    it('should return a delay node.', function () {
      expect(WX.Delay()).to.have.property('delayTime');
    });
  });
  describe('Filter()', function () {
    it('should return a biquad filter node.', function () {
      expect(WX.Filter()).to.have.property('frequency');
    });
  });
  describe('Comp()', function () {
    it('should return a compressor node.', function () {
      expect(WX.Comp()).to.have.property('threshold');
    });
  });
  describe('Convolver()', function () {
    it('should return a convolver node.', function () {
      expect(WX.Convolver()).to.have.property('buffer');
    });
  });
  describe('WaveShaper()', function () {
    it('should return a waveshaper node.', function () {
      expect(WX.WaveShaper()).to.have.property('curve');
    });
  });
  describe('Source()', function () {
    it('should return a audio buffer source node.', function () {
      expect(WX.Source()).to.have.property('buffer');
    });
  });
  describe('Analyzer()', function () {
    it('should return an analyzer node.', function () {
      expect(WX.Analyzer()).to.have.property('fftSize');
    });
  });
  describe('Panner()', function () {
    it('should return a panner node.', function () {
      expect(WX.Panner()).to.have.property('panningModel');
    });
  });
  describe('PeriodicWave()', function () {
    it('should return a periodic wave object.', function () {
      var mag = new Float32Array(256),
          phase = new Float32Array(256),
          wave = WX.PeriodicWave(mag, phase);
      expect(typeof wave).to.equal('object');
    });
  });
  describe('Splitter()', function () {
    it('should return a channel splitter node.', function () {
      var splitter = WX.Splitter();
      expect(splitter.numberOfOutputs).to.equal(6);
    });
  });
  describe('Merger()', function () {
    it('should return a channel merger node.', function () {
      var merger = WX.Merger();
      expect(merger.numberOfInputs).to.equal(6);
    });
  });
  describe('Buffer()', function () {
    it('should return a buffer source.', function () {
      expect(WX.Buffer(2, 1.0, 44100).length).to.equal(1);
      expect(WX.Buffer(1, 2.0, 48000).length).to.equal(2);
    });
  });
  describe('Envelope(arg)', function () {
    it('should return an envelope generator.', function () {
      var env = WX.Envelope([0.0, 0.0], [0.8, 0.01, 1], [0.0, 0.3, 2]);
      var t = WX.now;
      expect(env(1.0, 0.5)).deep.equal([
        [0.0, 1.0, 0], [0.4, 1.01, 1], [0.0, 1.3, 2]
      ]);
    });
  });
  describe('defineParams(plugin, paramDefs)', function () {
    it('should define parameter instances in a plugin.', function () {
      var flag = false;
      var plugin = {
        params: {},
        $testParam: function () {
          flag = true;
        }
      };
      WX.defineParams(plugin, {
        'testParam': {
          type: 'Generic', unit: '',
          default: 0.01, min: 0.0, max: 1.0
        }
      });
      expect(plugin.params.testParam.get()).to.equal(0.01);
      plugin.params.testParam.set(0.5, 0, 0);
      expect(flag).to.equal(true);
      expect(plugin.params.testParam.get()).to.equal(0.5);
    });
  });
  describe('loadClip', function () {
    it('should return a audio buffer after xhr loading success.', function (done) {
      var clip = { name: 'ziggy', url: '../sound/loops/drums.mp3' };
      var progress = false, complete = false;
      WX.loadClip(clip,
        function (clip) {
          complete = true;
          expect(progress).to.equal(true);
          expect(complete).to.equal(true);
          expect(clip.buffer.duration).to.be.within(5.19, 5.24);
          done();
        },
        function (event) {
          progress = true;
          expect(event.loaded).to.be.within(0, event.total);
        }
      );
    });
  });

});

// Core: Plug-in Utilities
describe('Core: Plug-in Utilities', function () {

  // dummy setup for testing
  function MyGenerator(preset) {
    WX.PlugIn.defineType(this, 'Generator');
    WX.defineParams(this, {
      p1: {
        type: 'Boolean',
        default: false
      },
      p2: {
        type: 'Boolean',
        default: true
      }
    });
    WX.PlugIn.initPreset(this, preset);
  }

  MyGenerator.prototype = {
    info: {
      api_version: '1.0.0-alpha2',
      type: 'Generator'
    },
    defaultPreset: {
      p1: false,
      p2: true
    },
    $p1: function(value, time, xtype) {
      return value ? 'pass' : 'fail';
    },
    $p2: function(value, time, xtype) {
      return value ? 'pass' : 'fail';
    }
  };

  WX.PlugIn.extendPrototype(MyGenerator, 'Generator');

  function MyProcessor() {
    WX.PlugIn.defineType(this, 'Processor');
  }

  MyProcessor.prototype = {};

  WX.PlugIn.extendPrototype(MyProcessor, 'Processor');

  function MyAnalyzer() {
    WX.PlugIn.defineType(this, 'Analyzer');
  }

  MyAnalyzer.prototype = {};

  WX.PlugIn.extendPrototype(MyAnalyzer, 'Analyzer');

  var gen = new MyGenerator({
    p1: true,
    p2: false
  });
  var pro = new MyProcessor(),
      ana = new MyAnalyzer();

  describe('defineType(plugin, type)', function () {
    it('should import required components to plugin based on type specifier.',
      function () {
        expect(gen).to.contain.keys('params', '_output', '_outlet');
        expect(pro).to.contain.keys('params', '_inlet', '_bypass');
        expect(ana).to.contain.keys('params', '_inlet', '_input');
      }
    );
  });
  describe('extendPrototype(plugin, type)', function () {
    it('should extend prototype with core plugin methods.',
      function () {
        // generator
        expect(gen).to.respondTo('get');
        expect(gen).to.respondTo('set');
        expect(gen).to.respondTo('getPreset');
        expect(gen).to.respondTo('setPreset');
        expect(gen).to.respondTo('$output');
        expect(gen).to.respondTo('cut');
        expect(gen).to.respondTo('to');
        expect(gen.$p1(true)).to.equal('pass');
        expect(gen.$p2(false)).to.equal('fail');
        // processor
        expect(pro).to.respondTo('get');
        expect(pro).to.respondTo('set');
        expect(pro).to.respondTo('getPreset');
        expect(pro).to.respondTo('setPreset');
        expect(pro).to.respondTo('$bypass');
        expect(pro).to.respondTo('$input');
        expect(pro).to.respondTo('$output');
        expect(pro).to.respondTo('cut');
        expect(pro).to.respondTo('to');
        // analyzer
        expect(ana).to.respondTo('get');
        expect(ana).to.respondTo('set');
        expect(ana).to.respondTo('getPreset');
        expect(ana).to.respondTo('setPreset');
        expect(ana).to.respondTo('$input');
        expect(ana).to.respondTo('cut');
        expect(ana).to.respondTo('to');
      }
    );
  });
  describe('initPreset(plugin, preset)', function () {
    it('should initialize plugin preset from arguments and default preset.',
      function () {
        expect(gen.get('p1')).to.equal(true);
        expect(gen.get('p2')).to.equal(false);
      }
    );
  });
  describe('register(pluginConstructor)', function () {
    it('should register plugin class under namespace WX.',
      function () {
        WX.PlugIn.register(MyGenerator);
        var myGen = WX.MyGenerator();
        expect(myGen).to.respondTo('get');
        expect(myGen).to.respondTo('set');
        expect(myGen).to.respondTo('getPreset');
        expect(myGen).to.respondTo('setPreset');
        expect(myGen).to.respondTo('$output');
        expect(myGen).to.respondTo('cut');
        expect(myGen).to.respondTo('to');
        expect(myGen.$p1(true)).to.equal('pass');
        expect(myGen.$p2(false)).to.equal('fail');
      }
    );
  });

});

// Stock PlugIn: Fader
// Because Fader is included in the core as 'WX.Master'
describe('Plug-in: Fader', function () {
  it('should set parameters correctly. (BEEP)', function (done) {
    // test patch: osc is needed to run the AudioParam automation
    var osc = WX.OSC();
    var fader = WX.Fader({ bypass: true });
    osc.start(0);
    osc.to(fader._inlet);
    fader.to(WX.Master);
    fader.set('input', 0.25);
    fader.set('dB', -6.0);
    // test preset values
    var preset = fader.getPreset();
    expect(fader._inlet).to.have.property('gain');
    expect(fader._outlet).to.have.property('gain');
    expect(preset.bypass).to.equal(true);
    expect(preset.mute).to.equal(false);
    expect(preset.input).to.equal(0.25);
    expect(preset.dB).to.equal(-6.0);
    expect(fader.info.name).to.equal('Fader');
    // TO FIX (hoch): revise .set method for all 3 browsers. Chrome and Safari
    // work same way, so fix this for the FireFox.
    setTimeout(function () {
      fader._output.gain.cancel(0);
      expect(fader._output.gain.value).to.equal(0.5011872053146362);
      osc.stop(0);
      done();
    }, 100);
  });
});