var PaletteController = Class.create(
    /** @lends PaletteController.prototype */ {

    /**
     * Manages a set of palettes.
     * @constructs
     */
    initialize: function(/** AbstractDocument */ parent) {
        /**
         * List of available palettes
         * @type {Hash}
         * @private
         */
        this._palettes = new Hash();
        
         /**
         * Document which contains the palette
         * @type AbstractDocument
         * @private
         */       
        this._parent = parent;
        
        this._containerNode = null;
        
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._paletteId = uidGenerator.generate("palette");
        
        var mine = this;
        
        //Create all the document necessary palettes
        this._parent.getValidBuildingBlocks().each (function(buildingBlock){
           var palette = new Palette (buildingBlock, mine._parent); 
           mine._palettes.set(buildingBlock, palette);
           mine.getNode().addChild(palette.getNode());
        });
    },

    // **************** PUBLIC METHODS **************** //
    /**
     * This function retrieve remote information 
     * from the catalogue based on a given domain context
     * 
     */
    populateBuildingBlocks: function (/** Array */ domainContext){
        this._palettes.each (function (pair){
            pair.value.populateBuildingBlocks(domainContext);
        });
    },

    /**
     * Updates each palette
     */
    updatePalettes: function () {
        $H(this._palettes).each (function (pair){
            pair.value.updateComponents();
        });
    },
    
    /**
     * Paints each palette from each factory
     */
    paintPalettes: function () {
        $H(this._palettes).each (function (pair){
            pair.value.paintComponents();
        });
    },

    getPalette: function (/** String */ type) {
        return this._palettes.get(type);
    },
    
    getNode: function() {
        if(this._containerNode == null){
            var palettePane = new dijit.layout.AccordionContainer({
                "id":this._paletteId,
                "class":"palettePane",
                "region":"left",
                "minSize":"170",
                "maxSize":"300",
                "splitter":"true",
                "livesplitters":"false",
                "style":"width:220px;"
                });
            this._containerNode = palettePane;
        }
        return this._containerNode;
    },
    
    /**
     * Updates the reachability of each palette component
     */
    updateReachability: function(/** map id->value*/screenList){
        //TODO: Currently, only the screen palette is updated...
        var screens = this.getPalette(Constants.BuildingBlock.SCREEN).getComponents();
        for (var i = 0; i < screens.length; i++) {
            for (var j = 0; j < screenList.length; j++) {
                if (screens[i].getBuildingBlockDescription().uri == screenList[j].uri) {
                    if (screenList[j].reachability == true) {
                        screens[i].getBuildingBlockDescription().satisfeable = true;
                        break;
                    }
                    else {
                        screens[i].getBuildingBlockDescription().satisfeable = false;
                    }
                }
            }
            screens[i].colorize();
        }
    }

    // **************** PRIVATE METHODS **************** //
    
});

// vim:ts=4:sw=4:et: 
