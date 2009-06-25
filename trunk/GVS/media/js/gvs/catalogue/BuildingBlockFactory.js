var BuildingBlockFactory = Class.create(
    /** @lends ResouceFactory.prototype */ {

    /**
     * Abstract building block factory
     * @constructs
     * @abstract
     */
    initialize: function() {
        /**
         * Name of the kind of building block.
         * @type String
         * @private
         */
        this._buildingBlockType = null;

        /**
         * Human-readable name of the kind of building block
         * @type String
         * @private
         */
        this._buildingBlockName = null;

        /**
         * BuildingBlock descriptions
         * @type {BuildingBlockDescription[]}
         * @private
         */
        this._buildingBlockDescriptions = [];
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the type of building block this factory mades.
     * @type String
     */
    getBuildingBlockType: function (){
        return this._buildingBlockType;
    },


    /**
     * Gets the human-readable name of the building block type.
     * @type String
     */
    getBuildingBlockName: function (){
        return this._buildingBlockName;
    },


    /**
     * Gets all the building block descriptions.
     * @type {BuildingBlockDescription[]}
     */
    getBuildingBlockDescriptions: function (){
        return this._buildingBlockDescriptions;
    },

    updateBuildingBlockDescriptions: function (buildingBlockDescriptions) {
        throw "Abstract Method invocation: BuildingBlockFactory::updateBuildingBlockDescriptions"
    },

    getBuildingBlocks: function (/** Array*/ buildingBlockIds) {
        throw "Abstract Method invocation: BuildingBlockFactory::getBuildingBlockDescriptions"
    }
});

// vim:ts=4:sw=4:et: 
