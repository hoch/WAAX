/**
 * test-timebase.js
 *
 * @description   mocha + chai test suite for WAAX:timebase library
 * @author        hoch (hongchan.choi@gmail.com)
 * @version       1.0.0
 */


// caching
var expect = chai.expect,
    should = chai.should();

// test setup
var TB = Timebase;
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

  describe('tick2mbt(tick)', function () {
    it('should return MBT time from ticks.', function () {
      expect(TB.Util.tick2mbt(240)).deep.equal({ beat: 0, tick: 240 });
      expect(TB.Util.tick2mbt(480)).deep.equal({ beat: 1, tick: 0 });
      expect(TB.Util.tick2mbt(720)).deep.equal({ beat: 1, tick: 240 });
    });
  });

  describe('mbt2tick(mbt)', function () {
    it('should return ticks from MBT time.', function () {
      expect(TB.Util.mbt2tick({ beat: 0, tick: 240 })).to.equal(240);
      expect(TB.Util.mbt2tick({ beat: 1, tick: 0 })).to.equal(480);
      expect(TB.Util.mbt2tick({ beat: 1, tick: 240 })).to.equal(720);
    });
  });

});



/**
 * @class Note
 */

describe('Timebase: Note', function() {

  describe('Timebase.createNote(args)', function () {
    it('should return a Note object.', function () {
      var note1 = TB.createNote(60, 64, 0, 120),
          note2 = TB.createNote(note1);
      expect(note1).to.have.property('pitch', 60);
      expect(note1).to.have.property('velo', 64);
      expect(note2).to.have.property('start', 0);
      expect(note2).to.have.property('end', 120);
    });
  });

  describe('get()', function () {
    it('should return note data.', function () {
      var note = TB.createNote(60, 64, 0, 120),
          data = note.get();
      expect(data).to.have.property('pitch', 60);
      expect(data).to.have.property('velo', 64);
      expect(data).to.have.property('start', 0);
      expect(data).to.have.property('end', 120);
    });
  });

  describe('getDuration()', function () {
    it('should return note duration.', function () {
      var note = TB.createNote(60, 64, 0, 120);
      expect(note.getDuration()).to.equal(120);
    });
  });

  describe('movePitch(delta)', function () {
    it('should move note`s pitch by delta.', function () {
      var note = TB.createNote(60, 64, 0, 120);
      note.movePitch(32);
      expect(note).to.have.property('pitch', 92);
      note.movePitch(64);
      expect(note).to.have.property('pitch', 127);
      note.movePitch(-128);
      expect(note).to.have.property('pitch', 0);
    });
  });

  describe('moveTime(delta)', function () {
    it('should move a note tick by delta.', function () {
      var note = TB.createNote(60, 64, 0, 120);
      note.moveTime(10);
      expect(note).to.have.property('start', 10);
      expect(note).to.have.property('end', 130);
      note.moveTime(-20);
      expect(note).to.have.property('start', 0);
      expect(note).to.have.property('end', 120);
    });
  });

  describe('moveStart(delta)', function () {
    it('should move note`s start tick by delta.', function () {
      var note = TB.createNote(60, 64, 0, 120);
      note.moveStart(10);
      expect(note).to.have.property('start', 10);
      note.moveStart(110);
      expect(note).to.have.property('start', 119);
      note.moveStart(-120);
      expect(note).to.have.property('start', 0);
    });
  });

  describe('moveEnd(delta)', function () {
    it('should move note`s end tick by delta.', function () {
      var note = TB.createNote(60, 64, 0, 120);
      note.moveEnd(-10);
      expect(note).to.have.property('end', 110);
      note.moveEnd(-110);
      expect(note).to.have.property('end', 1);
    });
  });

  describe('valueOf()', function () {
    it('should return start time for easier comparison.', function () {
      var note1 = TB.createNote(60, 64, 0, 120),
          note2 = TB.createNote(60, 64, 120, 240);
      expect(note1 < note2).to.equal(true);
    });
  });

  describe('toString()', function () {
    it('should return string from data.', function () {
      var note1 = TB.createNote(60, 64, 0, 120);
      expect(note1.toString()).to.equal('60:64:0:120');
    });
  });

});


/**
 * @class  NoteList
 */

// var bucket1, bucket2;

describe('Timebase: NoteList', function() {

  describe('add(note)', function () {

    it('should test method performance on ordered linked list impl.', function (done) {
      var notelist = TB.createNoteList();
      for (var i = 0; i < TEST_DATA.length; i++) {
        notelist.add(TB.createNote.apply(TB, TEST_DATA[i]));
      }
      expect(notelist.head).to.have.property('start', 12);
      expect(notelist.head.next).to.have.property('start', 34);
      expect(notelist.head.next.next).to.have.property('start', 35);
      expect(notelist.head.next.next.next).to.have.property('start', 55);
      expect(notelist.size).to.equal(127);
      done();
    });

  });

  describe('empty()', function () {

    it('should empty the list.', function (done) {
      var input = [];
      for (var n = 0; n < 10; n++) {
        var start = ~~(Math.random() * 1200);
        input.push(TB.createNote(60, 64, start, start + 120));
      }
      var notelist = TB.createNoteList();
      for (var i = 0; i < input.length; i++) {
        notelist.add(input[i]);
      }
      notelist.empty();
      expect(notelist.head).to.equal(null);
      expect(notelist.size).to.equal(0);
      done();
    });

  });

  describe('findNoteAtPosition(pitch, tick)', function () {

    it('should return a note at pitch/tick position.', function (done) {
      var notelist = TB.createNoteList();
      for (var n = 0; n < 10; n++) {
        notelist.add(TB.createNote(60 + n, 64, 120 * n, 120 * n + 120));
      }
      expect(notelist.findNoteAtPosition(60, 60)).to.not.equal(null);
      expect(notelist.findNoteAtPosition(61, 60)).to.equal(null);
      done();
    });

  });

  describe('findNotesInTimeSpan(start, end)', function () {

    it('should return notes at between start/end time.', function (done) {
      var notelist = TB.createNoteList();
      for (var n = 0; n < 10; n++) {
        notelist.add(TB.createNote(60 + n, 64, 120 * n, 120 * n + 120));
      }
      expect(notelist.findNotesInTimeSpan(60, 240)).to.have.length(2);
      expect(notelist.findNotesInTimeSpan(600, 960)).to.have.length(4);
      expect(notelist.findNotesInTimeSpan(0, 1200)).to.have.length(10);
      done();
    });

  });

  describe('findNotesInArea(minPitch, maxPitch, start, end)', function () {

    it('should return notes at in pitch/time area.', function (done) {
      var notelist = TB.createNoteList();
      for (var n = 0; n < 10; n++) {
        notelist.add(TB.createNote(60 + n, 64, 120 * n, 120 * n + 120));
      }
      expect(notelist.findNotesInArea(62, 64, 60, 240)).to.have.length(1);
      expect(notelist.findNotesInArea(66, 69, 600, 960)).to.have.length(3);
      expect(notelist.findNotesInArea(60, 69, 0, 1200)).to.have.length(10);
      done();
    });

  });

  describe('getSize()', function () {

    it('should return notes at in pitch/time area.', function (done) {
      var notelist = TB.createNoteList();
      var data = [];
      for (var n = 0; n < 10; n++) {
        data.push(TB.createNote(60 + n, 64, 120 * n, 120 * n + 120));
      }
      notelist.add(data[0]);
      notelist.add(data[1]);
      notelist.add(data[2]);
      expect(notelist.getSize()).to.equal(3);
      notelist.remove(data[0]);
      expect(notelist.getSize()).to.equal(2);
      notelist.remove(data[1]);
      expect(notelist.getSize()).to.equal(1);
      notelist.empty();
      expect(notelist.getSize()).to.equal(0);
      done();
    });

  });

  describe('getArray()', function () {

    it('should return a flattened array from list.', function (done) {
      var notelist = TB.createNoteList();
      for (var n = 0; n < 10; n++) {
        notelist.add(TB.createNote(60 + n, 64, 120 * n, 120 * n + 120));
      }
      var notes = notelist.getArray();
      expect(notes).to.have.length(10);
      expect(notes[0]).to.have.property('pitch', 60);
      expect(notes[1]).to.have.property('start', 120);
      expect(notes[2]).to.have.property('end', 360);
      done();
    });

  });

  describe('iterate(fn)', function () {

    it('should iterate all items with callback function.', function (done) {
      var notelist = TB.createNoteList();
      for (var n = 0; n < 10; n++) {
        notelist.add(TB.createNote(60 + n, 64, 120 * n, 120 * n + 120));
      }
      function doubleTempo(note) {
        var dur = note.getDuration() * 0.5;
        note.start *= 0.5;
        note.end = note.start + dur;
      }
      notelist.iterate(doubleTempo);
      var notes = notelist.getArray();
      expect(notes[0]).to.have.property('start',0);
      expect(notes[1]).to.have.property('start', 60);
      expect(notes[2]).to.have.property('end', 180);
      done();
    });

  });

  describe('remove(note)', function () {

    it('should remove items from NoteList.', function (done) {
      var input = [], notelist = TB.createNoteList();
      for (var i = 0; i < TEST_DATA.length; i++) {
        input.push(TB.createNote.apply(TB, TEST_DATA[i]));
      }
      for (i = 0; i < TEST_DATA.length; i++) {
        notelist.add(input[i]);
      }
      for (i = 0; i < ~~(TEST_DATA.length / 2); i++) {
        notelist.remove(input[i]);
      }
      var rest = TEST_DATA.length - ~~(TEST_DATA.length / 2);
      expect(notelist.getSize()).deep.equal(rest);
      done();
    });

  });

  // FOR HEAP VERSION:

  // describe('Timebase.createNoteList()', function () {
  //   it('should return a NoteList object.', function () {
  //     var notelist = TB.createNoteList();
  //     expect(notelist).to.have.property('data');
  //     expect(notelist).to.respondTo('add');
  //     expect(notelist).to.respondTo('remove');
  //   });
  // });

  // describe('add()', function () {
  //   it('should push notes into.', function () {
  //     var notelist = TB.createNoteList(),
  //         note1 = TB.createNote(60, 64, 0, 120),
  //         note2 = TB.createNote(60, 64, 120, 240),
  //         note3 = TB.createNote(60, 64, 180, 180),
  //         note4 = TB.createNote(60, 64, 60, 360);
  //     notelist.add(note1, note2, note3, note4);
  //     console.dir(notelist.data);
  //     expect(notelist.data[0]).to.have.property('start', 0);
  //     expect(notelist.data[3]).to.have.property('start', 180);
  //   });
  // });

});