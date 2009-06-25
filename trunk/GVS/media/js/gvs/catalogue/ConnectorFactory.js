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

        this._buildingBlockType = 'connector';
        this._buildingBlockName = 'Connectors';
        this._buildingBlockDescriptions = [
            new ConnectorDescription ({
                type: 'In'
            }),
            new ConnectorDescription ({
                type: 'Out'
            })
            ];
        /*
        this._buildingBlockDescriptions = [
            new ConnectorDescription ({
                name: 'Slot',
                image: connectorsPath + 'greenCircle.png',
                fact: '',
                fact_attribute:'',
                variable_name:'',
                label:'',
                friendcode:''
            }),
            new ConnectorDescription ({
                name: 'Event',
                image: connectorsPath + 'greenCircle.png',
                fact: '',
                fact_attribute:'',
                variable_name:'',
                label:'',
                friendcode:''
            }),
            new ConnectorDescription ({
                name: 'User Preferences',
                image: connectorsPath + 'greenCircle.png',
                fact: '',
                fact_attribute:'',
                variable_name:'',
                label:'',
                friendcode:''
            }),
            new ConnectorDescription ({
                name: 'Context Information',
                image: connectorsPath + 'greenCircle.png',
                fact: '',
                fact_attribute:'',
                variable_name:'',
                label:'',
                friendcode:''
            })
        ];
        */
    },

    // **************** PUBLIC METHODS **************** //

    updateBuildingBlockDescriptions: function (buildingBlockDescriptions) {
    },

    getBuildingBlocks: function (/** Array*/ buildingBlockIds) {
    }

});

// vim:ts=4:sw=4:et: 
