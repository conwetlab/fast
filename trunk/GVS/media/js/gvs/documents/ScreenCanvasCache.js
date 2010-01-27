var ScreenCanvasCache = Class.create( /** @lends ScreenCanvasCache.prototype */ {
    /**
     * 
     * @constructs
     */ 
    initialize: function (/** Object */ properties) {
        /**
         * Buildingblocks of the screen
         * @type Array
         * @private
         */
        this._buildingblocks = properties.definition.buildingblocks;

        /**
         * Pipes of the screen
         * @type Array
         * @private
         */
        this._pipes = properties.definition.pipes;

        /**
         * Triggers of the screen
         * @type Array
         * @private
         */
        this._triggers = properties.definition.triggers;

        /**
         * Preconditions of the screen
         * @type Array
         * @private
         */
        this._preconditions = properties.preconditions[0] ? properties.preconditions[0]:
                               new Array();

        /**
         * Postconditions of the screen
         * @type Array
         * @private
         */
        this._postconditions = properties.postconditions[0] ? properties.postconditions[0]:
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
     * Gets the uri of the form (if any) in form of Array, to
     * get compatibility with factory method
     * @type Array
     */
    getFormURI: function () {
        var form = this._buildingblocks.detect(function(element) {
            return (element.uri.search(/forms/i) != -1);
        });
        if (form) {
            return [form.uri];
        } else {
            return [];
        }
        
    },

    /**
     * Returns the list of operator URIs
     * @type Array
     */
    getOperatorURIs: function() {
        var elements = this._buildingblocks.findAll(function(element) {
            return (element.uri.search(/operators/i) != -1);
        });
        var result = new Array();
        elements.each(function(element) {
            if (result.indexOf(element.uri) == -1) {
                result.push(element.uri);
            }
        });
        return result;
    },

    /**
     * Returns the list of resource URIs
     * @type Array
     */
    getResourceURIs: function() {
        var elements = this._buildingblocks.findAll(function(element) {
            return (element.uri.search(/services/i) != -1);
        });
        var result = new Array();
        elements.each(function(element) {
            if (result.indexOf(element.uri) == -1) {
                result.push(element.uri);
            }
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
     */
    getPostconditions: function() {
        return this._postconditions;
    },

    /**
     * Returns the id of an element by its URI
     * @type Array
     */
    getIds: function(/** String */ uri) {
        var elements = this._buildingblocks.findAll(function(element) {
            return element.uri == uri;
        });
        if (elements) {
            return elements.collect(function(element){return element.id});
        } else {
            return null;
        }
    },

    /**
     * Returns the position of an element by its URI
     * @type Object
     */
    getPosition: function (/** String */ id) {
        var element = this._buildingblocks.detect(function(element) {
            return element.id == id;
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
        var result = (this._elementsLoaded.indexOf(Constants.BuildingBlock.RESOURCE) != -1);
        result = result && (this._elementsLoaded.indexOf(Constants.BuildingBlock.OPERATOR) != -1);
        result = result && (this._elementsLoaded.indexOf(Constants.BuildingBlock.FORM) != -1);
        return result;
    }
    
});

// vim:ts=4:sw=4:et:
