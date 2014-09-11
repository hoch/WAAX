/**
 * @fileOverview MUI: Musical User Interface module (for Polymer integration)
 * @description This module includes some utilities for keyboard and mouse
 *   responders, because music-specific GUI elements require non-standard user
 *   interaction. The functionality might be integrated into Polymer custom
 *   element, but the code is currently used for bridging the gap between WAAX
 *   and Polymer.
 * @version 1.0.0-alpha
 */
window.MUI = (function (WX) {

  /**
   * Mouse responder. 2D coordinate detection and event handler.
   * @class
   * @private
   * @param {String} senderID Specified Sender ID.
   * @param {Object} targetElement Target DOM element.
   * @param {Function} MUICallback Event-handling callback.
   */
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
      var p = this.getEventData(event);
      this.callback(this.senderId, 'released', p);
      window.removeEventListener('mousemove', this.ondragged, false);
      window.removeEventListener('mouseup', this.onreleased, false);
    }
  };


  //
  // KeyResponder
  ///

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

  // Box2D class
  function Box2D(x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;
    this.w = w;
    this.h = h;
  }

  Box2D.prototype = {

    containsPoint: function (p) {
      if (this.x1 <= p.x && p.x <= this.x2) {
        if (this.y1 <= p.y && p.y <= this.y2) {
          return true;
        }
      }
      return false;
    },

    getNormX: function (p) {
      return (p.x - this.x1) / this.w;
    },

    getNormY: function (p) {
      return (p.y - this.y1) / this.h;
    },

    getNormPosition: function (p) {
      return {
        x: (p.x - this.x1) / this.w,
        y: (p.y - this.y1) / this.h
      };
    }

  };


  //
  // MUI Public Methods
  ///

  return {

    // TODO: these are dupes...
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

    // TODO: collection has been changed with 0.0.1.
    //       reconsider this.
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

    buildControls: function (plugin, targetId) {
      var targetEl = document.getElementById(targetId);
      targetEl.label = plugin.info.name;
      for (var param in plugin.params) {
        var p = plugin.params[param];
        switch (p.type) {
          case 'Generic':
            var knob = document.createElement('mui-knob');
            knob.link(plugin, param);
            targetEl.appendChild(knob);
            break;
          case 'Itemized':
            var select = document.createElement('mui-select');
            select.link(plugin, param);
            targetEl.appendChild(select);
            break;
          case 'Boolean':
            var button = document.createElement('mui-button');
            button.type = 'toggle';
            button.link(plugin, param);
            targetEl.appendChild(button);
            break;
        }
      }
    },

    removeChildren: function (targetId) {
      var targetEl = document.getElementById(targetId);
      while (targetEl.firstChild) {
        targetEl.removeChild(targetEl.firstChild);
      }
    },

    $: function (elementId) {
      return document.getElementById(elementId);
    },

    start: function (onreadyFn) {
      // check up depedency: platform
      if (WX.isObject(window.Platform)) {
        // start function when polymer is ready
        window.addEventListener('polymer-ready', onreadyFn);
      } else {
        WX.Log.error('FATAL: Platform/Polymer is not loaded.');
      }
    }

  };

})(WX);