var ScreenInferenceEngine = Class.create( /** @lends ScreenInferenceEngine.prototype */ InferenceEngine, {
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

    
    
    // **************** PRIVATE METHODS **************** //
     /**
     * Creates a body to be sent in an AJAX call to the 
     * catalogue
     * @private
     * @overrides
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Object */ elements,
                    /** Array */ tags,
                    /** String*/ criteria, /** String(Optional) */ _method) {
        var method = Utils.variableOrDefault(_method, "");
        /*var domainContext = {
            'tags': tags,
            'user': GVSSingleton.getInstance().getUser().getUserName()
        };*/

        var domainContext = {
            'tags': tags.collect(function(tag){ return tag.label['en-gb']}),
            'user': GVSSingleton.getInstance().getUser().getUserName()
        }
        var body = {
            'canvas': canvas,
            'domainContext': domainContext,
            'criterion': criteria
        };
        if (method == "check") {
            body.search = false;
        }
        body = Object.extend(body, elements);
        return Object.toJSON(body);
    },
    
    /**
     * Gets the uri for a given operation
     * @private
     * @overrides
     */ 
    _getUri:function (/** String */ operation) {
        return URIs.catalogueScreenFindCheck;
    },
    
    /** 
     * onSuccess callback
     * @private
     * @overrides
     */
    _findCheckOnSuccess: function(/** XMLHttpRequest */ transport){
        var result = JSON.parse(transport.responseText);
        
        if (result.canvas && result.canvas.length > 0) {
            // There is some reachability information
              this.mine._updateReachability(result.canvas);
        }
        
        this.callback(result);        
    },
    
    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _checkOnSuccess: function(transport){
        try {
             var result = JSON.parse(transport.responseText);
             this.mine._updateReachability(result.canvas);
             this.callback(result);
        }
        catch (e) {

        }
    }
});

// vim:ts=4:sw=4:et:
