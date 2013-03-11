/**
 * UIManager and UISlider (r4, experimental)
 * TODO:
 *   vector2D class: contains
 *   default value
 *   grid/snap mode
 *   smart knobs: linear, exponential
 */


/**
 * @enum UIState
 */
UIState = {
  OUT: 0,
  IDLE: 1,
  CLICKED: 2,
  DRAGGING: 3
};
Object.freeze(UIState);


/**
 * @class UIManager
 */
UIManager = function(context2D) {
  Object.defineProperties(this, {
    currentState: {
      enumerable: true,
      writable: true,
      value: UIState.IDLE
    },
    context: {
      enumerable: true,
      writable: true,
      value: context2D
    },
    pos: {
      // mouse position
      enumerable: true,
      writable: true,
      value: {
        x: 0,
        y: 0
      }
    },
    delta: {
      // mouse delta position from previous frame
      enumerable: true,
      writable: true,
      value: {
        x: 0,
        y: 0
      }
    },
    _canvasPos: {
      writable: true,
      value: {
        x: 0,
        y: 0
      }
    },
    _cursorStyle: {
      writable: true,
      value: "default"
    },
    selected: {
      enumerable: true,
      writable: true,
      value: null
    },
    elements: {
      writable: true,
      value: []
    }
  });
  // get canvas coords
  var canvas = this.context.canvas;
  this._canvasPos.x = canvas.offsetLeft;
  this._canvasPos.y = canvas.offsetTop;
  // set default font
  this.context.font = "8pt Verdana";
  // registring event listners
  var me = this;
  canvas.addEventListener("mousemove", function(e) {
    me.update(e);
  }, false);
  canvas.addEventListener("mousedown", function(e) {
    me.update(e);
  }, false);
  canvas.addEventListener("mouseup", function(e) {
    me.update(e);
  }, false);
  canvas.addEventListener("mouseout", function(e) {
    me.update(e);
  }, false);
  canvas.addEventListener("mouseover", function(e) {
    me.update(e);
  }, false);
};

/**
 * @prototype UIManager
 */
UIManager.prototype = Object.create(null, {
  update: {
    value: function(event) {
      // prevent default event
      event.preventDefault();
      // handle mouseout
      // TODO: status should be kept even when out
      var action = event.type;
      if (action == "mouseout") {
        this.currentState = UIState.OUT;
      } else {
        // update mouse position
        var x = event.pageX - this._canvasPos.x;
        var y = event.pageY - this._canvasPos.y;
        this.delta.x = x - this.pos.x;
        this.delta.y = y - this.pos.y;
        this.pos.x = x;
        this.pos.y = y;
        // cache
        var el = this.elements, l = this.elements.length;
        // state machine
        switch(this.currentState) {
          // case OUT
          case UIState.OUT:
            // check mouseover
            if (action == "mouseover") {
                this.currentState = UIState.IDLE;
            }
            break;
          // case IDLE
          case UIState.IDLE:
          var isHover = false;
            if (action == "mousemove") {
              // check for hovering
              for(var i = 0; i < l; ++i) {
                // check hovering
                var h = el[i].hover = el[i].contains(this.pos.x, this.pos.y);
                // any hover exists, change cursor shape
                isHover = (isHover || h);
              }
            } else if (action == "mousedown") {
              // check for clicking
              for(var j = 0; j < l; ++j) {
                if (el[j].contains(this.pos.x, this.pos.y)) {
                  // assign 1 to selectedObject
                  this.selected = el[j];
                  isHover = true;
                  j = l; // if selected, end loop
                }
              }
              this.currentState = UIState.CLICKED;
            }
            // process cursor style
            this._cursorStyle = (isHover) ? "col-resize" : "default";
            break;
          // case CLICKED
          case UIState.CLICKED:
            if (action == "mousemove") {
              // start dragging
              // NOTE: 'control' method is identical for slider, knobs
              // arguments should be delta amount of mouse movement
              // how to process x, y coords is up to UI elements
              this.selected.control(this.delta.x, this.delta.y);
              this.currentState = UIState.DRAGGING;
            } else if (action == "mouseup") {
              // release selection
              this.selected = null;
              this.currentState = UIState.IDLE;
            }
            break;
          // case DRGGING
          case UIState.DRAGGING:
            if (action == "mousemove") {
              // keep dragging
              // if shift key is pressed give only 1/10 delta
              if (event.shiftKey) {
                  this.selected.control(this.delta.x * 0.1, this.delta.x * 0.1);
              } else {
                  this.selected.control(this.delta.x, this.delta.y);
              }
              this._cursorStyle = "col-resize";
            } else if (action == "mouseup") {
              // release selected object
              this.selected = null;
              this.currentState = UIState.IDLE;
              this._cursorStyle = "default";
            }
            break;
        }
      }
    }
  },
  addElement: {
    value: function() {
      for(var i = 0; i < arguments.length; ++i) {
        this.elements.push(arguments[i]);
      }
    }
  },
  draw: {
    value: function() {
      var ctx = this.context;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for(var i = 0, l = this.elements.length; i < l; ++i) {
        this.elements[i].draw(ctx);
      }
    }
  },
  start: {
    value: function() {
    }
  }
});


/**
 * @class UISlider
 * @argument {x, y, w, h, scale, offset}
 */
UISlider = function(json) {
  Object.defineProperties(this, {
    label: {
      enumerable: true,
      writable: true,
      value: "unlabeled"
      },
    pos: {
      enumerable: true,
      writable: true,
      value: {
        x: 0,
        y: 0
      }
    },
    size: {
      enumerable: true,
      writable: true,
      value: {
        x: 120,
        y: 30
      }
    },
    handlePos: {
      enumerable: true,
      writable: true,
      value: {
        x: 0,
        y: 0
      }
    },
    style: {
      enumerable: true,
      writable: true,
      value: {
        containerColor: "#339",
        handleColor: "#66E",
        hoverColor: "#99F"
      }
    },
    params: {
      enumerable: true,
      writable: true,
      value: {
        scale: 0.0,
        offset: 0.0,
        defaultValue: 0.0,
        value: 0.0
      }
    },
    _hover: {
      enumerable: false,
      writable: true,
      value: false
    },
    _target: {
      enumerable: false,
      writable: true,
      value: null
    }
  });
  this.handleColor = this.style.handleColor;
  this.label = json.label;
  this.pos.x = json.x;
  this.pos.y = json.y;
  this.size.x = json.width;
  this.size.y = json.height;
  this.params.scale = json.scale;
  this.params.offset = json.offset;
  this.params.value = this.params.defaultValue = json.defaultValue;
  // infer handlePos.x from defaultValue
  this.handlePos.x = (this.params.value - this.params.offset) / this.params.scale * this.size.x;
};

/**
 * @prototype UISlider
 */
UISlider.prototype = Object.create(null, {
  contains: {
    value: function(x, y) {
      if (
        (this.pos.x < x && this.pos.x + this.size.x > x) &&
        (this.pos.y < y && this.pos.y + this.size.y > y)) {
        return true;
      } else {
        return false;
      }
    }
  },
  hover: {
    get: function() {
      return this._hover;
    },
    set: function(bool) {
      this._hover = bool;
    }
  },
  control: {
    value: function(dx, dy) {
      this.handlePos.x += dx;
      // this.handlePosition.y += dy; // it makes this horizontal
      // boundary check
      this.handlePos.x = Math.max(0, this.handlePos.x);
      this.handlePos.x = Math.min(this.size.x, this.handlePos.x);
      this.handlePos.y = Math.max(0, this.handlePos.y);
      this.handlePos.y = Math.min(this.size.y, this.handlePos.y);
      // calculate params
      // = (currentPositionInSlider / slideWidth) * scale + offset
      this.params.value = (this.handlePos.x / this.size.x) * this.params.scale + this.params.offset;
      // control connected params
      this._target.linearRampToValueAtTime(this.params.value, 0.02);
    }
  },
  getParams: {
    value: function() {
      return this.params.value;
    }
  },
  target: {
    get: function() {
      return this._target;
    },
    set: function(audioParam) {
      this._target = audioParam;
      // transmit current value to target
      this._target.linearRampToValueAtTime(this.params.value, 0.02);
    }
  },
  draw: {
    value: function(context) {
      // get color from status
      var clr = (this._hover) ? this.style.handleColor : this.style.hoverColor;
      // draw container
      context.beginPath();
      context.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
      context.fillStyle = this.style.containerColor;
      context.fill();
      // draw bar and position indicator (handle)
      context.beginPath();
      context.rect(this.pos.x, this.pos.y, this.handlePos.x, this.size.y);
      context.fillStyle = clr;
      context.fill();
      context.beginPath();
      context.moveTo(this.pos.x + this.handlePos.x, this.pos.y + this.handlePos.y);
      context.lineTo(this.pos.x + this.handlePos.x, this.pos.y + this.handlePos.y + this.size.y);
      context.strokeStyle = "#fff";
      context.stroke();
      // draw label
      context.fillStyle = clr;
      context.fillText(this.label, this.pos.x + this.size.x + 5, this.pos.y + 10);
      // draw text
      context.fillStyle = this.style.containerColor;
      context.fillText(this.params.value.toFixed(2), this.pos.x + this.size.x + 5, this.pos.y + 24);
    }
  }
});



/* example code

var cvs = document.getElementById("wx-uiPanel");
var ctx = cvs.getContext('2d');

var uiMan = new UIManager(ctx);
var s1 = new UISlider({ label:"GAIN", x:10, y:10, width:300, height:30, scale:1, offset:0, defaultValue:0.3 });
var s2 = new UISlider({ label:"PITCH", x:10, y:50, width:300, height:30, scale:127, offset: 0, defaultValue:60 });
var s3 = new UISlider({ label:"FREQUENCY", x:10, y:90, width:300, height:30, scale:22030, offset: 20, defaultValue:1000 });
uiMan.addElement(s1);
uiMan.addElement(s2);
uiMan.addElement(s3);

function draw() {
    uiMan.draw();
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

*/
