var FormComponent = Class.create(PaletteComponent, 
    /** @lends FormComponent.prototype */ {
        
    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription FormBuildingBlockDescription
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
        return new FormSnapshotView(this._buildingBlockDescription);
    },
    
    /**
     * Creates a new Form to be dragged.
     * @type FormInstance
     * @override
     */
    _createInstance: function () {     
        return new FormInstance(this._buildingBlockDescription, this._inferenceEngine);
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
