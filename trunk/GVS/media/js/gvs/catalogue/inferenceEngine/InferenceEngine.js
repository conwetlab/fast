var InferenceEngine = Class.create( /** @lends InferenceEngine.prototype */ {
    /**
     * This abstract class represents an inference engine as a proxy for the
     * catalogue, handling the reachability and recommendation of building blocks
     * @constructs
     * @abstract
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
        persistenceEngine.sendPost(this._getUri("findCheck"), null, body,
                context, this._findCheckOnSuccess, this._onError);
    },
    
    /**
     * This function calls the check operation in the catalogue
     */
    check: function (/**Array*/ canvas, /** Object */ elements,
                    /** Array */ domainContext, 
                    /** String*/ criteria, 
                    /** Function */ callback) {
        var body = this._constructBody(canvas, elements, domainContext, criteria, "check");
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        var context = {
            'callback': callback,
            'mine': this
        };
        persistenceEngine.sendPost(this._getUri("check"), null, body, context, 
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
     * Returns the reachability information about
     * the preconditions of a given screen
     * @type Hash
     */
    getPreconditionReachability: function(/** String */ uri) {
        var reachabilityData = this._reachabilityData.get(uri);
        var result = new Hash();
        if (reachabilityData.preconditions) {
            if (reachabilityData.preconditions.length > 1) {
            //More than one set of preconditions
            console.log("OR precondition support not implemented yet");
            return null;
            }
            else {
                var preconditions = reachabilityData.preconditions[0];
                $A(preconditions).each(function(pre) {
                    var uri = Utils.extractURIfromPattern(pre.pattern);
                    result.set(uri, pre.satisfied);
                });
            }
        } else {
            if (reachabilityData.actions) {
                $A(reachabilityData.actions).each(function(action) {
                    $A(action.preconditions).each(function(pre) {
                        var uri = Utils.extractURIfromPattern(pre.pattern);
                        result.set(uri,pre.satisfied);
                    });
                });
            } else {
                console.log("unknown reachability data format");
                return null;
            }
        }
        return result;
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
         } else {
            return null;
         }
     },
    
    // **************** PRIVATE METHODS **************** //
    
    /**
     * Creates a body to be sent in an AJAX call to the 
     * catalogue
     * @private @abstract
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Object */ elements,
                    /** Array */ domainContext, 
                    /** String*/ criteria) {
        throw "Abstract Method invocation: InferenceEngine::_constructBody";     
    },
    
    /**
     * Gets the uri to be called
     * @private @abstract
     * @type String
     */
    _getUri: function (/** String */ operation) {
        throw "Abstract Method invocation: InferenceEngine::_getUri";       
    },
    
    
    /** 
     * onSuccess callback
     * @private
     * @abstract
     */
    _findCheckOnSuccess: function(/**XMLHttpRequest*/ transport){
        throw "Abstract method invocation: InferenceEngine::_findCheckOnSuccess";
    },

    /**
     * onSuccess callback
     * @private
     * @abstract
     */
    _checkOnSuccess: function(transport){
        throw "Abstract method invocation: InferenceEngine::_CheckOnSuccess";
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
    }
});

// vim:ts=4:sw=4:et:
