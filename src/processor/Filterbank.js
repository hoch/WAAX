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
 * WX._unit.filterbank : WX.Filterbank
 * @file filterbank with 8 bandpass filters
 */
WX._unit.filterbank = function (options) {
  // mixin processor prototype
  WX._unit.processor.call(this);

  // number of filters
  this._numFilters = 8;

  // building audio graph
  this._filterNodes1 = [];
  this._filterNodes2 = [];
  this._gainNodes = [];
  this._summingGainNode = WX.context.createGain();
  for (var i = 0; i < this._numFilters; ++i) {
    this._filterNodes1[i] = WX.context.createBiquadFilter();
    this._filterNodes2[i] = WX.context.createBiquadFilter();
    this._gainNodes[i] = WX.context.createGain();
    this._filterNodes1[i].type = "bandpass";
    this._filterNodes2[i].type = "bandpass";
    this._inputGain.connect(this._filterNodes1[i]);
    this._filterNodes1[i].connect(this._filterNodes2[i]);
    this._filterNodes2[i].connect(this._gainNodes[i]);
    this._gainNodes[i].connect(this._summingGainNode);
  }
  this._summingGainNode.connect(this._outputGain);
  this._summingGainNode.gain.setValueAtTime(0.0001, WX.now);
  this._summingGainNode.gain.linearRampToValueAtTime(10.0, WX.now+0.1);

  // pitch (fundamental)
  this._fundamental = WX.pitch2freq(41);
  // base detune parameter and its factor
  this._detune = 100;
  this._detuneFactor = 0.0;
  // gain slope of filters
  this._slope = 0.5;
  // filter width
  this._width = 0.5;
  // current chord type: ionian
  this._currentChord = this._chord.ion;

  // target filter parameters
  this._freqs = [];
  this._Qs = [];
  this._gains = [];

  // initialization for filters (to avoid popping)
  this._calculateFrequency();
  this._calculateWidth();
  this._calculateGain();
  this._setParams();

  // post-building: parameter binding
  this._initializeParams(options, this._default);
};

WX._unit.filterbank.prototype = {

  label: "filterbank",

  _default: {
    pitch: 41,
    chord: "lydian",
    slope: 0.08,
    width: 0.2,
    detune: 0.0
  },

  // pre-defined pitch sets: ionian, lydian, aeolian, mixolydian
  _chord: {
    ion: [0, 7, 14, 21, 28, 35, 43, 48],
    lyd: [0, 6, 16, 21, 26, 35, 42, 48],
    aeo: [0, 7, 15, 22, 26, 34, 39, 48],
    mix: [0, 5, 16, 23, 26, 33, 41, 48]
  },

  _calculateFrequency: function () {
    for (var i = 0; i < this._numFilters; ++i) {
      this._freqs[i] = this._fundamental * Math.pow(2, this._currentChord[i % 8]/12);
    }
  },

  _calculateWidth: function () {
    for (var i = 0; i < this._numFilters; ++i) {
      // inverse cubed curve for width
      this._Qs[i] = 6 + 60 * Math.pow((1 - i / this._numFilters), this._width);
    }
  },

  _calculateGain: function () {
    // hand-tuned range
    this._slope = WX.clamp(this._slope, 0.12, 1.0);
    for (var i = 0; i < this._numFilters; ++i) {
      // balancing formula (lowpass, highpass, or concave)
      var factor = 1.0 + Math.sin(Math.PI + (Math.PI/2 * (this._slope + i / this._numFilters)));
      this._gains[i] = factor;
    }
  },

  _setParams: function () {
    for (var i = 0; i < this._numFilters; ++i) {
      this._filterNodes1[i].frequency.setValueAtTime(this._freqs[i], WX.now);
      this._filterNodes2[i].frequency.setValueAtTime(this._freqs[i], WX.now);
      this._filterNodes1[i].detune.setValueAtTime(this._detune, WX.now);
      this._filterNodes2[i].detune.setValueAtTime(this._detune, WX.now);
      this._filterNodes1[i].Q.setValueAtTime(this._Qs[i], WX.now);
      this._filterNodes2[i].Q.setValueAtTime(this._Qs[i], WX.now);
      this._gainNodes[i].gain.setValueAtTime(this._gains[i], WX.now);
    }
  },

  _rampToParams: function (rampDuration) {
    var moment = WX.now + (rampDuration || 0.04);
    var detune = this._detune * this._detuneFactor;
    for (var i = 0; i < this._numFilters; ++i) {
      this._filterNodes1[i].frequency.exponentialRampToValueAtTime(this._freqs[i], moment);
      this._filterNodes2[i].frequency.exponentialRampToValueAtTime(this._freqs[i], moment);
      this._filterNodes1[i].detune.linearRampToValueAtTime(detune, moment);
      this._filterNodes2[i].detune.linearRampToValueAtTime(-detune, moment);
      this._filterNodes1[i].Q.linearRampToValueAtTime(this._Qs[i], moment);
      this._filterNodes2[i].Q.linearRampToValueAtTime(this._Qs[i], moment);
      this._gainNodes[i].gain.linearRampToValueAtTime(this._gains[i], moment);
    }
    //console.log(this._width, this._slope);
  },

  pitch: function (pitch, rampDuration) {
    this._fundamental = WX.pitch2freq(pitch);
    this._calculateFrequency();
    this._rampToParams(rampDuration);
  },

  chord: function (type) {
    if (type) {
      switch (type) {
      case 1: case "ionian":
        this._currentChord = this._chord.ion;
        break;
      case 2: case "lydian":
        this._currentChord = this._chord.lyd;
        break;
      case 3: case "aeolian":
        this._currentChord = this._chord.aeo;
        break;
      case 4: case "mixolydian":
        this._currentChord = this._chord.mix;
        break;
      }
      this._calculateFrequency();
      this._rampToParams();
    } else {
      return this._currentChord;
    }
  },

  width: function (value, rampDuration) {
    this._width = value;
    this._calculateWidth();
    this._rampToParams(rampDuration);
  },

  slope: function (value, rampDuration) {
    this._slope = value;
    this._calculateGain();
    this._rampToParams(rampDuration);
  },

  detune: function (amount, rampDuration) {
    this._detuneFactor = amount;
    this._rampToParams(rampDuration);
  }
};

WX._unit.extend(WX._unit.filterbank.prototype, WX._unit.processor.prototype);