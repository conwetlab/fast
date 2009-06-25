var ScreenComponent = Class.create(PaletteComponent, 
    /** @lends ScreenComponent.prototype */ {
        
    /**
     * Palette component of a screen building block.
     * @param BuildingBlockDescription screenBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, screenBuildingBlockDescription, /** String */ docId) {
        $super(screenBuildingBlockDescription, docId);
    },

    /**
     * Colorize the component depending on the reachability
     * @public
     */
    colorize: function(){
        this.getView().colorize(this.getBuildingBlockDescription().satisfeable);
    },

    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    

    /**
     * Creates a new screen to be dragged.
     * @type ScreenInstance
     * @override
     */
    _createInstance: function () {
        return new ScreenInstance(this._buildingBlockDescription);
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
