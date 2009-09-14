var ScreenComponent = Class.create(PaletteComponent, 
    /** @lends ScreenComponent.prototype */ {
        
    /**
     * Palette component of a screen building block.
     * @param BuildingBlockDescription screenBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZone, inferenceEngine) {
        $super(description, dropZone, inferenceEngine);
    },

    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new ScreenView(this._buildingBlockDescription);
    },
    
    /**
     * Creates a new screen to be dragged.
     * @type ScreenInstance
     * @override
     */
    _createInstance: function () {
        return new ScreenInstance(this._buildingBlockDescription, this._dropZone, this._inferenceEngine);
    },
    
    /**
     * Gets the title of the palette component
     * @type String
     * @private
     */
    _getTitle: function() {
        return this._buildingBlockDescription.label['en-gb'];  
    }
});

// vim:ts=4:sw=4:et:
