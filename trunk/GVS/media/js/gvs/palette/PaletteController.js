var PaletteController = Class.create(
    /** @lends PaletteController.prototype */ {

    /**
     * Manages a set of palettes.
     * @constructs
     */
    initialize: function() {
        /**
         * List of available palettes
         * @type {Hash}
         * @private
         */
        this._palettes = {};
        this._containerNode = dijit.byId("palette");

        // TODO: create all the palettes
        var screenPalette = new Palette("screen");
        var connectorPalette = new Palette("connector");
        var domainConceptPalette = new Palette("domainConcept");
        this._palettes["screen"] = screenPalette;
        this._palettes["connector"] = connectorPalette;
        this._palettes["domainConcept"] = domainConceptPalette;
    },
    

    // **************** PUBLIC METHODS **************** //
    

    /**
     * Show appropiate palettes.
     */
    showValidPalettes: function ( /** String */ validResources) {
        $H(this._palettes).each (function (pair){
            //If the palette is valid
            if ($A(validResources).indexOf(pair.key)>=0) {
                pair.value.setVisible(true);
            } else {
                pair.value.setVisible(false);
            }
        });
    },

    getPalette: function (/** String */ type) {
        return this._palettes[type];
    }

    // **************** PRIVATE METHODS **************** //
    
});

// vim:ts=4:sw=4:et: 
