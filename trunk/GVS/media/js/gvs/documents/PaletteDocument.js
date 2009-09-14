var PaletteDocument = Class.create(AbstractDocument, /** @lends PaletteDocument.prototype */ {
    /**
     * Represents a document and its tab. Subclasses must provide the 
     * inner content.
     * @abstract
     * @extends AbstractDocument
     * @constructs
     */ 
    initialize: function($super,
            /** String */ title, 
            /** Array */ validBuildingBlocks,
            /** Array */ domainContext) {
        $super(title);
        
        /**
         * List of tags
         * @type Array
         */
        this._domainContext = domainContext;
        
        /**
         * Main border container
         * @type dijit.layout.BorderContainer
         * @private @member
         */
        this._mainBorderContainer;
        
        var buildingBlockSets = new Array();
        
        $A(validBuildingBlocks).each(function(blockType) {
            var buildingBlockSet;
            switch (blockType) {
                case Constants.BuildingBlock.SCREEN:
                    buildingBlockSet = new ScreenSet(this._domainContext);
                    break;
                    
                case Constants.BuildingBlock.DOMAIN_CONCEPT:
                    buildingBlockSet = new DomainConceptSet(this._domainContext);
                    break;

                default:
                    throw "Unexpected type of building block: " + blockType +
                            ". PaletteDocument::initialize";
            }
            
            buildingBlockSets.push(buildingBlockSet);
        }.bind(this));
        
        this._renderMainUI();
        
        /**
         * InferenceEngine
         * @type InferenceEngine
         * @private @member
         */ 
        this._inferenceEngine = new InferenceEngine();
               
        /**
         * Palette Controller
         * @type PaletteController
         * @private @member
         */ 
        this._paletteController = new PaletteController(buildingBlockSets,
                /* (DropZone) */this, this._inferenceEngine);
        
        this._renderPaletteArea();
        
    },
    
    /**
     * Implementing DropZone interface.
     * To be overriden.
     */
    drop: function(/** Object */ droppedElement) {
        throw "Abstract method invation. PaletteDocument::drop";
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Constructs the document content.
     * @private
     */
    _renderMainUI: function(){

        this._mainBorderContainer = new dijit.layout.BorderContainer({
            design:"sidebar",
            liveSplitters:"false",
            splitter:"true"
        });
       
        this._mainBorderContainer.addChild(this._renderCenterContainer());

        this._tab.setContent(this._mainBorderContainer.domNode);
    },
    /**
     * Renders the palette area
     */
    _renderPaletteArea: function() {
        this._mainBorderContainer.addChild(this._paletteController.getNode());
    },

    /**
     * This function creates the area containing the canvas
     * and the inspectors
     * @abstract
     */
    _renderCenterContainer: function() {
        throw "Abstract method invocation. PaletteDocument::_renderCenterContainer";
    }
    
});

// vim:ts=4:sw=4:et:
