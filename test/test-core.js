/**
 * test-core.js
 *
 * @description   mocha + chai test suite for WAAX Core (0.0.1)
 * @author        hoch (hongchan.choi@gmail.com)
 * @version       0.0.1
 */


// caching
var expect = chai.expect,
    should = chai.should();


/**
 * Info and Log
 */

describe('System: Info and Log', function() {

  describe('Info.getVersion()', function () {
    it('should return API version number.', function () {
      expect(WX.Info.getVersion()).to.equal('0.0.1-alpha');
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

});


/**
 * Util
 *
 * isObject, isArray, isNumber, hasParam, extend, clone,
 * clamp, random2f, random2, mtof, ftom, powtodb, dbtopow, rmstodb, dbtorms,
 * patch(TBD)
 */

describe('System: Utilities', function() {

  // Object utilities
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
  describe('hasParam(unit, param)', function () {
    it('should return true when plugin has the parameter.', function () {
      var unit = { preset: { 'parameter': 0.0 } };
      expect(WX.hasParam(unit, 'parameter')).to.equal(true);
      expect(WX.hasParam(unit, 'notParameter')).to.equal(false);
    });
  });
  describe('extend(target, source)', function () {
    it('should add source to target object and return the extended target.', function () {
      var source = { a: 1, b: 2 },
          target = { b: 3, c: 4 },
          result = { a: 1, b: 3, c: 4 };
      expect(WX.extend(target, source)).deep.equal(result);
    });
  });
  describe('clone(source)', function () {
    it('should return a cloned object.', function () {
      var source = { a: 1, b: 2 },
          result = { a: 1, b: 2 };
      expect(WX.clone(source)).deep.equal(result);
    });
  });

  // Musicmath utilities
  describe('clamp(value, min, max)', function () {
    it('should clamp value into between min and max.', function () {
      expect(WX.clamp(1.5, 0.0, 1.0)).to.equal(1.0);
      expect(WX.clamp(-0.5, 0.0, 1.0)).to.equal(0.0);
    });
  });
  describe('random2f(min, max)', function () {
    it('should generate a floating point random value between min and max.', function () {
      var rnd = WX.random2f(0.0, 10.0);
      expect(rnd).to.be.within(0.0, 10.0);
      expect(parseInt(rnd, 10) === rnd).to.equal(false);
    });
  });
  describe('random2(min, max)', function () {
    it('should generate an integer random value between min and max.', function () {
      var rnd = WX.random2(0, 10);
      expect(rnd).to.be.within(0, 10);
      expect(parseInt(rnd, 10) === rnd).to.equal(true);
    });
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
  describe('powtodb(pow)', function () {
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
  describe('patch(args)', function () {
    it('TBD: should patch plugin units in arguments.', function () {
      // TBD
    });
  });

});


/**
 * Core
 */

describe('System: Core', function() {

  describe('context', function () {
    it('should be AudioContext.', function () {
      expect(WX.context.constructor.name).to.equal('AudioContext');
    });
  });
  describe('now (getter)', function () {
    it('should return current time in audio context.', function () {
      expect(WX.now).to.be.above(0.0);
      expect(WX.now).to.equal(WX.context.currentTime);
    });
  });
  describe('srate (getter)', function () {
    it('should return current sample rate of audio context.', function () {
      expect(WX.srate).to.be.above(22050);
      expect(WX.srate).to.equal(WX.context.sampleRate);
    });
  });
  describe('Gain()', function () {
    it('should return a gain node.', function () {
      expect(WX.Gain().constructor.name).to.equal('GainNode');
    });
  });
  describe('OSC()', function () {
    it('should return an oscillator node.', function () {
      expect(WX.OSC().constructor.name).to.equal('OscillatorNode');
    });
  });
  describe('Delay()', function () {
    it('should return a delay node.', function () {
      expect(WX.Delay().constructor.name).to.equal('DelayNode');
    });
  });
  describe('Filter()', function () {
    it('should return a biquad filter node.', function () {
      expect(WX.Filter().constructor.name).to.equal('BiquadFilterNode');
    });
  });
  describe('Comp()', function () {
    it('should return a compressor node.', function () {
      expect(WX.Comp().constructor.name).to.equal('DynamicsCompressorNode');
    });
  });
  describe('Convolver()', function () {
    it('should return a convolver node.', function () {
      expect(WX.Convolver().constructor.name).to.equal('ConvolverNode');
    });
  });
  describe('WaveShaper()', function () {
    it('should return a waveshaper node.', function () {
      expect(WX.WaveShaper().constructor.name).to.equal('WaveShaperNode');
    });
  });
  describe('Source()', function () {
    it('should return a audio buffer source node.', function () {
      expect(WX.Source().constructor.name).to.equal('AudioBufferSourceNode');
    });
  });
  describe('Analyzer()', function () {
    it('should return an analyzer node.', function () {
      expect(WX.Analyzer().constructor.name).to.equal('AnalyserNode');
    });
  });
  describe('Panner()', function () {
    it('should return a panner node.', function () {
      expect(WX.Panner().constructor.name).to.equal('PannerNode');
    });
  });
  describe('Splitter()', function () {
    it('should return a channel splitter node.', function () {
      expect(WX.Splitter().constructor.name).to.equal('ChannelSplitterNode');
      expect(WX.Splitter(1, 2).constructor.name).to.equal('ChannelSplitterNode');
      expect(WX.Splitter(1, 6).constructor.name).to.equal('ChannelSplitterNode');
    });
  });
  describe('Merger()', function () {
    it('should return a channel merger node.', function () {
      expect(WX.Merger().constructor.name).to.equal('ChannelMergerNode');
      expect(WX.Merger(2, 1).constructor.name).to.equal('ChannelMergerNode');
      expect(WX.Merger(6, 1).constructor.name).to.equal('ChannelMergerNode');
    });
  });
  describe('Buffer()', function () {
    it('should return a buffer source.', function () {
      expect(WX.Buffer(2, 1.0, 44100).constructor.name).to.equal('AudioBuffer');
      expect(WX.Buffer(1, 2.0, 48000).constructor.name).to.equal('AudioBuffer');
    });
  });

});


/**
 * Web Audio API utils and wrappers
 */
describe('Envelope, Param and Clip loading', function () {
  describe('Envelope', function () {
    it('should return an envelope generator.', function () {
      var env = WX.Envelope([0.0, 0.0], [0.8, 0.01, 1], [0.0, 0.3, 2]);
      var t = WX.now;
      expect(env(1.0)).deep.equal([
        [0.0, 1.0, 0], [0.8, 1.01, 1], [0.0, 1.3, 2]
      ]);
      expect(env(t)).deep.equal([
        [0.0, t + 0.0, 0], [0.8, t + 0.01, 1], [0.0, t + 0.3, 2]]
      );
    });
  });
  describe('Param', function () {
    it('should return a WAAX parameter wrapper object.', function () {
      var o = WX.OSC();
      var freq = new WX.Param({
        type: 'number', default: 440, min: 20.0, max: 1000.0,
        target: o.frequency
      });
      var waveform = new WX.Param({
        type: 'enum', default: 'triangle',
        items: ['sine', 'triangle', 'square', 'sawtooth'],
        target: o.type
      });
      expect(freq.get()).to.equal(440);
      expect(freq.get()).to.equal(freq.default);
      expect(waveform.get()).to.equal('triangle');
    });
  });
  // TODO: this test should be fixed to async testing
  describe('loadClip', function () {
    it('should return a audio buffer after xhr loading success.', function (done) {
      var clip = { name: 'ziggy', url: '../sound/hochkit/fx-001.wav' };
      var progress = false, complete = false;
      WX.loadClip(clip,
        function (event) {
          progress = true;
          expect(event.loaded).to.be.within(0, event.totalSize);
        },
        function (buffer) {
          complete = true;
          expect(progress).to.equal(true);
          expect(complete).to.equal(true);
          expect(buffer.constructor.name).to.equal('AudioBuffer');
          expect(clip.buffer.constructor.name).to.equal('AudioBuffer');
          done();
      });
    });
  });
});


/**
 * Plug-in: Fader
 */
describe('Plug-in: Fader', function () {
  it('should work with essential features.', function (done) {

    var fader = WX.Fader();
    fader.to(WX.Master);
    fader.set('active', false);
    fader.set('inputGain', 0.25);
    fader.set('gain', 0.5);

    expect(fader._inlet.constructor.name).to.equal('GainNode');
    expect(fader._outlet.constructor.name).to.equal('GainNode');
    expect(fader.preset.active).to.equal(false);
    expect(fader.preset.mute).to.equal(true);
    expect(fader.preset.inputGain).to.equal(0.25);
    expect(fader.preset.dB).to.equal(-6.020599913279623);
    expect(fader.info.name).to.equal('Fader');
    done();

  });
});
