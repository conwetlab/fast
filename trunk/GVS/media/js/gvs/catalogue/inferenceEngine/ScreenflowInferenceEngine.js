var ScreenflowInferenceEngine = Class.create(InferenceEngine /** @lends ScreenflowInferenceEngine.prototype */, {
    /**
     * This class handles the reachability and recommendation of building blocks
     * It communicates with the serverside catalogue to retrieve this information
     * @extends InferenceEngine
     * @constructs
     */
    initialize: function($super) {
        $super();
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * This function calls the catalogue to create a plan for a given screen
     */
    getPlans: function(/** Array */ canvas, /** String */ screenUri,
                        /** Function */ handler) {
        var body = {
            "goal": screenUri,
            "canvas": canvas
        };
        var bodyJSON = Object.toJSON(body);
        PersistenceEngine.sendPost(URIs.cataloguePlanner, null, bodyJSON, {'handler': handler},
                                    this._planOnSuccess, this._onError);
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * plan onSuccess
     * @private
     */
    _planOnSuccess: function(transport) {
        var result = JSON.parse(transport.responseText);
        this.handler(result);
    },


    /**
     * Creates a body to be sent in an AJAX call to the
     * catalogue
     * @private
     * @overrides
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Array*/ elements,
                    /** Array */ tags,
                    /** String*/ criteria) {

        /*var domainContext = {
            'tags': tags,
            'user': GVS.getUser().getUserName()
        };*/

        var domainContext = {
            'tags': tags.collect(function(tag){ return tag.label['en-gb']}),
            'user': GVS.getUser().getUserName()
        }
        var body = {
            'canvas': canvas,
            'elements': elements,
            'domainContext': domainContext,
            'criterion': criteria
        };
        return Object.toJSON(body);
    },

    /**
     * Gets the uri for a given operation
     * @private
     * @overrides
     */
    _getUri:function (/** String */ operation) {
        switch(operation) {
            case "findCheck":
                return URIs.catalogueScreenflowFindCheck;
                break;
            case "check":
                return URIs.catalogueScreenflowCheck;
                break;
            default:
                return "";
        }
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _findCheckOnSuccess: function(/**XMLHttpRequest*/ transport){
        var result = JSON.parse(transport.responseText);
        if (result.elements) {
            var paletteElements = result.elements;
        } else {
            var paletteElements = [];
        }

        var allElements = paletteElements.clone();

        result.canvas.each(function(bb) {
            found = allElements.detect(function(element) {
                return (element.uri == bb.uri);
            });
            if (!found) {
                allElements.push(bb);
            }
        }, this);


        this.mine._updateReachability(allElements);

        // Notifying about new uris
        var screenURIs = new Array();
        $A(paletteElements).each(function(element) {
           screenURIs.push(element.uri);
        });

        this.callback(screenURIs);
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _checkOnSuccess: function(transport){
        var result = JSON.parse(transport.responseText);
        var elements = result.elements.concat(result.canvas).uniq();

        this.mine._updateReachability(elements);
        this.callback();
    }
});

// vim:ts=4:sw=4:et:
