var Debugger = Class.create(/** @lends Debugger.prototype */ {
    /**
     * Class that handles all the debugging process
     * @constructs
     */
    initialize: function(debugLevel) {

        /**
         * Debug level in logging|debug (debug is more complete than logging)
         * @private
         * @type String
         */
        this._debugLevel = debugLevel;


        /**
         * Node of the Debugger area, in case Firebug is not
         * installed
         * @type DOMNode
         * @private
         */
        this._debuggerNode = new Element("div", {
            "id": "debugger"
        });
        document.body.appendChild(this._debuggerNode);
        document.body.addClassName(this._debugLevel);

        /**
         * Number of logging groups opened
         * @private
         * @type Number
         */
        this._indentLevel = 0;


        /**
         * Flag for testing purposes, remove when deploying
         * @private
         * @type Boolean
         */
        this._testing = false;

        this._initConsole();
    },

    /**
     * Adds a new fact to the fact base
     */
    addFact: function(fact) {
        this._showObject(fact, "Fact added: %s", fact.uri);
    },

    /**
     * Removes a fact from the fact base
     */
    removeFact: function(fact) {
        this._showObject(fact, "Fact removed: %s", fact.uri);
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
            this._logger.groupEnd();
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

        if (this._testing || window.console === undefined) {
            this._logger = new Logger(this._debuggerNode);
            document.body.addClassName("no-firebug");
        } else {
            this._logger = window.console;
        }
    },

    /**
     * Shows an object in the console, wrapped in a group
     * @private
     */
    _showObject: function(_object /* , title ... */) {
        var titleArgs = Array.prototype.slice.call(arguments, 1);
        this._logger.groupCollapsed.apply(this._logger, titleArgs);
        this._logger.dir(_object);
        this._logger.groupEnd();
    }
});


// Logger class to replace firebug in case it does not be installed
var Logger = Class.create({

    /**
     * @constructs
     */
    initialize: function(debuggerNode) {
        this._loggerNode = new Element("div", {
            "style": "margin-top:3px"
        });


        var clearButton = new Element("a", {
            "class": "clear",
            "href": "javascript:"
        }).update("Clear");
        clearButton.observe("click", function(){
            this._loggerNode.update();
            this._currentLevel = this._loggerNode;
        }.bind(this));

        var loggerContainer = new Element("div", {
            "class": "logger"
        });
        loggerContainer.appendChild(clearButton);
        loggerContainer.appendChild(this._loggerNode);

        debuggerNode.appendChild(loggerContainer);

        /**
         * Current DOM level of the log writing
         * Necessary to allow tree hierarchy
         * @private
         * @type DOMNode
         */
        this._currentLevel = this._loggerNode;
    },

    log: function(/* arguments ... */) {
        this._writeMessage("log", arguments);
    },

    debug: function(/* arguments ... */) {
        this._writeMessage("debug", arguments);
    },

    info: function(/* arguments ... */) {
        this._writeMessage("info", arguments);
    },

    warn: function(/* arguments ... */){
        this._writeMessage("warn", arguments);
    },

    error: function(/* arguments ... */) {
        this._writeMessage("error", arguments);
    },

    assert: function(/** Boolean */ expression /*, arguments ... */) {
        if (expression == false) {
            args = Array.prototype.slice.call(arguments, 1);
            this._error.apply(this, args);
        }
    },

    dir: function(object) {
       switch(object.constructor) {
            case Array:
                for (var i=0; i < object.length; i++) {
                    if (object[i].constructor == Object ||
                        (object[i].constructor == Array && object[i].length > 0)) {
                        this._createGroup(true, [i.toString(), ": ", this._print(object[i])]);
                        this.dir(object[i]);
                        this.groupEnd();
                    } else {
                        this.log(i, ": ", this._print(object[i]));
                    }
                }
                break;
            case Object:
                $H(object).keys().each(function(key) {
                    if (object[key].constructor == Object ||
                        (object[key].constructor == Array && object[key].length > 0)) {
                        this._createGroup(true, [key, ": ", this._print(object[key])]);
                        this.dir(object[key]);
                        this.groupEnd();
                    } else {
                        this.log(key, ": ", this._print(object[key]));
                    }
                }, this);
                break;
            default:
                this.log(this._print(object));
       }
    },

    dirxml: function(xmlObject){
        this.log((new XMLSerializer()).serializeToString(xmlObject));
    },

    group: function(/* arguments ... */) {
       this._createGroup(false, arguments);
    },

    groupCollapsed: function(/* arguments ... */){
       this._createGroup(true, arguments);
    },

    groupEnd: function(){
        if (this._currentLevel != this._loggerNode) {
            this._currentLevel = this._currentLevel.parentNode;
        }
    },

    table: function(){},

    // ************** PRIVATE METHODS ************ //

    /**
     * @private
     */
    _writeMessage: function(type, args) {
        if (args.length > 0) {
            var entry = new Element("div", {
                "class": "entry " + type
            });
            var message = this._getComputedText(args);
            var messageNode = new Element("span", {
                "class": "message"
            });
            messageNode.textContent = message;
            entry.appendChild(messageNode);

            this._currentLevel.appendChild(entry);
        }
    },

    /**
     * @private
     */
    _createGroup: function(collapsed, args) {
        var newGroup = new Element("div", {
            "class": "group"
        });
        newGroup.setStyle({
            "display": collapsed ? "none" : "block"
        });
        var button = new Element("div", {
            "class": "groupButton " + (collapsed ? "plus" : "minus")
        }).update("+");

        button.observe("click", function(e) {
            var nextCollapsed = newGroup.style.display == "block" ? true : false;
            newGroup.setStyle({
                "display": nextCollapsed ? "none" : "block"
            });
            if (nextCollapsed) {
                button.removeClassName("minus");
                button.addClassName("plus");
                button.update("+");
            } else {
                button.removeClassName("plus");
                button.addClassName("minus");
                button.update("-");
            }
        });

        var entry = new Element("div", {
            "class": "entry groupTitle"
        });
        entry.appendChild(button);
        var messageNode = new Element("span", {
            "class": "message"
        }).update(this._getComputedText(args));

        entry.appendChild(messageNode);
        this._currentLevel.appendChild(entry);
        this._currentLevel.appendChild(newGroup);

        this._currentLevel = newGroup;
    },

    /**
     * @private
     */
    _getComputedText: function(args) {
        var message = args[0];

        for (i=1; i < args.length; i++) {
            if (message.match(/%[s,i,d,f]/)) {
                message = message.replace(/%[s,i,d,f]/, args[i]);
            } else {
                message += args[i];
            }
        }
        return message;
    },

    _print: function(element) {
        var result;
        switch (element.constructor) {
            case Array:
                result = "[";
                for (var i=0; i < element.length; i++) {
                    result += this._print(element[i]);
                    if (i != (element.length - 1)) {
                        result += ", ";
                    }
                }
                result += "]";
                break;
            case Object:
                result = "Object {...}";
                break;
            case Function:
                result = "function()";
                break;
            default:
                result = element;
        }
        return result;
    }
});

