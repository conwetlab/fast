var ScreenComponent = Class.create(PaletteComponent, 
    /** @lends ScreenComponent.prototype */ {
        
    /**
     * Palette component of a screen resource.
     * @param ResourceDescription screenResourceDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, screenResourceDescription, /** String */ docId) {
        $super(screenResourceDescription, docId);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    

    /**
     * Creates a new screen to be dragged.
     * @type ScreenInstance
     * @override
     */
    _createInstance: function () {
        return new ScreenInstance(this._resourceDescription);
    },
    
    /**
     * Gets the title of the palette component
     * @type String
     * @private
     */
    _getTitle: function() {
        return this._resourceDescription.label['en-gb'];  
    }
});

// vim:ts=4:sw=4:et:
