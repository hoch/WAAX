/**
 * test-timebase.js
 *
 * @description   mocha + chai test suite for WAAX:timebase library
 * @author        hoch (hongchan.choi@gmail.com)
 * @version       1.0.0-alpha2
 */


// caching
var expect = chai.expect,
    should = chai.should();

var TX = WX.Transport;

// test data
var TEST_DATA = [
  [0, 0, 997, 1007], [1, 1, 534, 613], [2, 2, 988, 1102],
  [3, 3, 85, 141], [4, 4, 1001, 1108], [5, 5, 722, 832],
  [6, 6, 751, 779], [7, 7, 720, 730], [8, 8, 1188, 1265],
  [9, 9, 992, 1007], [10, 10, 255, 374], [11, 11, 143, 158],
  [12, 12, 565, 684], [13, 13, 286, 327], [14, 14, 215, 264],
  [15, 15, 806, 833], [16, 16, 255, 269], [17, 17, 134, 216],
  [18, 18, 993, 1102], [19, 19, 1006, 1114], [20, 20, 794, 813],
  [21, 21, 773, 807], [22, 22, 1065, 1088], [23, 23, 1010, 1051],
  [24, 24, 792, 840], [25, 25, 1114, 1178], [26, 26, 266, 318],
  [27, 27, 1005, 1034], [28, 28, 307, 391], [29, 29, 573, 676],
  [30, 30, 701, 805], [31, 31, 648, 687], [32, 32, 437, 474],
  [33, 33, 158, 265], [34, 34, 680, 718], [35, 35, 227, 337],
  [36, 36, 510, 592], [37, 37, 792, 825], [38, 38, 260, 294],
  [39, 39, 518, 590], [40, 40, 350, 419], [41, 41, 493, 562],
  [42, 42, 968, 993], [43, 43, 721, 746], [44, 44, 299, 340],
  [45, 45, 484, 557], [46, 46, 485, 505], [47, 47, 1091, 1149],
  [48, 48, 800, 826], [49, 49, 360, 443], [50, 50, 356, 463],
  [51, 51, 668, 753], [52, 52, 227, 248], [53, 53, 245, 321],
  [54, 54, 457, 487], [55, 55, 1059, 1139], [56, 56, 1148, 1190],
  [57, 57, 12, 31], [58, 58, 799, 852], [59, 59, 515, 529],
  [60, 60, 627, 682], [61, 61, 651, 678], [62, 62, 431, 535],
  [63, 63, 1082, 1147], [64, 64, 1189, 1288], [65, 65, 1085, 1147],
  [66, 66, 819, 935], [67, 67, 658, 685], [68, 68, 941, 1010],
  [69, 69, 587, 702], [70, 70, 434, 495], [71, 71, 35, 60],
  [72, 72, 677, 792], [73, 73, 230, 307], [74, 74, 149, 183],
  [75, 75, 303, 357], [76, 76, 632, 683], [77, 77, 484, 576],
  [78, 78, 415, 432], [79, 79, 781, 838], [80, 80, 556, 577],
  [81, 81, 55, 164], [82, 82, 522, 550], [83, 83, 566, 626],
  [84, 84, 1012, 1061], [85, 85, 734, 789], [86, 86, 587, 685],
  [87, 87, 232, 248], [88, 88, 707, 729], [89, 89, 199, 230],
  [90, 90, 683, 710], [91, 91, 183, 221], [92, 92, 495, 503],
  [93, 93, 271, 291], [94, 94, 34, 137], [95, 95, 392, 454],
  [96, 96, 499, 595], [97, 97, 99, 126], [98, 98, 808, 916],
  [99, 99, 832, 885], [100, 100, 995, 1024], [101, 101, 808, 907],
  [102, 102, 1041, 1148], [103, 103, 126, 225], [104, 104, 467, 570],
  [105, 105, 150, 160], [106, 106, 519, 571], [107, 107, 106, 125],
  [108, 108, 1072, 1184], [109, 109, 1121, 1178], [110, 110, 84, 194],
  [111, 111, 851, 954], [112, 112, 383, 469], [113, 113, 1135, 1187],
  [114, 114, 540, 576], [115, 115, 804, 892], [116, 116, 1146, 1212],
  [117, 117, 244, 353], [118, 118, 359, 468], [119, 119, 311, 362],
  [120, 120, 324, 378], [121, 121, 841, 881], [122, 122, 264, 288],
  [123, 123, 737, 815], [124, 124, 510, 525], [125, 125, 245, 286],
  [126, 126, 222, 266]
];


/**
 * Utilities
 */

describe('Timebase: Util', function() {

  describe('mbst2tick(mtime)', function () {
    it('should return tick from MBST time.', function () {
      expect(WX.mbst2tick({ beat: 0, tick: 240 })).to.equal(240);
      expect(WX.mbst2tick({ beat: 1, tick: 0 })).to.equal(480);
      expect(WX.mbst2tick({ beat: 1, tick: 240 })).to.equal(720);
    });
  });

  describe('tick2mbst(tick)', function () {
    it('should return MBST format from tick.', function () {
      expect(WX.tick2mbst(240)).deep.equal({
        measure: 0, beat: 0, sixteenth: 2, tick: 0
      });
      expect(WX.tick2mbst(480)).deep.equal({
        measure: 0, beat: 1, sixteenth: 0, tick: 0
      });
      expect(WX.tick2mbst(740)).deep.equal({
        measure: 0, beat: 1, sixteenth: 2, tick: 20
      });
    });
  });

});


/**
 * @class Note
 */

describe('Timebase: Note', function() {

  describe('WX.Note(pitch, velocity, start, duration)', function () {
    it('should return a Note object.', function () {
      var note1 = WX.Note(60, 64, 0, 120);
      expect(note1).to.have.property('pitch', 60);
      expect(note1).to.have.property('velocity', 64);
      expect(note1).to.have.property('start', 0);
      expect(note1).to.have.property('duration', 120);
    });
  });

  describe('changeDuration(delta)', function () {
    it('should change note duration.', function () {
      var note = WX.Note(60, 64, 0, 120);
      note.changeDuration(120);
      expect(note).to.have.property('duration', 240);
    });
  });

  describe('setNote(Note)', function () {
    it('should copy note properties.', function () {
      var note1 = WX.Note(1, 2, 3, 4),
          note2 = WX.Note();
      note2.setNote(note1);
      expect(note2).deep.equal(note1);
    });
  });

  describe('translatePitch(delta)', function () {
    it('should move note`s pitch by delta.', function () {
      var note = WX.Note(60, 64, 0, 120);
      note.translatePitch(32);
      expect(note).to.have.property('pitch', 92);
      note.translatePitch(64);
      expect(note).to.have.property('pitch', 127);
      note.translatePitch(-128);
      expect(note).to.have.property('pitch', 0);
    });
  });

  describe('translateStart(delta)', function () {
    it('should move a note tick by delta.', function () {
      var note = WX.Note(60, 64, 0, 120);
      note.translateStart(10);
      expect(note).to.have.property('start', 10);
      expect(note.getEnd()).to.equal(130);
      note.translateStart(-20);
      expect(note).to.have.property('start', 0);
      expect(note.getEnd()).to.equal(120);
    });
  });

  describe('valueOf()', function () {
    it('should return start time for easier comparison.', function () {
      var note1 = WX.Note(60, 64, 0, 120),
          note2 = WX.Note(60, 64, 120, 240);
      expect(note1 < note2).to.equal(true);
    });
  });

  describe('toString()', function () {
    it('should return string from data.', function () {
      var note1 = WX.Note(60, 64, 0, 120);
      expect(note1.toString()).to.equal('60,64,0,120');
    });
  });

});


/**
 * @class  NoteClip
 */

describe('Timebase: NoteClip', function() {

  describe('push(note)', function () {
    it('should push multiple notes into a clip.', function () {
      var noteclip = WX.NoteClip();
      for (var i = 0; i < TEST_DATA.length; i++) {
        noteclip.push(WX.Note.apply(WX, TEST_DATA[i]));
      }
      expect(noteclip.getSize()).to.equal(127);
    });
  });

  describe('findNoteIdAtPosition(pitch, tick)', function () {
    it('should return a note at pitch/tick position.', function () {
      var noteclip = WX.NoteClip();
      for (var n = 0; n < 10; n++) {
        noteclip.push(WX.Note(60 + n, 64, 120 * n, 120 * n + 120));
      }
      expect(noteclip.findNoteIdAtPosition(60, 60)).to.not.equal(null);
      expect(noteclip.findNoteIdAtPosition(61, 60)).to.equal(null);
    });
  });

  describe('findNotesIdInArea(minPitch, maxPitch, startTick, endTick)',
    function () {
      it('should return notes at in pitch/time area.', function () {
        var noteclip = WX.NoteClip();
        for (var n = 0; n < 10; n++) {
          noteclip.push(WX.Note(60 + n, 64, 120 * n, 120 * n + 120));
        }
        expect(noteclip.findNotesIdInArea(62, 64, 60, 240)).to.have.length(1);
        expect(noteclip.findNotesIdInArea(66, 69, 600, 960)).to.have.length(3);
        expect(noteclip.findNotesIdInArea(60, 69, 0, 1200)).to.have.length(10);
      }
    );
  });

  describe('scanNotesInTimeSpan(start, end)', function () {
    it('should return notes at between start/end time.', function () {
      var noteclip = WX.NoteClip();
      for (var n = 0; n < 10; n++) {
        noteclip.push(WX.Note(60 + n, 64, 120 * n, 120 * n + 120));
      }
      expect(noteclip.scanNotesInTimeSpan(60, 240)).to.have.length(2);
      expect(noteclip.scanNotesInTimeSpan(600, 960)).to.have.length(4);
      expect(noteclip.scanNotesInTimeSpan(0, 1200)).to.have.length(10);
    });
  });

  describe('getSize()', function () {
    it('should return note clip size.', function () {
      var noteclip = WX.NoteClip();
      var data = [];
      for (var n = 0; n < 4; n++) {
        data.push(WX.Note(60 + n, 64, 120 * n, 120 * n + 120));
      }
      var id0 = noteclip.push(data[0]);
      var id1 = noteclip.push(data[1]);
      noteclip.push(data[2]);
      expect(noteclip.getSize()).to.equal(3);
      noteclip.delete(id0);
      expect(noteclip.getSize()).to.equal(2);
      noteclip.delete(id1);
      expect(noteclip.getSize()).to.equal(1);
    });
  });

  describe('empty()', function () {
    it('should empty the list.', function () {
      var input = [];
      for (var n = 0; n < 10; n++) {
        var start = ~~(Math.random() * 1200);
        input.push(WX.Note(60, 64, start, start + 120));
      }
      var noteclip = WX.NoteClip();
      for (var i = 0; i < input.length; i++) {
        noteclip.push(input[i]);
      }
      noteclip.empty();
      expect(noteclip.getSize()).to.equal(0);
    });
  });

  describe('iterate(callback)', function () {
    it('should iterate all items with callback function.', function () {
      var id = [],
          noteclip = WX.NoteClip();
      for (var n = 0; n < 3; n++) {
        id[n] = noteclip.push(WX.Note(60 + n, 64, 120 * n, 120 * n + 120));
      }
      noteclip.iterate(function (id, note, index) {
        note.duration *= 0.5;
        note.start *= 0.5;
      });
      expect(noteclip.get([id[0]])).to.have.property('start', 0);
      expect(noteclip.get([id[1]])).to.have.property('start', 60);
      expect(noteclip.get([id[2]])).to.have.property('duration', 180);
    });
  });

  describe('delete(note)', function () {
    it('should delete items from noteclip.', function () {
      var id, noteclip = WX.NoteClip();
      for (var i = 0; i < TEST_DATA.length; i++) {
        noteclip.push(WX.Note.apply(WX, TEST_DATA[i]));
      }
      id = noteclip.getAllId();
      for (i = 0; i < ~~(TEST_DATA.length / 2); i++) {
        noteclip.delete(id[i]);
      }
      var rest = TEST_DATA.length - ~~(TEST_DATA.length / 2);
      expect(noteclip.getSize()).deep.equal(rest);
    });
  });

  describe('hasId(id)', function () {
    it('should return true if a note with a certain id exists in the clip.',
      function () {
        var noteclip = WX.NoteClip(), id;
        for (var i = 0; i < TEST_DATA.length; i++) {
          noteclip.push(WX.Note.apply(WX, TEST_DATA[i]));
        }
        id = noteclip.getAllId();
        expect(noteclip.hasId(id[0])).to.equal(true);
        expect(noteclip.hasId('x071')).to.equal(false);
      }
    );
  });

});


