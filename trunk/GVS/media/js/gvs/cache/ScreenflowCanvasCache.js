var ScreenflowCanvasCache = Class.create( /** @lends ScreenCanvasCache.prototype */ {
    /**
     * 
     * @constructs
     */ 
    initialize: function (/** Object */ properties) {
        /**
         * Preconditions of the screenflow
         * @type Array
         * @private
         */
        this._screens = properties.definition.screens ?
                        properties.definition.screens :
                        new Array();

        /**
         * Preconditions of the screenflow
         * @type Array
         * @private
         */
        this._preconditions = properties.definition.preconditions ?
                              properties.definition.preconditions :
                              new Array();

        /**
         * Postconditions of the screenflow
         * @type Array
         * @private
         */
        this._postconditions = properties.definition.postconditions
                               ? properties.definition.postconditions:
                               new Array();

        /**
         * Array of already loaded building block types
         * @type Array
         * @private
         */
        this._elementsLoaded = new Array();
    },
  
    
    // **************** PRIVATE METHODS **************** //

    /**
     * Returns the list of screens
     * @type Array
     */
    getScreenURIs: function() {
        var result = new Array();
        this._screens.each(function(element) {
            result.push(element.uri);
        });
        return result;
    },

    /**
     * Returns the list of preconditions
     * @type Array
     */
    getPreconditions: function() {
        return this._preconditions;
    },

    /**
     * Returns the list of postconditions
     * @type Array
     */
    getPostconditions: function() {
        return this._postconditions;
    },

    /**
     * Returns the id of an element by its URI
     * @type Array
     */
    getIds: function(/** String */ uri) {
        var elements = this._screens.findAll(function(element) {
            return element.uri == uri;
        });
        if (elements) {
            return elements.collect(function(element){return element.uri});
        } else {
            return null;
        }
    },

    /**
     * Returns the position of an element by its URI
     * @type Object
     */
    getPosition: function (/** String */ id) {
        var element = this._screens.detect(function(element) {
            return element.uri == id;
        });
        if (element) {
            return element.position;
        } else {
            return null;
        }
    },

    /**
     * Sets a buildingblock type as already loaded
     */
    setLoaded: function (/** String */ buildingblocktype) {
        this._elementsLoaded.push(buildingblocktype);
    },

    /**
     * Returns true if all the buildingblocks (operators, services and
     * resources), have been loaded
     * @type Boolean
     */
    areInstancesLoaded: function() {
        return this._elementsLoaded.indexOf(Constants.BuildingBlock.SCREEN) != -1;
    }
    
});

// vim:ts=4:sw=4:et:
