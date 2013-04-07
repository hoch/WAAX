// UIManager
WX.UIManager = Object.create(null, {
  // UI status and event listener references
  selected: {
    writable: true,
    value: null
  },
  onClicked: {
    writable: true,
    value: null
  },
  onDragged: {
    writable: true,
    value: null
  },
  onReleased: {
    writable: true,
    value: null
  },
  // radian 2 degree factor
  rad2degFactor: {
    value: 180/Math.PI
  }
});