var BuildingBlockSet = Class.create( /** @lends BuildingBlockSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     */
    initialize: function(/** Array */ tags, /** BuildingBlockFactory */ factory) {
        /**
         * Associated tags
         * @type Array
         * @private @member
         */
        this._tags = tags;

        /**
         * Building block factory
         * @type BuildingBlockFactory
         * @private @member
         */
        this._factory = factory;


        /**
         * Set listener
         * @type SetListener
         * @private @member
         */
        this._listener = null;

        /**
         * List of BuildingBlock URIs
         * @type Array
         * @private @member
         */
        this._uris = new Array();
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Returns all the building block descriptions from the set
     * @type Array
     * @override
     */
    getBuildingBlocks: function () {
        return this._factory.getBuildingBlocks(this._uris);
    },

    /**
     * Gets the type of building block this factory mades.
     * @type String
     */
    getBuildingBlockType: function (){
        return this._factory.getBuildingBlockType();
    },

    /**
     * Gets the human-readable name of the building block type.
     * @type String
     */
    getBuildingBlockName: function (){
        return this._factory.getBuildingBlockName();
    },

    setListener: function (/** SetListener */ listener) {
        this._listener = listener;
    },

     /**
     * Add new building blocks to the set by uri
     */
    setURIs: function (/** Array */ uris) {
        this._requestedUris = uris;
        this._factory.cacheBuildingBlocks(uris, this._cachedElements.bind(this));
    },

    /**
     * This is the callback called when returning from the
     * building block factory
     * @private
     */
    _cachedElements: function () {
        this._uris = this._requestedUris;
        this._listener.setChanged();
    }
});

// vim:ts=4:sw=4:et:
