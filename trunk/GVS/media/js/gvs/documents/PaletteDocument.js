var PaletteDocument = Class.create(AbstractDocument, /** @lends PaletteDocument.prototype */ {
    /**
     * Represents a document and its tab. Subclasses must provide the 
     * inner content.
     * @abstract
     * @extends AbstractDocument
     * @constructs
     * @param validBuildingBlocks
     *      Containing the different valid building blocks and their respective drop Zones
     */ 
    initialize: function ($super,
            /** String */ title, 
            /** Array */ buildingBlockSets,
            /** Array */ dropZones,
            /** Array */ tags, /** InferenceEngine */ inferenceEngine) {
        $super(title);
        
        /**
         * List of tags
         * @type Array
         */
        this._tags = tags;
        
        /**
         * Main border container
         * @type dijit.layout.BorderContainer
         * @private @member
         */
        this._mainBorderContainer = null;
        
        this._renderMainUI();
        
        /**
         * InferenceEngine
         * @type InferenceEngine
         * @private @member
         * @abstract
         */ 
        this._inferenceEngine = inferenceEngine;
        
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
        this._paletteController = new PaletteController(buildingBlockSets, dropZones, this._inferenceEngine);
        
        this._renderPaletteArea();
        Utils.showMessage("Loading building blocks...");
    },
    
    /**
     * Returns the selected element for the screenflow document
     * @type ComponentInstance
     */
    getSelectedElement: function () {
        return this._selectedElement;
    },

    
    /**
     * Implementing event listener
     */
    elementClicked: function(/** ComponentInstance */ element, /** Event */ e) {
        this._setSelectedElement(element);    
    },
    
    /**
     * Implementing event listener
     */
    elementDblClicked: function(/** ComponentInstance */ element, /** Event */ e) {
        this._setSelectedElement(element);    
    },

    /**
     * Implementing event listener
     */
    positionUpdated: function(/** ComponentInstance */ element, /** Object */ position) {
        // Do nothing
    },
    
    /**
     * Key press event handler
     * @override
     */
    onKeyPressed: function(/** String */ key) {
        switch(key) {
            case 'delete':
                this._startDeletingSelectedElement();
                break;
            case 'space':
                this._previewSelectedElement();
                break;
            default:
                // Ignore
                break;
        }
    },

    /**
     * @override
     */
    getMenuElements: function() {
        return {
                'file': {
                    'type': 'SubMenu',
                    'label': 'File',
                    'weight': 1,
                    'children': {
                        'save': {
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'Save',
                                'weight': 1,
                                'handler': function() {
                                    this._save();
                                }.bind(this),
                                'shortcut': 'Alt+S'
                            }),
                            'weight': 1,
                            'group': 1
                        }
                    }
                }
            };
    },
    
    // **************** PRIVATE METHODS **************** //
    
    /**
     * Select a screen in the screenflow document
     * @param element ComponentInstance
     *      Element to be selected for the
     *      Screenflow document.
     * @private
     */
    _setSelectedElement: function (element) {
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
     * This function init the process of deleting the element
     */
    _startDeletingSelectedElement: function () {
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
    },
    
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
     * @param instance ComponentInstance
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
     * @private
     */
    _renderPaletteArea: function() {
        this._mainBorderContainer.addChild(this._paletteController.getNode());
    },
    /**
     * deletes the selected element
     * @private
     */
    _deleteSelectedElement: function() {
        if (this._selectedElement) {
            this._deleteInstance(this._selectedElement);
            this._setSelectedElement();
        }
    },
    
    /**
     * Previews the selected element
     * depending on the type of the
     * selected element
     * @private
     */
    _previewSelectedElement: function() {
        if (this._selectedElement) {
            this._selectedElement.showPreviewDialog();
        }
    },

    /**
     * Saves the current document
     * @private
     * @abstract
     */
    _save: function() {
        throw "Abstract method invocation: PaletteDocument::_save";
    }
});

// vim:ts=4:sw=4:et:
