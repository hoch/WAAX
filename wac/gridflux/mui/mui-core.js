var MUI = (function () {

  function MouseResponder(senderID, targetElement, MUICallback) {
    this.senderId = senderID;
    this.container = targetElement;
    this.callback = MUICallback;
    // bound function references
    this.ondragged = this.dragged.bind(this);
    this.onreleased = this.released.bind(this);
    // timestamp
    this._prevTS = 0;
    // init with onclick
    this.onclicked(targetElement);
  }

  MouseResponder.prototype = {
    getEventData: function (event) {
      var r = this.container.getBoundingClientRect();
      return {
        x: event.clientX - r.left,
        y: event.clientY - r.top,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
      };
    },
    onclicked: function (target) {
      target.addEventListener('mousedown', function (event) {
        event.preventDefault();
        this._prevTS = event.timeStamp;
        var p = this.getEventData(event);
        this.callback(this.senderId, 'clicked', p);
        window.addEventListener('mousemove', this.ondragged, false);
        window.addEventListener('mouseup', this.onreleased, false);
      }.bind(this), false);
    },
    dragged: function (event) {
      event.preventDefault();
      if (event.timeStamp - this._prevTS < 16.7) {
        return;
      }
      this._prevTS = event.timeStamp;
      var p = this.getEventData(event);
      this.callback(this.senderId, 'dragged', p);
    },
    released: function (event) {
      event.preventDefault();
      this.callback(this.senderId, 'released', null);
      window.removeEventListener('mousemove', this.ondragged, false);
      window.removeEventListener('mouseup', this.onreleased, false);
    }
  };


  function KeyResponder(senderID, targetElement, MUICallback) {
    this.senderId = senderID;
    this.container = targetElement;
    this.callback = MUICallback;
    // bound function references
    this.onkeypress = this.keypressed.bind(this);
    this.onblur = this.finished.bind(this);
    // init with onclick
    this.onfocus(targetElement);
  }

  KeyResponder.prototype = {

    onfocus: function () {
      this.container.addEventListener('mousedown', function (event) {
        event.preventDefault();
        this.callback(this.senderId, 'clicked', null);
        this.container.addEventListener('keypress', this.onkeypress, false);
        this.container.addEventListener('blur', this.onblur, false);
      }.bind(this), false);
    },
    keypressed: function (event) {
      // event.preventDefault();
      this.callback(this.senderId, 'keypressed', event.keyCode);
    },
    finished: function (event) {
      // event.preventDefault();
      this.callback(this.senderId, 'finished', null);
      this.container.removeEventListener('keypress', this.onkeypress, false);
      this.container.removeEventListener('blur', this.onblur, false);
    }
  };

  return {

    clamp: function (value, min, max) {
      return Math.max(Math.min(value, max), min);
    },

    clone: function (obj) {
      var cloned = {};
      for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
          cloned[p] = obj[p];
        }
      }
      return obj;
    },

    findValueByKey: function (collection, key) {
      for (var i = 0; i < collection.length; i++) {
        if (collection[i].key === key) {
          return collection[i].value;
        }
      }
      // if key not found, just return the first item
      return collection[0].value;
    },

    findKeyByValue: function (collection, value) {
      for (var i = 0; i < collection.length; i++) {
        if (collection[i].value === value) {
          return collection[i].key;
        }
      }
    },

    MouseResponder: function (senderID, targetElement, MUICallback) {
      return new MouseResponder(senderID, targetElement, MUICallback);
    },

    KeyResponder: function (senderID, targetElement, MUICallback) {
      return new KeyResponder(senderID, targetElement, MUICallback);
    },

    $: function (elementId) {
      return document.querySelector('#' + elementId);
    }

  };

})();
