(function($) {
    // TODO: make the node ID configurable
    var treeNode = $('#jsdoc-toc-nav');

    // initialize the tree
    treeNode.tree({
        autoEscape: false,
        closedIcon: '&#x21e2;',
        data: [{"label":"<a href=\"global.html\">Globals</a>","id":"global","children":[]},{"label":"<a href=\"Analyzer.html\">Analyzer</a>","id":"Analyzer","children":[]},{"label":"<a href=\"AudioNode.html\">AudioNode</a>","id":"AudioNode","children":[]},{"label":"<a href=\"AudioParam.html\">AudioParam</a>","id":"AudioParam","children":[]},{"label":"<a href=\"BooleanParam.html\">BooleanParam</a>","id":"BooleanParam","children":[]},{"label":"<a href=\"Generator.html\">Generator</a>","id":"Generator","children":[]},{"label":"<a href=\"GenericParam.html\">GenericParam</a>","id":"GenericParam","children":[]},{"label":"<a href=\"ItemizedParam.html\">ItemizedParam</a>","id":"ItemizedParam","children":[]},{"label":"<a href=\"Note.html\">Note</a>","id":"Note","children":[]},{"label":"<a href=\"NoteClip.html\">NoteClip</a>","id":"NoteClip","children":[]},{"label":"<a href=\"PlugInAbstract.html\">PlugInAbstract</a>","id":"PlugInAbstract","children":[]},{"label":"<a href=\"Processor.html\">Processor</a>","id":"Processor","children":[]},{"label":"<a href=\"Transport.html\">Transport</a>","id":"Transport","children":[]},{"label":"<a href=\"WX.html\">WX</a>","id":"WX","children":[{"label":"<a href=\"WX.Log.html\">Log</a>","id":"WX.Log","children":[]},{"label":"<a href=\"WX.PlugIn.html\">PlugIn</a>","id":"WX.PlugIn","children":[]}]}],
        openedIcon: ' &#x21e3;',
        saveState: true,
        useContextMenu: false
    });

    // add event handlers
    // TODO
})(jQuery);
