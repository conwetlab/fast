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
        this._mainBorderContainer = null;
        
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
         * This property represents the selected element
         * @type BuildingBlockInstance
         * @private @member
         */
        this._selectedElement = null;
                      
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
     * Returns the selected element for the screenflow document
     * @type ComponentInstance
     */
    getSelectedElement: function () {
        return this._selectedElement;
    },

    /**
     * Select a screen in the screenflow document
     * @param ComponentInstance
     *      Element to be selected for the
     *      Screenflow document.
     */
    setSelectedElement: function (element) {
        if (this._selectedElement != null) {
            this._selectedElement.getView().setSelected(false);
        }
        
        if (element != undefined) {
            this._selectedElement = element;
            this._selectedElement.getView().setSelected(true);
        } else {
            this._selectedElement = null;
        }
    },
        
    /**
     * Implementing DropZone interface.
     * To be overriden.
     */
    drop: function(/** Object */ droppedElement) {
        throw "Abstract method invation. PaletteDocument::drop";
    },
    
    /**
     * Keypress event handler
     */
    onKeyPressed: function(/** Event */ e) {    
        
        switch(e.keyCode) {
            case Event.KEY_DELETE:
                if (this._selectedElement != null) { //Delete an element from the canvas
                    var title = null;
                    if (this._selectedElement.getTitle()){
                        title = 'the element "' + this._selectedElement.getTitle() + '"';
                    } else {
                        title = "the selected element";
                    }
                    
                    confirm("You are about to remove " + title + " from canvas. Are you sure?", 
                            function(/** Boolean */ confirmed) {
                                if (confirmed) {
                                    this._deleteSelectedElement();
                                }
                            }.bind(this)
                    );
                }
                break; 
        }
        
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * This function creates the area containing the canvas
     * and the inspectors
     * @abstract
     * @private
     */
    _renderCenterContainer: function() {
        throw "Abstract method invocation. PaletteDocument::_renderCenterContainer";
    },

    /**
     * Delete a screen.
     * @param ComponentInstance
     *      Instance to be deleted from the
     *      Screenflow document.
     * @abstract
     * @private
     */
    _deleteInstance: function(instance) {
        throw "Abstract method invocation. PaletteDocument::_deleteInstance";
    },
    
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

    _deleteSelectedElement: function() {
        if (this._selectedElement != null) {
            this._deleteInstance(this._selectedElement);
            this.setSelectedElement();
        }
    }    
});

// vim:ts=4:sw=4:et:
