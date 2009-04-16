var ResourceFactory = Class.create(
    /** @lends ResouceFactory.prototype */ {

    /**
     * Abstract resource factory
     * @constructs
     * @abstract
     */
    initialize: function() {
        /**
         * Name of the kind of resource.
         * @type String
         * @private
         */
        this._resourceType = null;

        /**
         * Human-readable name of the kind of resource
         * @type String
         * @private
         */
        this._resourceName = null;

        /**
         * Resource descriptions
         * @type {ResourceDescription[]}
         * @private
         */
        this._resourceDescriptions = [];
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the type of resource this factory mades.
     * @type String
     */
    getResourceType: function (){
        return this._resourceType;
    },


    /**
     * Gets the human-readable name of the resource type.
     * @type String
     */
    getResourceName: function (){
        return this._resourceName;
    },


    /**
     * Gets all the resource descriptions.
     * @type {ResourceDescription[]}
     */
    getResourceDescriptions: function (){
        return this._resourceDescriptions;
    },

    updateResourceDescriptions: function (resourceDescriptions) {
        throw "Abstract Method invocation: ResourceFactory::updateResourceDescriptions"
    },

    getResources: function (/** Array*/ resourceIds) {
        throw "Abstract Method invocation: ResourceFactory::getResourceDescriptions"
    }
});

// vim:ts=4:sw=4:et: 
