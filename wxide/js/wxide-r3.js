/**
 * globals
 */
var gEditor, gPreview;
var gInterval;
var gEditorStatus = true;
var gErrorLines = [];

/**
 * handling UI with jquery UI
 */
$(function () {
  var codeArea = $("#wxi-editor-codeArea");

  $("div").disableSelection();
  $("#wxi-showEditor").hide();
  $("#wxi-btn-showEditor")
    .button({ icons:{ primary:"ui-icon-pencil" }, text:false })
    .click(function () { toggleEditor(true); });
  $("#wxi-editor")
    .draggable({
      containment: "parent",
      handle:"#wxi-editor-menuBar",
      start: function(event, ui) {
        $("#wxi-injection").css('pointer-events','none');
      },
      stop: function(event, ui) {
        $("#wxi-injection").css('pointer-events','auto');
      }
    })
    .resizable({
      minWidth: 300,
      minHeight: 362,
      start: function(event, ui) {
        $("#wxi-injection").css('pointer-events','none');
      },
      stop: function(event, ui) {
        $("#wxi-injection").css('pointer-events','auto');
      },
      resize: function(event, ui) {
        var h = ui.size.height - 62;
        codeArea.css("height", h + "px");
        // constratin editor size with min-height
        var mh = codeArea.height();
        gEditor.setSize(null, mh);
      }
    });
  $("#wxi-btn-hide")
    .button({ icons: { primary: "ui-icon-minusthick" }, text: false })
    .click(function () { toggleEditor(false); });
  $("#wxi-btn-menu")
    .button({ icons: { primary: "ui-icon-triangle-1-s" }, text: false })
    .click(function() {
      $("#wxi-menu-examples").hide();
      var menu = $("#wxi-menu-file").show().position({
        my: "left top", at: "left bottom", of: this
      });
      $(document).one("click", function() { menu.hide(); });
      return false;
    }).next().hide().menu({
      select: function(event, ui) {
        console.log(ui.item[0].id);
        var selectedItemId = ui.item[0].id;
        switch(selectedItemId) {
          case "wxi-menuitem-new":
            $.get('new.html', function(data) {
              gEditor.setValue(data);
            });
          break;
          case "wxi-menuitem-load":
            //
          break;
          case "wxi-menuitem-save":
            //
          break;
          case "wxi-menuitem-export":
            //
          break;
          case "wxi-menuitem-about":
            //
          break;
        }
      }
    });
  $("#wxi-btn-examples")
    .button({ icons: { primary: "ui-icon-folder-open" }, text: false })
    .click(function() {
      $("#wxi-menu-file").hide();
      var menu = $("#wxi-menu-examples").show().position({
        my: "left top", at: "left bottom", of: this
      });
      $(document).one("click", function() { menu.hide(); });
      return false;
    }).next().hide().menu();
  $("#wxi-btn-autoRefresh")
    .button({ icons: { primary: "ui-icon-arrowrefresh-1-s" }, text: false });
  $("#wxi-btn-audioToggle")
    .button({ icons: { primary: "ui-icon-volume-off" }, text: false });
  $("#wxi-editor-codeArea")
    .css("height", $("#wxi-editor").height() - 62 + "px");
  // key binding
  $(window).keyup(function(evt) {
    if (evt.keyCode == 27) {
      toggleEditor();
    }
  });
  // helper function
  var toggleEditor = function(bool) {
    gEditorStatus = (bool === undefined) ? !gEditorStatus : bool;
    if(gEditorStatus) {
        $("#wxi-editor").show(); $("#wxi-showEditor").hide();
    } else {
        $("#wxi-editor").hide(); $("#wxi-showEditor").show();
    }
  };
});

/**
 * code mirror
 */
$(document).ready(function() {
  // get ajaxing to html file
  
  // creation of editor
  gEditor = CodeMirror(document.getElementById('wxi-editor-codeArea'), {
    value: "<!-- CONTENTS HERE -->",
    mode: "text/html",
    lineNumbers: true,
    matchBrackets: true,
    indentWithTabs: true,
    tabSize: 2,
    indentUnit: 2,
    theme: "solarized light"
  });
  gEditor.setSize(null, "100%");
  gEditor.on("change", function() {
    clearTimeout(gInterval);
    $("#wxi-editor-statusBar-message").text("Updating...");
    gInterval = setTimeout(update, 1000);
  });
  // get preview window element
  gPreview = document.getElementById('wxi-preview');

  // update
  var update = function () {
    while (gPreview.children.length > 0) {
      gPreview.removeChild(gPreview.firstChild);
    }
    var value = gEditor.getValue();
    if (validate(value)) {
      var iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      iframe.id = 'wxi-injection';
      gPreview.appendChild(iframe);
      var content = iframe.contentDocument || iframe.contentWindow.document;
      content.open();
      content.write(value);
      content.close();
    }
    $("#wxi-editor-statusBar-message").text("Updated.");
  };

  // validate: from THREE.js example
  var validate = function (value) {
    while (gErrorLines.length > 0) {
      gEditor.removeLineClass(gErrorLines.shift(), null, 'errorLine');
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
      var result = esprima.parse(string, { tolerant: true, loc: true }).errors;
      for (var i = 0; i < result.length; i ++) {
        var error = result[i];
        var lineNumber = error.lineNumber + lineStart;
        gErrorLines.push(lineNumber);
        gEditor.addLineClass(lineNumber, null, 'errorLine');
        console.log('Line ' + (lineNumber + 1) + ': ' + error.string);
      }
    } catch (err) {
      var lineNumber = err.lineNumber + lineStart;
      gErrorLines.push(lineNumber);
      gEditor.addLineClass(lineNumber, null, 'errorLine');
      console.log('Line ' + (lineNumber + 1) + ': ' + err.string);
    }

    // console.log(errors);
    return gErrorLines.length === 0;
  };

  // initialize with default code
  $.get('../examples/rezobass.html', function(data) {
    gEditor.setValue(data);
    console.log("loaded.");
  });

});