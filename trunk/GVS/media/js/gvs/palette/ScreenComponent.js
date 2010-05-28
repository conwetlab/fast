var ScreenComponent = Class.create(PaletteComponent,
    /** @lends ScreenComponent.prototype */ {

    /**
     * Palette component of a screen building block.
     * @param BuildingBlockDescription screenBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
        this._inferenceEngine.addReachabilityListener(this._buildingBlockDescription.uri, this._view);
    },

    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @private
     * @override
     */
    _createView: function () {
        var view = new ScreenView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new screen to be dragged.
     * @type ScreenInstance
     * @private
     * @override
     */
    _createInstance: function () {
        return new ScreenInstance(this._buildingBlockDescription, this._inferenceEngine);
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
