var BuildingBlockFactory = Class.create(
    /** @lends BuildingBlockFactory.prototype */ {

    /**
     * Abstract building block factory
     * @constructs
     * @abstract
     */
    initialize: function() {
        
 
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the type of building block this factory mades.
     * @type String
     */
    getBuildingBlockType: function (){
        throw "Abstract method invocation. BuildingBlockFactory::getBuildingBlockType";
    },


    /**
     * Gets the human-readable name of the building block type.
     * @type String
     */
    getBuildingBlockName: function (){
        return Constants.BuildingBlockNames[this.getBuildingBlockType()];
    },


    /**
     * Gets building block descriptions by URI
     * @type {BuildingBlockDescription[]}
     */
    getBuildingBlocks: function (/*...*/) {
        throw "Abstract method invocation. BuildingBlockFactory::getBuildingBlockDescriptions";
    }

});

// vim:ts=4:sw=4:et: 
