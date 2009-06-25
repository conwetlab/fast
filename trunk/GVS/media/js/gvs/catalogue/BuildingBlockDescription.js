var BuildingBlockDescription = Class.create(
    /** @lends BuildingBlockDescription.prototype */ {
    
    /**
     * Generic building block description. All the building block classes extends
     * this one.
     * @constructs
     */
    initialize: function(/** Hash */ properties) {
        // copying all the properties
        var mine = this;
        $H(properties).each(
            function (pair){
                mine[pair.key] = pair.value;
            }
        );
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Creates and returns a palette component based on the building block.
     * This method must be overriden on child classes.
     *
     * @type PaletteComponent
     * @public @abstract
     */
    createPaletteComponent: function () {
        throw 'Abstract Method invocation. ' + 
            'BuildingBlockDescription :: createPaletteComponent';
    },
    
    /**
     * Creates and returns a view based on the building block.
     * This method must be overriden on child classes.
     *
     * @type BuildingBlockView
     * @public @abstract
     */
    createView: function () {
        throw 'Abstract Method invocation. ' +
            'BuildingBlockDescription :: createView';
    }


    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
