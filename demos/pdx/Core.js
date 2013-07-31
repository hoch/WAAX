var PDX = (function () {

  var _audioContext = new webkitAudioContext();

  return {

    AudioContext: _audioContext,

    AssetCallbacks: {
      onLoadingStart: function () {
        console.log("[PDX] start loading assets...");
      },
      onProgress: function (value) {
        console.log("[PDX] loading... (" + value + "%)");
      },
      onLoaded: function () {
        console.log("[PDX] asset ready.");
      }
    }

  };

})();