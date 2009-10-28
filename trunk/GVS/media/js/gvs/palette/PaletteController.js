var PaletteController = Class.create(
    /** @lends PaletteController.prototype */ {

    /**
     * Manages a set of palettes.
     * @constructs
     * @param buildingBlocks
     *      Is an array of objects.
     *      Each objects contains the set for the building block
     *      and its associated drop zone
     */
    initialize: function(/** Array */ buildingBlocks, /** InferenceEngine */ inferenceEngine) {
        
        
        /**
         * List of available palettes
         * @type {Hash}
         * @private @member
         */
        this._palettes = new Hash();
        
        /**
         * AccordionContainer which contains the different palettes
         * @type AccordionContainer
         * @private @member
         */
        this._node = new dijit.layout.AccordionContainer({
                "class":"palettePane",
                "region":"left",
                "minSize":"170",
                "maxSize":"300",
                "splitter":"true",
                "livesplitters":"false",
                "style":"width:220px;"
                });
         
        //Create all the document necessary palettes
        $A(buildingBlocks).each (function(buildingBlock) {
           var palette = new Palette (buildingBlock.set, buildingBlock.dropZone, inferenceEngine); 
           this._palettes.set(buildingBlock.set.getBuildingBlockType(), palette);
           this._node.addChild(palette.getNode());
        }.bind(this));
    },

    // **************** PUBLIC METHODS **************** //
    getPalette: function (/** String */ type) {
        return this._palettes.get(type);
    },
    
    getNode: function() {
        return this._node;
    },
    
    /**
     * Starts the data retrieval from the catalogue.
     */
    startRetrievingData: function() {
        this._palettes.each(function(pair) {
            pair.value.startRetrievingData(); 
        });
    },
    
    /**
     * All uris of all the components (of all the palettes)
     */
    getComponentUris: function() {
        return this._palettes.get(Constants.BuildingBlock.SCREEN).getComponentUris();
    }

    // **************** PRIVATE METHODS **************** //
    
});

// vim:ts=4:sw=4:et: 
