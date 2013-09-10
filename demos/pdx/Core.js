var PDX = (function () {

  var _audioContext = new webkitAudioContext();

  function _log (msg) {
    console.log("[PDX] " + msg);
  }

  return {

    log: _log,

    AudioContext: _audioContext,

    AssetCallbacks: {
      onLoadingStart: function () {
      },
      onProgress: function (value) {
      },
      onLoaded: function () {
      }
    }

  };

})();