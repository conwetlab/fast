var ConnectorDescription = Class.create(BuildingBlockDescription,
    /** @lends ConnectorDescription.prototype */ {

    /**
     * Connector building block description.
     * TODO: replace with the object the remote catalogue will send
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);
    },


    /**
     * Creates a new connector component
     * @override
     */
    createPaletteComponent: function () {
        return new ConnectorComponent(this);
    },

    /**
     * Creates a new connector view
     * @override
     */    
    createView: function () {
        return new ConnectorView(this);
    }
});

// vim:ts=4:sw=4:et: 
