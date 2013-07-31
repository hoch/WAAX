/**
 * AssetManager
 */
var AssetManager = (function(Asset, Bundle, Context, Callbacks) {



  // vars
  var bAssetReady = false;
  var bDrumSampleLoaded = false;
  var bIRLoaded = false;
  var bVerbos = !true;
  var drumBufferMap = new BufferMap();
  var irBufferMap = new BufferMap();



  // load assets
  Callbacks.onLoadingStart();
  _loadImpuseResponse(function() {
    bIRLoaded = true;
    _reportAssetStatus();
  });
  _loadDrumSamples(function() {
    bDrumSampleLoaded = true;
    _reportAssetStatus();
  });



  // helpers

  function _getKeyList(obj) {
    return Object.keys(obj);
  }

  function _getKeyByIndex(obj, index) {
    return Object.keys(obj)[index];
  }

  function _getValueByIndex(obj, index) {
    return obj[Object.keys(obj)[index]];
  }

  function _serialize(obj) {
    return Object.keys(obj).map(function(key) {
      return [key, obj[key]];
    });
  }

  function _loadDrumSamples(oncomplete) {
    var drumSamples = [];
    for (var drumSample in Asset.Drumkits) {
      drumSamples = drumSamples.concat(_serialize(Asset.Drumkits[drumSample].payload));
    }
    _recurseXHR(drumSamples.slice(0), drumBufferMap, 0,
      oncomplete,
      function(value) {
        var pct = (value * 100 / (drumSamples.length - 1)).toFixed(2);
        Callbacks.onProgress(pct);
      }
    );
  }

  function _loadImpuseResponse(oncomplete) {
    var impulseResponses = [];
    for (var ir in Asset.ImpulseResponses) {
      impulseResponses = impulseResponses.concat(_serialize(Asset.ImpulseResponses[ir].payload));
    }
    _recurseXHR(impulseResponses.slice(0), irBufferMap, 0,
      oncomplete,
      function(value) {
        var pct = (value * 100 / (impulseResponses.length - 1)).toFixed(2);
        Callbacks.onProgress(pct);
      }
    );
  }

  function _reportAssetStatus() {
    if (bIRLoaded && bDrumSampleLoaded) {
      bAssetReady = true;
      Callbacks.onLoaded();
    }
  }



  /**
   * XHR audio buffer loader, recursive loading with serialized data
   * @param {Array} data array of asset data ([name1, url1], [name2, url2], ...)
   * @param {Object} buffermap buffermap object (see BufferMap class)
   * @param {int} iteration # of iteration
   * @param {Function} oncomplete callback on completion
   * @param {Function} onprogress callback on completion of each request
   */
  function _recurseXHR(data, buffermap, iteration, oncomplete, onprogress) {
    // get first key(name)/value(url) from data
    var d = data.shift();
    var name = d[0],
      url = d[1];
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      try {
        var b = Context.createBuffer(xhr.response, false);
        buffermap.addAudioBuffer(name, b);
        if (bVerbos) {
          console.log(name, "\t", url);
        }
        if (data.length) {
          onprogress(++iteration);
          _recurseXHR(data, buffermap, iteration, oncomplete, onprogress);
        } else {
          oncomplete(buffermap);
        }
      } catch (error) {
        console.log("xhr failed (" + error.message + "): " + url);
        console.log("loading stopped.");
      }
    }
    xhr.send();
  }



  /**
   * @class BufferMap
   * @param {array} data array of asset data ([name1, url1], [name2, url2], ...)
   */

  function BufferMap() {

    // kv pair = "buffer name": AudioBuffer
    var _data = {};

    return {

      /**
       * add new audio buffer to the data
       */
      addAudioBuffer: function(name, audioBuffer) {
        // check duplicate name first
        if (_data.hasOwnProperty(name)) {
          console.log("duplicate audio buffer name.");
          return null;
        } else {
          // when buffer is mono, duplicate L to R channel
          if (audioBuffer.numberOfChannels === 1) {
            var newBuffer = Context.createBuffer(2, audioBuffer.length, Context.sampleRate);
            var chan = audioBuffer.getChannelData(0);
            newBuffer.getChannelData(0).set(new Float32Array(chan));
            newBuffer.getChannelData(1).set(new Float32Array(chan));
            _data[name] = newBuffer;
          }
        }
      },

      /**
       * various getters
       */
      getBufferByName: function(name) {
        return _data[name];
      },
      getBufferByIndex: function(index) {
        return _getValueByIndex(_data, index);
      },
      getBufferNames: function() {
        return _getKeyList(_data);
      }
    };

  }



  /**
   * revealing resources
   */
  return {
    drumBufferMap: drumBufferMap,
    irBufferMap: irBufferMap
  };

})(Asset, Bundle, PDX.AudioContext, PDX.AssetCallbacks);