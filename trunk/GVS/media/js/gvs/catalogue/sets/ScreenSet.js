var ScreenSet = Class.create(BuildingBlockSet, /** @lends ScreenSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     * @extends BuildingBlockSet
     */ 
    initialize: function($super, /** Array */ context) {
        $super(context);
        
        /** 
         * List of BuildingBlock URIs
         * @type Array
         * @private @member
         */
        this._uris = new Array();
        
        this._factory = CatalogueSingleton.getInstance().
            getBuildingBlockFactory(Constants.BuildingBlock.SCREEN);
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
     * Add new building blocks to the set by uri
     */
    addURIs: function (/** Array */ uris) {
        this._requestedUris = uris;
        this._factory.cacheBuildingBlocks(uris, this._cachedElements.bind(this));
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This is the callback called when returning from the 
     * building block factory
     */
    _cachedElements: function () {
        this._uris = this._uris.concat(this._requestedUris).uniq();
        this._listener.setChanged();
    }
    
});

// vim:ts=4:sw=4:et:
