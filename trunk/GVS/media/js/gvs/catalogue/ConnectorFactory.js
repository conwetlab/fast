var ConnectorFactory = Class.create(BuildingBlockFactory,
    /** @lends ConnectorFactory.prototype */ {

    /**
     * Factory of connector building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();
        var connectorsPath = '/fast/images/palette/connectors/';

        this._buildingBlockType = Constants.BuildingBlock.CONNECTOR;
        this._buildingBlockName = 'Connectors';
        this._buildingBlockDescriptions = [
            new ConnectorDescription ({
                type: 'In'
            }),
            new ConnectorDescription ({
                type: 'Out'
            })
            ];
    },

    // **************** PUBLIC METHODS **************** //

    updateBuildingBlockDescriptions: function (buildingBlockDescriptions) {
    },

    getBuildingBlocks: function (/** Array*/ buildingBlockIds) {
    },
    
    /**
     * @overrides
     */
    getBuildingBlockDescriptions: function (){
        return this._buildingBlockDescriptions;
    }

});

// vim:ts=4:sw=4:et: 
