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
                    /** Array */ domainContext, 
                    /** String*/ criteria) {
        var domain = {
            'tags': domainContext,
            'user': null /* TODO: add user here */
        };
        var body = {
            'canvas': canvas,
            'domainContext': domain,
            'criterion': criteria
        };
        body = Object.extend(body, elements);
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
                return URIs.catalogueScreenFindCheck;
                break;
            case "check":
                return URIs.catalogueScreenCheck;
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
        
        // TODO
        // this.mine._updateReachability(result);
        
        
        this.callback(result);        
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
