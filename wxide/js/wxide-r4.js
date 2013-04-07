/**
 * WXIDE r4 program logic
 * by Hongchan Choi (hoch, hongchan@ccrma.stanford.edu)
 */

(function() {
  /**
   * variables
   */
  var editor, interval;
  var editorToggleState = true;
  var editorAutoUpdateState = true;
  var errorLines = [];
  var editorDOM = $('#d-codemirror');
  var statusTextDOM = $('#s-status-text');
  var previewId = document.getElementById('d-preview');

  /**
   * example list
   */
  var exs = [
    {
      id: "a-menu-ex-0",
      text: "Hello WAAX!",
      url: "../examples/hello-waax.html"
    },
    {
      id: "a-menu-ex-1",
      text: "WAAX does THX",
      url: "../examples/waax-does-thx.html"
    },
    {
      id: "a-menu-ex-2",
      text: "Acidic Bassline",
      url: "../examples/acidic-bassline.html"
    },
    {
      id: "a-menu-ex-3",
      text: "Simple Drum Sampler",
      url: "../examples/simple-drum-sampler.html"
    },
    {
      id: "a-menu-ex-4",
      text: "Take the I train",
      url: "../examples/take-i-train.html"
    },
    {
      id: "a-menu-ex-5",
      text: "Custom Visualizer",
      url: "../examples/visualizer.html"
    },
    {
      id: "a-menu-ex-6",
      text: "WAAX GUI (pilot)",
      url: "../examples/ui-manager.html"
    },
    { id: "divider" },
    {
      id: "a-menu-ex-wx7",
      text: "WX7 FM Synth",
      url: null
    },
    {
      id: "a-menu-ex-wpc60",
      text: "WPC-60",
      url: null
    },
    {
      id: "a-menu-ex-winimoog",
      text: "Winimoog",
      url: null
    },
    {
      id: "a-menu-ex-wb303",
      text: "WB-303 Bassline",
      url: null
    },
    { id: "divider" },
    {
      id: "a-menu-ex-devmode",
      text: "DevMode",
      url: "../examples/devmode.html",
      active: true
    }
  ];

  /**
   * functions
   */
  // editor: resizeCodeArea
  function resizeCodeArea() {
    var h = window.innerHeight - 76;
    editorDOM.height(h);
  }
  // editor: toggleEditor
  function toggleEditor(bool) {
    editorToggleState = (bool === undefined) ? !editorToggleState : bool;
    if(editorToggleState) {
      $("#d-editor").show();
      $("#d-showEditor").hide();
    } else {
      $("#d-editor").hide();
      $("#d-showEditor").show();
    }
  }
  // import: handleFileImport
  // TODO: check file type (text/html)
  function handleFileImport(evt) {
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      editor.setValue(e.target.result);
    };
    reader.onerror = function(e) {
      console.log("error", e);
    };
    reader.readAsText(file);
    setStatusText("File imported.");
  }
  // export: createDownload
  function createDownload(fileName) {
    var userBuffer = editor.getValue() || "hello waax!";
    var exportFileName = fileName || "your-code.html";
    exportFileName += ".wx";
    var blob = new Blob([userBuffer], {type: "text/html"});
    var url = URL.createObjectURL(blob);
    $('#a-modal-save').attr({
      'href': url,
      'download': exportFileName
    });
    setStatusText("File exported.");
  }
  // export: destroyDownlaod
  function destroyDownload() {
    $('#a-modal-save').removeAttr('href');
    $('#a-modal-save').removeAttr('download');
  }
  // cache: loadFromCache
  function loadFromCache() {
    var data = null;
    if (localStorage.wxide !== undefined) {
      data = JSON.parse(localStorage.wxide);
    }
    if (data !== null) {
      editor.setValue(data);
      setStatusText("Loaded from cache.");
      return true;
    } else {
      setStatusText("Invalid content or empty cache.");
      return false;
    }
  }
  // cache: resetCache
  function resetCache() {
    localStorage.wxide = null;
    editor.setValue("");
    setStatusText("Cache/buffer cleared.");
  }
  // cache: saveToCache
  function saveToCache() {
    localStorage.wxide = JSON.stringify(editor.getValue());
    setStatusText("Buffer saved to cache.");
  }
  function injectCode(codes) {
    var iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.id = 'wxi-injection';
    previewId.appendChild(iframe);
    var content = iframe.contentDocument || iframe.contentWindow.document;
    content.open();
    content.write(codes);
    content.close();
  }
  // injection: update
  function update() {
    setStatusText("Updating...");
    killSpawned();
    var codes = editor.getValue();
    /* use esprima for code validation (disabled for performance reason)
    if (validate(codes)) {
      injectCode(codes);
    }*/
    injectCode(codes);
    setStatusText("Updated.");
  }
  // injection: validate through esprima
  function validate(value) {
    while (errorLines.length > 0) {
      editor.removeLineClass(errorLines.shift(), null, 'errorLine');
    }
    var string = '';
    var lines = value.split('\n');
    var lineCurrent = 0, lineTotal = lines.length;
    while (lineCurrent < lineTotal && lines[lineCurrent].indexOf('<script>') === -1) {
      lineCurrent ++;
    }
    var lineStart = lineCurrent ++;
    while (lineCurrent < lineTotal && lines[lineCurrent].indexOf('<\/script>') === -1) {
      string += lines[lineCurrent] + '\n';
      lineCurrent ++;
    }
    var lineEnd = lineCurrent;
    // parsing with esprima
    try {
      var result = esprima.parse(string, { tolerant:true, loc:true }).errors;
      for (var i = 0; i < result.length; i ++) {
        var error = result[i];
        var lineNumber = error.lineNumber + lineStart;
        errorLines.push(lineNumber);
        editor.addLineClass(lineNumber, null, 'errorLine');
        setStatusText('Line ' + (lineNumber + 1) + ': ' + error.string);
      }
    } catch (err) {
      var lineNumber = err.lineNumber + lineStart;
      errorLines.push(lineNumber);
      editor.addLineClass(lineNumber, null, 'errorLine');
      setStatusText('Line ' + (lineNumber + 1) + ': ' + err.string);
    }
    return errorLines.length === 0;
  }
  // status text
  function setStatusText(string) {
    statusTextDOM.text(string);
  }
  // kill spawned iframe
  function killSpawned() {
    while (previewId.children.length > 0) {
      previewId.removeChild(previewId.firstChild);
    }
    setStatusText("Spawned injection killed.");
  }
  // ajax example loading
  function loadExample(filename) {
    $.get(filename, function(data) {
      editor.setValue(data);
      setStatusText("Example loaded.");
    });
  }
  // browser checking
  function browserCheck() {
    if (/chrome/.test(navigator.userAgent.toLowerCase()) === false) {
      alert("Sorry. Your browser is not compatible with WAAX. Use Chrome 24+ to use WAAX.");
      throw "[WXIDE] ERROR: Incompatible browser.";
    } else {
      var version = parseInt(window.navigator.appVersion.match(/Chrome\/(.*?) /)[1], 10);
      if (version < 24) {
        alert("Sorry. Chrome 24+ is required to use WAAX.");
        throw "[WXIDE] ERROR: Outdated Chrome.";
      }
    }
  }
  // build examples
  function buildExamples() {
    var list = $('#l-examples');
    for(var i = 0, l = exs.length; i < l; ++i) {
      if (exs[i].id === "divider") {
        list.append('<li class="divider"></li>');
      } else {
        if (exs[i].url !== null) {
          list.append('<li><a id="' + exs[i].id + '">' + exs[i].text + '</a><li>');
        } else {
          list.append('<li class="disabled"><a id="' + exs[i].id + '">' + exs[i].text + '</a><li>');
        }
      }
    }
  }

  /**
   * button click or event dispatcher
   */
  $('button').click(function(evt) {
    var elId = $(this)[0].id;
    switch (elId) {
      case 'b-showEditor':
        toggleEditor();
        break;
      case 'b-menu-new':
        resetCache();
        break;
      case 'b-menu-save':
        saveToCache();
        break;
      case 'b-menu-import':
        // do nothing: handled by a hidden file input form
        break;
      case 'b-menu-export':
        $('#d-modal-export').modal('show');
        break;
      case 'b-menu-hide':
        toggleEditor();
        break;
      case 'b-menu-autoupdate':
        editorAutoUpdateState = !editorAutoUpdateState;
        if (editorAutoUpdateState) {
          update();
        }
        break;
      case 'b-menu-mute':
        killSpawned();
        break;
      // save file on export modal
      case 'b-modal-save':
        var filename = $('#f-input-fileName').val();
        createDownload(filename);
        $('#d-modal-export').modal('hide');
        break;
      // display about info modal
      case 'b-about':
        $('#d-modal-about').modal('show');
        break;
    }
  });

  /**
   * load examples with dropdown menu
   */
  function bindExamples() {
    $('#l-examples > li > a').click(function(evt) {
      var elId = $(this)[0].id;
      switch (elId) {
        case 'a-menu-ex-default':
          loadExample('../examples/hellowaax.html');
          break;
        case 'a-menu-ex-thx':
          loadExample('../examples/waax-thx.html');
          break;
        case 'a-menu-ex-rezobass':
          loadExample('../examples/rezobass.html');
          break;
        case 'a-menu-ex-samplr':
          loadExample('../examples/samplr.html');
          break;
        case 'a-menu-ex-visualizer':
          loadExample('../examples/visualizer.html');
          break;
        case 'a-menu-ex-devmode':
          loadExample('../examples/devmode.html');
          break;
        case 'a-menu-ex-uimanager':
          loadExample('../examples/uimanager.html');
          break;
        case 'a-menu-ex-itrain':
          loadExample('../examples/take-i-train.html');
          break;
      }
    });
  }

  /**
   * other event listeners
   */
  // file input form change event
  $('#f-fileInput').change(function(evt) {
    handleFileImport(evt);
  });
  // export modal event listeners
  $('#d-modal-export')
    .on('shown', function() { $("#f-input-fileName").focus(); })
    .on('hidden', function() { destroyDownload(); });
  // on resize
  $(window).resize(function() {
    resizeCodeArea();
  });

  /**
   * key bindings
   */
  $(document).keyup(function(evt) {
    if (evt.keyCode == 27) {
      toggleEditor();
    }
  });

  /**
   * construction
   */
  editor = CodeMirror(document.getElementById('d-codemirror'), {
    value: "",
    mode: "text/html",
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    indentWithTabs: true,
    tabSize: 2,
    indentUnit: 2,
    theme: "monokai"
  });
  editor.setSize(null, "100%");
  editor.on("change", function() {
    if (editorAutoUpdateState) {
      clearTimeout(interval);
      interval = setTimeout(update, 1000);
    } else {
      return;
    }
  });

  /**
   * initialization
   */
  // browser check first
  browserCheck();
  // check appcache manifest and update
  $(document).ready(function() {
    var appCache = window.applicationCache;
    appCache.addEventListener('updateready', function() {
      appCache.update();
      appCache.swapCache();
    });
    // resize codemirror
    resizeCodeArea();
    // build example list
    buildExamples();
    bindExamples();
    // load from local storage (if available)
    if(!loadFromCache()) {
      loadExample('../examples/hellowaax.html');
    }
    setStatusText("Ready. (r4)");
  });
}());