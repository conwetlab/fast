var InferenceEngine = Class.create( /** @lends InferenceEngine.prototype */ {
    /**
     * This class handles the reachability and recommendation of building blocks
     * It communicates with the serverside catalogue to retrieve this information
     * @constructs
     */ 
    initialize: function() {
        
        /**
         * This stores the reachability data
         * @type Hash
         * @private @member
         */
        this._reachabilityData = new Hash();
        
        /**
         * Listeners list hashed by resource URI
         * @type Hash
         * @private @member
         */
        this._listeners = new Hash();
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * This function calls findAndCheck in the catalogue and calls a
     * callback upon completion.
     */
    findCheck: function (/**Array*/ canvas, /** Array*/ elements,
                         /** Array */ domainContext, 
                         /** String*/ criteria,
                         /** Function */ callback) {
        
        var body = this._constructBody(canvas, elements, domainContext, criteria);
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        var context = {
            'callback': callback,
            'mine': this
        };
        persistenceEngine.sendPost(URIs.catalogueFindAndCheck, null, body,
                context, this._findCheckOnSuccess, this._onError);
    },
    
    /**
     * This function calls the check operation in the catalogue
     */
    check: function (/**Array*/ canvas, /** Array*/ elements,
                    /** Array */ domainContext, 
                    /** String*/ criteria) {
        var body = this._constructBody(canvas, elements, domainContext, criteria);
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendPost(URIs.catalogueCheck, null, body, this, 
                                    this._checkOnSuccess, this._onError);                   
    },
    
    /**
     * Register an object for interest on the reachability of a URI-identified
     * resources. The listener object must implement these methods:
     *    
     *    void setReachability(Hash reachabilityData);
     *    
     * Reachability data vary for different resource types:
     *   * Screens: TODO
     *   * ...
     */
    addReachabilityListener: function(/** String */ uri, /** Object */ listener) {
        this._getListenerList(uri).push(listener);
        
        if (this._reachabilityData.get(uri)) {
            listener.setReachability(this._reachabilityData.get(uri));
        }
    },
    /**
     * De-register an object from the reachability listeners
     */
    removeReachabilityListener: function (/** String  */uri, /** Object */ listener) {
        var index = this._getListenerList(uri).indexOf(listener);
        
        if (index >= 0) {
            //Remove the element
            this._listeners.get(uri)[index] = null;
            this._listeners.set(uri,this._listeners.get(uri).compact());
        }
    },
    
    /**
     * Returns a boolean determining if a building block is reachable
     * by its uri
     * @type Boolean
     */
     isReachable: function (/** String */ uri) {
         var reachabilityData = this._reachabilityData.get(uri);
         if (reachabilityData) {
            return reachabilityData.reachability;
         }
     },
     
     /**
     * Returns the reachability information about
     * the preconditions of a given screen
     * @type Hash
     */
    getPreconditionReachability: function(/** String */ uri) {
        var reachabilityData = this._reachabilityData.get(uri);
        if (reachabilityData.preconditions && reachabilityData.preconditions.length > 1) {
            //More than one set of preconditions
            console.log("OR precondition support not implemented yet");
            return null;
        }
        else {
            var preconditions = reachabilityData.preconditions[0];        
            var result = new Hash();
            $A(preconditions).each(function(pre) {
                var uri = Utils.extractURIfromPattern(pre.pattern);
                result.set(uri, pre.satisfied);    
            });
            return result;
        }
    },
    
    // **************** PRIVATE METHODS **************** //
    /** 
     * onSuccess callback
     */
    _findCheckOnSuccess: function(/**XMLHttpRequest*/ transport){
        var result = JSON.parse(transport.responseText);
        var paletteElements = result.elements;
        
        this.mine._updateReachability(paletteElements);
        
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
     */
    _checkOnSuccess: function(transport){
        var result = JSON.parse(transport.responseText);
        var elements = result.elements.concat(result.canvas).uniq();
        
        this._updateReachability(elements);
    },
    
    /**
     * Error handler
     * @private
     */
    _onError: function(transport, e){
        Logger.serverError(transport,e);
    },
    /**
     * Returns a list of listeners of an uri
     * @private
     */
    _getListenerList: function (/** String */ uri) {
        var list = this._listeners.get(uri);
        if (!list) {
            list = new Array();
            this._listeners.set(uri, list);
        }
        return list;
    },
    /**
     * Updates and notifies the reachability 
     * of a list of elements
     * @private
     */
    _updateReachability: function(/** Array */ elements) {
        elements.each(function(element) {
            this._reachabilityData.set(element.uri, element);
            this._notifyReachability(element.uri);
        }.bind(this));  
    },
    
    /**
     * Notifies the reachability information to all the relevant
     * listeners
     * @private 
     */
    _notifyReachability: function(/** String */ uri) {
        this._getListenerList(uri).each(function(listener) {
            listener.setReachability(this._reachabilityData.get(uri));
        }.bind(this));        
    },
    
    /**
     * Creates a body to be sent in an AJAX call to the 
     * catalogue
     * @private
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Array*/ elements,
                    /** Array */ domainContext, 
                    /** String*/ criteria) {
        var domain = {
            'tags': domainContext,
            'user': null /* TODO: add user here */
        };
        var body = {
            'canvas': canvas,
            'elements': elements,
            'domainContext': domain,
            'criterion': criteria
        };
        return Object.toJSON(body);
    }   
});

// vim:ts=4:sw=4:et:
