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
        this._palettes["screen"] = screenPalette; 
    },
    

    // **************** PUBLIC METHODS **************** //
    

    /**
     * Show appropiate palettes.
     * TODO: rename to showValidPalettes
     */
    updateValidPalettes: function ( /** String */ validResources) {
        $H(this._palettes).each (function (pair){
            //If the palette is valid
            if ($A(validResources).indexOf(pair.key)>=0) {
                pair.value.setVisible(true);
            } else {
                pair.value.setVisible(false);
            }
        });
    }

    // **************** PRIVATE METHODS **************** //
    
});

// vim:ts=4:sw=4:et: 
