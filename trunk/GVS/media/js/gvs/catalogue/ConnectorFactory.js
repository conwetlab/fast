var ConnectorFactory = Class.create(ResourceFactory,
    /** @lends ConnectorFactory.prototype */ {

    /**
     * Factory of connector resources.
     * @constructs
     * @extends ResouceFactory
     */
    initialize: function($super) {
        $super();
        var connectorsPath = '/fast/images/palette/connectors/';

        this._resourceType = 'connector';
        this._resourceName = 'Connectors';
        this._resourceDescriptions = [
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
    }
});

// vim:ts=4:sw=4:et: 
