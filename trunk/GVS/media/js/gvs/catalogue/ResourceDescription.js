var ResourceDescription = Class.create(
    /** @lends ResourceDescription.prototype */ {
    
    /**
     * Generic resource description. All the resource classes extends
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
     * Creates and returns a palette component based on the resource.
     * This method must be overriden on child classes.
     *
     * @type PaletteComponent
     * @public @abstract
     */
    createPaletteComponent: function () {
        throw 'Abstract Method invocation. ' + 
            'ResourceDescription :: createPaletteComponent';
    },
    
    /**
     * Creates and returns a view based on the resource.
     * This method must be overriden on child classes.
     *
     * @type ResourceView
     * @public @abstract
     */
    createView: function () {
        throw 'Abstract Method invocation. ' +
            'ResourceDescription :: createView';
    }


    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
