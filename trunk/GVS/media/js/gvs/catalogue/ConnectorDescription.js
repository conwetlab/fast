var ConnectorDescription = Class.create(ResourceDescription,
    /** @lends ConnectorDescription.prototype */ {

    /**
     * Connector resource description.
     * TODO: replace with the object the remote catalogue will send
     * @constructs
     * @extends ResourceDescription
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
