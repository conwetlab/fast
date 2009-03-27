var ConnectorComponent = Class.create(PaletteComponent, 
    /** @lends ConnectorComponent.prototype */ {
        
    /**
     * Palette component of a connector resource.
     * @param ResourceDescription connectorResourceDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, connectorResourceDescription, /** String */ docId) {
        $super(connectorResourceDescription, docId);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    

    /**
     * Creates a new connector to be dragged.
     * @type ConnectorInstance
     * @override
     */
    _createInstance: function () {
        return new ConnectorInstance(this._resourceDescription);
    }
});

// vim:ts=4:sw=4:et:
