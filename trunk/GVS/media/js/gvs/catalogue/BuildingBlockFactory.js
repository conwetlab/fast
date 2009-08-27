var BuildingBlockFactory = Class.create(
    /** @lends BuildingBlockFactory.prototype */ {

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
         * Hash table (organized by URI)
         * containing all the BB descriptions
         * @type Hash
         * @private @member
         */
        this._buildingBlockDescriptions = new Hash();
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
     * Gets all the building block descriptions for an array 
     * of domainContexts
     * @type {BuildingBlockDescription[]}
     */
    getBuildingBlockDescriptions: function (/** Array */ domainContexts){
        if (domainContexts && domainContexts.size()>0){
            var buildingBlockResult = new Array();
            
            this._buildingBlockDescriptions.values().each(function (buildingBlock){
                $A(domainContexts).each(function(domainContext){
                    //If the building block is from any of the domain contexts
                    //Add it to the results
                    if ($A(buildingBlock.domainContext.tags).indexOf(domainContext)!= -1){
                        buildingBlockResult.push(buildingBlock);
                    }
                });
            });
            //Remove duplicates
            return buildingBlockResult.uniq();
        }
        else { //all the BB description
            return this._buildingBlockDescriptions.values();
        }
    },

    updateBuildingBlockDescriptions: function (buildingBlockDescriptions) {
        throw "Abstract Method invocation: BuildingBlockFactory::updateBuildingBlockDescriptions"
    },

    getBuildingBlocks: function (/** Array*/ buildingBlockIds) {
        throw "Abstract Method invocation: BuildingBlockFactory::getBuildingBlockDescriptions"
    }
});

// vim:ts=4:sw=4:et: 
