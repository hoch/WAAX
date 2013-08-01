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
  var presetMap = new PresetMap();



  // loading assets
  _log("start loading assets...");
  // async: loading impulse responses
  Callbacks.onLoadingStart();
  _loadImpuseResponse(function() {
    bIRLoaded = true;
    _reportAssetStatus();
  });
  // async: loading impulse responses
  _loadDrumSamples(function() {
    bDrumSampleLoaded = true;
    _reportAssetStatus();
  });
  // loading presets from bundle
  presetMap.loadPresetFromBundle(Bundle);



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
  function _cloneObject(obj) {
    var target = {};
    for (var prop in obj) {
      target[prop] = obj[prop];
    }
    return target;
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
        _log("loading... (" + pct + "%)");
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
        _log("loading... (" + pct + "%)");
        Callbacks.onProgress(pct);
      }
    );
  }
  function _reportAssetStatus() {
    if (bIRLoaded && bDrumSampleLoaded) {
      bAssetReady = true;
      _log("assets ready.");
      Callbacks.onLoaded();
    }
  }
  function _log (msg) {
    if (bVerbos) {
      console.log("[AssetMan] " + msg);  
    }
  }
  function _err (msg) {
    console.log("[AssetMan:ERR] " + msg);
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
        _log(name, "\t", url);
        if (data.length) {
          onprogress(++iteration);
          _recurseXHR(data, buffermap, iteration, oncomplete, onprogress);
        } else {
          oncomplete(buffermap);
        }
      } catch (error) {
        _err("xhr failed (" + error.message + "): " + url);
        _err("loading stopped.");
      }
    }
    xhr.send();
  }



  /**
   * @class BufferMap
   * @param {array} data array of asset data ([name1, url1], [name2, url2], ...)
   */

  function BufferMap() {

    // "buffer name": AudioBuffer
    var _buffers = {};

    return {

      /**
       * add new audio buffer to the data
       */
      addAudioBuffer: function(name, audioBuffer) {
        // check duplicate name first
        if (_buffers.hasOwnProperty(name)) {
          _err("duplicate audio buffer name.");
          return null;
        } else {
          // when buffer is mono, duplicate L to R channel
          if (audioBuffer.numberOfChannels === 1) {
            var newBuffer = Context.createBuffer(2, audioBuffer.length, Context.sampleRate);
            var chan = audioBuffer.getChannelData(0);
            newBuffer.getChannelData(0).set(new Float32Array(chan));
            newBuffer.getChannelData(1).set(new Float32Array(chan));
            _buffers[name] = newBuffer;
          }
        }
      },

      /**
       * various getters
       */
      getBufferByName: function(name) {
        return _buffers[name];
      },
      getBufferByIndex: function(index) {
        return _getValueByIndex(_buffers, index);
      },
      getBufferNames: function() {
        return _getKeyList(_buffers);
      }
    };

  }


  /**
   * @class PresetMap
   */
  function PresetMap () {

    var _info = {};    
    var _presets = {};

    function _getPresetList () {
      return Object.keys(_presets);
    }

    function _findPreset (arg) {
      var key = null;
      switch (typeof arg) {
        case "number":
          var presetList = _getPresetList();
          if (arg > -1 && arg < presetList.length) {
            key = presetList[arg];
          }
          break;
        case "string":
          if (_presets.hasOwnProperty(arg)) {
            key = arg;
          }
          break;
      }
      return key;
    }

    return {

      loadPresetFromBundle: function(bundle) {
        _info = _cloneObject(bundle.info);
        _presets = _cloneObject(bundle.presets);
      },

      getInfo: function () {
        return _cloneObject(_info);
      },

      getPresetList: _getPresetList,
      
      getPreset: function(arg) {
        var key = _findPreset(arg)
        if (key) {
          return _cloneObject(_presets[key]);
        } else {
          _err("couldn't find preset. (" + arg + ")");
          return undefined;
        }
      },

      addPreset: function(name, params) {
        if (_getPresetByName(name)) {
          _err("duplicate preset name.");
          return null;
        } else {
          _presets[name] = _cloneObject(params);
          return true;
        }
      },

      removePreset: function(arg) {
        var key = _findPreset(arg);
        if (key) {
          delete _presets[key];
          return true
        } else {
          _err("couldn't find preset. (" + arg + ")");
          return undefined;
        }
      },

      updatePreset: function(arg, params) {
        var key = _findPreset(arg);
        if (key) {
          _presets[key] = _cloneObject(params);
          return true
        } else {
          _err("couldn't find preset. (" + arg + ")");
          return undefined;
        }
      },

      importBundle: function (bundle) {

      },

      exportBundle: function (filename) {

      }
    }
  }


  /**
   * revealing resources
   */
  return {
    drumBufferMap: drumBufferMap,
    irBufferMap: irBufferMap,
    presetMap: presetMap,
  };

})(Asset, Bundle, PDX.AudioContext, PDX.AssetCallbacks);