/**
 * @class  Transporter
 */

describe('Timebase: Transport', function() {

  beforeEach(function () {
    // this will reset BPM/oldBPM to 120
    TX.setBPM(120);
    TX.setBPM(120);
    TX.setNow(0);
  });

  // OK
  describe('tick2sec(tick)', function () {
    it('should convert tick to second.', function () {
      expect(TX.tick2sec(480)).to.equal(0.5);
      TX.setBPM(60);
      expect(TX.tick2sec(480)).to.equal(1.0);
    });
  });

  // OK
  describe('sec2tick(sec)', function () {
    it('should convert second to tick.', function () {
      expect(TX.sec2tick(1.0)).to.equal(960);
      TX.setBPM(60);
      expect(TX.sec2tick(1.0)).to.equal(480);
    });
  });

  // OK
  describe('setBPM(BPM)', function () {
    it('should set current BPM and rearrange timeline.', function () {
      TX.setBPM(60); // BPM 120 -> BPM 60
      expect(TX._BPM).to.equal(60);
      expect(TX._BIS).to.equal(1);
      expect(TX._TIS).to.be.within(0.002083, 0.002084);
      expect(TX._lookAhead).to.be.within(0.033333, 0.033334);
    });
  });

  // OK
  describe('setNow(tick)', function () {
    it('should set current playback position in tick.', function () {
      TX.setNow(240);
      expect(TX.tick2sec(TX.getNow())).to.equal(0.25);
      TX.setBPM(60);
      TX.setNow(240);
      expect(TX.tick2sec(TX.getNow())).to.equal(0.5);
    });
  });

  // OK
  describe('setLoop(start, end)', function () {
    it('should set loop points in tick.', function () {
      TX.setLoopStart(120);
      TX.setLoopEnd(480);
      expect(TX._loopStart).to.equal(0.125);
      expect(TX._loopEnd).to.equal(0.5);
    });
  });

  describe('getBPM()', function () {
    it('should return current BPM.', function () {
      expect(TX.getBPM()).to.equal(120);
      TX.setBPM(60);
      expect(TX.getBPM()).to.equal(60);
    });
  });

  describe('getNow()', function () {
    it('should return current playhead position in tick.', function () {
      TX.setNow(480);
      // logic: tick is musical unit, does not change on BPM change
      TX.setBPM(60);
      expect(TX.getNow()).to.equal(480);
      TX.setBPM(120);
      expect(TX.getNow()).to.equal(480);
    });
  });

  describe('Timed operation: start(), pause(), rewind()', function () {
    it('should start, pause and rewind properly.', function (done) {
      TX.start();
      setTimeout(function () {
        expect(TX.isRunning()).to.equal(true);
        // when BPM=120, 500ms is 1 beat, that is 480 tick.
        expect(TX.getNow()).to.be.within(465, 505);
        setTimeout(function () {
          TX.pause();
          expect(TX.isRunning()).to.equal(false);
          // when BPM=120, 1000ms is 2 beats, that is 960 tick.
          expect(TX.getNow()).to.be.within(945, 990);
          TX.rewind();
          expect(TX.getNow()).to.be.equal(0.0);
          done();
        }, 500);
      }, 500);
    });
  });

});