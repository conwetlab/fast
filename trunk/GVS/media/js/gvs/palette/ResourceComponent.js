var ResourceComponent = Class.create(PaletteComponent, 
    /** @lends ResourceComponent.prototype */ {
        
    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription ResourceBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new ResourceView(this._buildingBlockDescription);
    },
    
    /**
     * Creates a new resource to be dragged.
     * @type ResourceInstance
     * @override
     */
    _createInstance: function () {     
        return new ResourceInstance(this._buildingBlockDescription, this._inferenceEngine);
    },
    
    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        return this._buildingBlockDescription.label['en-gb'];
    }
    
});

// vim:ts=4:sw=4:et:
