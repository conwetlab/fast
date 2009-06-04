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
        var instance = new ConnectorInstance(this._resourceDescription);
        var properties = new Hash();
        properties.set('fact','none');
        properties.set('type',this.getResourceDescription().type);
        instance.setProperties(properties);
        instance.getView().update(properties);
        return instance;
    },
    
    /**
     * Gets the title of the palette component
     * @type String
     * @private
     */
    _getTitle: function() {
        return this._resourceDescription.type;  
    }
});

// vim:ts=4:sw=4:et:
