/**
 * WAAX.LAB: application r5
 * by Hongchan Choi (hoch, hongchan@ccrma.stanford.edu)
 */

(function (Asset) {

  /**
   * variables
   */

  var editor, interval;

  var editorToggleState = true;
  var editorAutoUpdateState = true;
  var errorLines = [];

  var previewId = document.getElementById('d-preview');

  /**
   * editor construction
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
   * editor helpers
   */

  function checkClient() {
    if (/chrome/.test(navigator.userAgent.toLowerCase()) === false) {
      alert("Sorry. Your browser is not compatible with WAAX. Use Chrome 24+ to use WAAX.");
      throw "[WAAX.LAB] ERROR: Incompatible browser.";
    } else {
      var version = parseInt(window.navigator.appVersion.match(/Chrome\/(.*?) /)[1], 10);
      if (version < 24) {
        alert("Sorry. Chrome 24+ is required to use WAAX.");
        throw "[WAAX.LAB] ERROR: Outdated Chrome.";
      }
    }
  }

  function resizeCodeArea() {
    $('#d-codemirror').height(window.innerHeight - 76);
  }

  function setStatusText(msg) {
    $('#s-status-text').text(msg);
  }

  function toggleEditor(bool) {
    if (typeof bool === 'boolean') {
      editorToggleState = bool;
    } else {
      editorToggleState = !editorToggleState;
    }
    if (editorToggleState) {
      $("#d-editor").show();
      $("#d-showEditor").hide();
    } else {
      $("#d-editor").hide();
      $("#d-showEditor").show();
    }
  }

  function injectIFrame() {
    setStatusText("Updating...");
    killSpawned();
    var codes = editor.getValue();
    // use esprima for code validation (disabled for performance reason)
    // if (validate(codes)) {
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
    setStatusText("Updated.");
    // }
  }

  function killSpawned() {
    while (previewId.children.length > 0) {
      previewId.removeChild(previewId.firstChild);
    }
    setStatusText("Spawned injection killed.");
  }


  /**
   * file system helpers
   */

  function handleFileImport(evt) {
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      editor.setValue(e.target.result);
    };
    reader.onerror = function (e) {
      console.log("error", e);
    };
    reader.readAsText(file);
    setStatusText("File imported.");
  }

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

  function destroyDownload() {
    $('#a-modal-save').removeAttr('href');
    $('#a-modal-save').removeAttr('download');
  }

  function loadFromCache() {
    var data = null;
    if (localStorage.wxlab !== undefined) {
      data = JSON.parse(localStorage.wxlab);
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
    localStorage.wxlab = null;
    editor.setValue("");
    setStatusText("Cache/buffer cleared.");
  }

  // cache: saveToCache
  function saveToCache() {
    localStorage.wxlab = JSON.stringify(editor.getValue());
    setStatusText("Buffer saved to cache.");
  }

  // injection: validate through esprima
  /*
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
  */


 //--------------------------- from here -----------------------------//


  // ajax example loading
  function loadExample(filename) {
    $.get(filename, function(data) {
      editor.setValue(data);
      setStatusText("Example loaded.");
    });
  }

  // build asset
  function buildAsset() {
    var assetList = $('#l-examples');
    // Asset.Paths
    // Asset.Examples
    // Asset.Showcases
    for (var i = 0; i < Asset.Examples; i++) {
      var listItem = document.createElement('li');
      if (Asset.Examples[i].url === "{{divider}}") {
        listItem.className = 'divider';
      } else {
        if (Asset.Examples[i].url !== null)  {
          listItem.className = 'disabled';
        } else {
          listItem.onclick = function (event) {
            console.log('clicked.' + Asset.Examples[i].url);
          };
        }
      }

      // if (ex.id === "divider") {
      //   list.append('<li class="divider"></li>');
      // } else {
      //   if (ex.url !== null) {
      //     list.append('<li><a id="' + ex.id + '">' + ex.textLabel + '</a><li>');
      //     // TODO: add event listener here?
      //   } else {
      //     list.append('<li class="disabled"><a id="' + ex.id + '">' + ex.text + '</a><li>');
      //   }
      // }
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
  // function bindExamples() {
  //   $('#l-examples > li > a').click(function(evt) {
  //     var elId = $(this)[0].id;
  //     // find elID from exs.id
  //     // load corresponding url
  //     for(var i = 0, l = exs.length; i < l; i++) {
  //       if (exs[i].id == elId) {
  //         loadExample(exs[i].url);
  //         return;
  //       }
  //     }
  //   });
  // }

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
  // $(document).keyup(function(evt) {
  //   if (evt.keyCode == 27) {
  //     toggleEditor();
  //   }
  // });



  /**
   * initialization
   */
  // browser check first
  checkClient();
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
      loadExample(exs[0].url);
    }
    setStatusText("Ready. (r4)");
  });
}());