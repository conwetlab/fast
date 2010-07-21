var Debugger = Class.create(/** @lends Debugger.prototype */ {
    /**
     * Class that handles all the debugging process
     * @constructs
     */
    initialize: function() {

        /**
         * Node of the Debugger area, in case Firebug is not
         * installed
         * @type DOMNode
         * @private
         */
        this._debuggerNode = new Element("div", {
            "id": "debugger"
        });

        /**
         * Number of logging groups opened
         * @private
         * @type Number
         */
        this._indentLevel = 0;

        this._initConsole();
    },

    /**
     * Adds a new fact to the fact base
     */
    addFact: function(fact) {
        this._showObject(fact, "Fact added: %s", fact.uri);
    },

    /**
     * Adds a screen into the screenflow
     */
    addScreen: function(screen) {
        this._showObject(screen, "Screen added: %s", screen.title);
    },

    /**
     * Init an AJAX call
     */
    request: function(url, options) {
        // Ensure the log is in the top
        for (var i=0; i < this._indentLevel; i++) {
            this._groupEnd();
            this._indentLevel--;
        }

        this._indentLevel++;
        this._logger.groupCollapsed("Remote request");

        this._logger.dir({
            "method": options.method,
            "url": url
        });
    },

    /**
     * Ends the ajax call (to be called after request)
     */
    onRequestSuccess: function(data, type) {
        this._logger.dir({"Response" : data});

        this._indentLevel++;
        this._logger.groupCollapsed("Details");
        if (type == "xml") {
            this._logger.dirxml(data);
        } else {
            this._logger.dir(data);
        }
        // Two groups must be closed
        this._indentLevel--;
        this._logger.groupEnd();
        this._indentLevel--;
        this._logger.groupEnd();
    },

    // ************** PRIVATE METHODS ************* //

    /**
     * Initializes the console to fake firebugs one, in case it does not exist
     * @private
     */
    _initConsole: function() {
        if (window.console === undefined) {
            // TODO: warn the user to install Firebug
            document.body.appendChild(this._debuggerNode);

            this._logger = {
                log:            function(){},
                debug:          function(){},
                info:           function(){},
                warn:           function(){},
                error:          function(){},
                assert:         function(){},
                dir:            function(){},
                group:          function(){},
                groupCollapsed: function(){},
                groupEnd:       function(){},
                table:          function(){}
            };
        } else {
            this._logger = window.console;
        }
    },

    /**
     * Shows an object in the console, wrapped in a group
     * @private
     */
    _showObject: function(_object /**, title ...*/) {
        var titleArgs = Array.prototype.slice.call(arguments, 1);
        this._logger.groupCollapsed.apply(this, titleArgs);
        this._logger.dir(_object);
        this._logger.groupEnd();
    }
});
