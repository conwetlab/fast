var DomainConceptFactory = Class.create(BuildingBlockFactory,
    /** @lends DomainConceptFactory.prototype */ {

    /**
     * Factory of domain concept building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

        this._buildingBlockType = Constants.BuildingBlock.DOMAIN_CONCEPT;
        this._buildingBlockName = 'Domain Concepts';
        this._buildingBlockDescriptions = [];
    },


    // **************** PUBLIC METHODS **************** //

    updateBuildingBlockDescriptions: function (domainConceptDescriptions) {
        for (var i=0; i<domainConceptDescriptions.length ; i++) {
            var already_exists = false;
            for (var j=0; j<this._buildingBlockDescriptions.length; j++) {
                if(this._buildingBlockDescriptions[j].name==domainConceptDescriptions[i].name){
                    already_exists = true;
                }
            }
            if(!already_exists){
                this._buildingBlockDescriptions.push(new DomainConceptDescription (domainConceptDescriptions[i]));
            }
        }
    },

    getBuildingBlocks: function (/** Array*/ buildingBlockIds) {
    },
    
    //TODO: Remove This
    getBuildingBlockDescriptions: function (){
        return this._buildingBlockDescriptions;
    }
});

// vim:ts=4:sw=4:et: 
