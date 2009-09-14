var BuildingBlockSet = Class.create( /** @lends BuildingBlockSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     */ 
    initialize: function(/** Array */ context) {
        /** 
         * Associated context
         * @type Array
         * @private @member
         */
        this._context = context;
        
        /** 
         * Building block factory
         * @type BuildingBlockFactory
         * @private @member
         */
        this._factory = null;
        
        
        /** 
         * Set listener
         * @type SetListener
         * @private @member
         */
        this._listener = null;
    },
    

    // **************** PUBLIC METHODS **************** //
    
    /**
     * Starts data retrieval. Override when necessary
     * @public
     */
    startRetrievingData: function() {
    },   
    
    /**
     * Returns all the building block descriptions from the set
     * @type Array
     * @abstract
     */
    getBuildingBlocks: function () {
        throw "Abstract method invocation. BuildingBlockSet::getBuildingBlocks";
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
    }
    
});

// vim:ts=4:sw=4:et:
