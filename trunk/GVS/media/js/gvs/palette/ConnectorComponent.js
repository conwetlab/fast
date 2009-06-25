var ConnectorComponent = Class.create(PaletteComponent, 
    /** @lends ConnectorComponent.prototype */ {

    /**
     * Palette component of a connector building block.
     * @param BuildingBlockDescription connectorBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, connectorBuildingBlockDescription, /** String */ docId) {
        $super(connectorBuildingBlockDescription, docId);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    

    /**
     * Creates a new connector to be dragged.
     * @type ConnectorInstance
     * @override
     */
    _createInstance: function () {
        var instance = new ConnectorInstance(this._buildingBlockDescription);
        var properties = new Hash();
        properties.set('fact','none');
        properties.set('type',this.getBuildingBlockDescription().type);
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
        return this._buildingBlockDescription.type;  
    }
});

// vim:ts=4:sw=4:et:
