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
            /** String */ typeName,
            /** Object */ properties,
            /** InferenceEngine */ inferenceEngine) {
        $super(properties.name);
        
        /**
         * List of tags
         * @type Array
         */
        this._tags = properties.tags;

        /**
         * Buildingblock type
         * @type String
         * @private
         */
        this._typeName = typeName;

        /**
         * InferenceEngine
         * @type InferenceEngine
         * @private @member
         * @abstract
         */
        this._inferenceEngine = inferenceEngine;

        /**
         * Areas of the canvas
         * @type Hash
         * @private
         */
        this._areas = this._getAreas();

        /**
         * Building block sets of the palettes
         * @type Array
         * @private
         */
        this._buildingBlockSets = this._getSets();

        /**
         * Palette Controller
         * @type PaletteController
         * @private @member
         */
        this._paletteController = null;


        /**
         * Screen canvas position cache
         * @private
         * @type ScreenCanvasCache
         */
        this._canvasCache = null;


        /**
         * @type dijit.layout.BorderContainer
         * @private @member
         */
        this._inspectorArea = new dijit.layout.BorderContainer({
            "region":"bottom",
            "design":"horizontal",
            "style":"height: 180px; z-index:21 !important;",
            "minSize":"100",
            "maxSize":"220",
            "persist":false,
            "splitter":true
        });

        /**
         * @type PropertiesPane
         * @private @member
         */
        this._propertiesPane = new PropertiesPane(this._inspectorArea);

        /**
         * Table representing the different facts of the screenflow
         * @type FactPane
         * @private @member
         */
        this._factPane = new FactPane(this._inspectorArea);
        
        /**
         * Main border container
         * @type dijit.layout.BorderContainer
         * @private @member
         */
        this._mainBorderContainer = null;

         /**
         * Main border container
         * @type dijit.layout.BorderContainer
         * @private @member
         */
        this._designContainer = new dijit.layout.BorderContainer({
            region: 'center',
            design: 'sidebar',
            splitter: true,
            gutters: false
        });

        /**
         * Has unsaved changes control variable
         * @type Boolean
         * @private
         */
        this._isDirty = false;

        /**
         * An operation pending to be executed when
         * the saving process is finished
         * @type Function
         * @private
         */
        this._pendingOperation = null;
        
        this._renderMainUI();

        // Adding the dropping areas to the document
        this._areas.values().each(function(area) {
            var contentPane = area.getWidget();
            this._designContainer.addChild(contentPane);

            var contentNode = area.getNode();

            contentNode.observe('click', function() {
                this._onClick();
            }.bind(this));
            contentNode.observe('dblclick', function() {
                this._onClick();
            }.bind(this));
        }.bind(this));
        
    
         /**
         * This property represents the selected element
         * @type BuildingBlockInstance
         * @private @member
         */
        this._selectedElement = null;

        /**
         * The document description
         * @type BuildingBlockDescription
         * @private @member
         */
        this._description = this._getDescription(properties);

        /**
         * Properties dialog
         * @type PropertiesDialog
         * @private
         */
        this._propertiesDialog = new PropertiesDialog(this._typeName, this._description,
                                                        this._onPropertiesChange.bind(this));

        if (this._description.getId()) {
            // We are loading the document
            this._canvasCache = this._getCanvasCache(properties);
        }
    },
    
    /**
     * Returns the selected element for the screenflow document
     * @type ComponentInstance
     */
    getSelectedElement: function () {
        return this._selectedElement;
    },
    

    /**
     * Returns the BuildingBlock Description for the screenflow document
     * @type ScreenDescription
     */
    getBuildingBlockDescription: function () {
        return this._description;
    },

    
    /**
     * Implementing event listener
     */
    elementClicked: function(/** ComponentInstance */ element) {
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
        this._setDirty(true);
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
                                'handler': function() {
                                    this._save();
                                }.bind(this),

                                'shortcut': 'Alt+S'
                            }),
                            'weight': 1,
                            'group': 1
                        },
                        'saveas': {
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'Save as...',
                                'handler': function() {
                                    this._saveAs();
                                }.bind(this)
                            }),
                            'weight': 2,
                            'group': 1
                        }
                    }
                }
            };
    },
    
    // **************** PRIVATE METHODS **************** //

    /**
     * Inits the catalogue population
     * @private
     */
    _start: function() {
        this._paletteController = new PaletteController(this._buildingBlockSets,
                                        this._areas.values(), this._inferenceEngine);

        this._renderPaletteArea();
        this._configureToolbar();
        Utils.showMessage("Loading building blocks");
        var paletteStatus = this._getEmptyPalette();


        // Start retrieving data
        this._inferenceEngine.findCheck(
                [],
                paletteStatus,
                this._tags,
                'reachability',
                this._findCheckCallback.bind(this)
        );
        var domainConceptSet = this._buildingBlockSets.detect(function(set) {
            return set.constructor == DomainConceptSet;
        })
        if (domainConceptSet) {
            domainConceptSet.startRetrievingData();
        }
        if (this._description.getId() == null) {
            this._setDirty(true);
        }
    },

    
    /**
     * Select an element in the document
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

        this._updateToolbar(this._selectedElement);
        
        if (element) {
            this._refreshReachability();
        } else {
            this._updatePanes();
        }
    },
    
    
    /**
     * This function init the process of deleting the element
     * @private
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
     * Sets the screen saving status
     * @private
     */
    _setDirty: function(/** Boolean */ dirty) {
        this._isDirty = dirty;
        this._toolbarElements.get('save').setEnabled(dirty);
        if (dirty) {
            this._setTitle(this._description.name + '*');
        } else {
            this._setTitle(this._description.name);
        }
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
     * Call whenever a properties dialog has been changed
     * @private
     */
    _onPropertiesChange: function() {
        this._setTitle(this._description.name);
        this._setDirty(true);
    },


    /**
     * Gets the elements of the canvas
     * @type Array
     * @private
     */
    _getCanvasUris: function () {
        var canvas = new Array();

        this._description.getCanvasInstances().each(function(instance) {
            canvas.push({
                'uri': instance.getUri()
            });
        });
        return canvas;
    },


     /**
     * This function returns the data array containing all the
     * facts belonging to the screenflow
     * @type Array
     */
    _getAllFacts: function() {
        var resultHash = new Hash();
        var instanceList = this._description.getCanvasInstances().
                                concat(this._description.getConditionInstances());
        instanceList.each(function(instance){
            if (instance.constructor != PrePostInstance) {
                var preReachability = this._inferenceEngine.getPreconditionReachability(
                            instance.getUri());
                var preconditions = instance.getPreconditionTable(preReachability);
                preconditions.each(function(pre) {
                    if (!resultHash.get(pre[2]/*The uri of the pre*/)) {
                        resultHash.set(pre[2], pre);
                    }
                });

                var postReachability = this._inferenceEngine.isReachable(
                            instance.getUri());
                var postconditions = instance.getPostconditionTable(postReachability);
                postconditions.each(function(post) {
                    if (!resultHash.get(post[2]/*The uri of the post*/)) {
                        resultHash.set(post[2], post);
                    }
                });
            } else {
                //PrePostInstance
                var factInfo = instance.getConditionTable();
                if (!resultHash.get(factInfo[2]/*The uri of the pre/post*/)) {
                    resultHash.set(factInfo[2], factInfo);
                }
            }
        }.bind(this));
        return resultHash.values();
    },


    /**
     * Close document event handler.
     * @overrides
     * @private
     */
    _closeDocument: function() {

        if (this._isDirty) {
            var text = new Element('div', {
                'style': 'text-align:center'
            }).update("The document has unsaved changes. Do you want to save?");
            var dialog = new ConfirmDialog("Warning",
                                           ConfirmDialog.SAVE_DISCARD_CANCEL,
                                           {'callback': this._effectiveCloseDocument.bind(this),
                                            'contents': text});
            dialog.show();
        } else {
            this._effectiveCloseDocument(ConfirmDialog.DISCARD);
        }
        return false;
    },
    

    /**
     * Effectively close the document
     * @private
     */
    _effectiveCloseDocument: function(/** String */ status) {

        switch (status) {
            case ConfirmDialog.SAVE:
                this._pendingOperation = this._effectiveCloseDocument.bind(this);
                this._save(false);
                break;

            case ConfirmDialog.CANCEL:
                break;
                
            case ConfirmDialog.DISCARD:
            default:
                var removeFromServer = false;
                if (!this._description.getId()) {
                    removeFromServer = true;
                }
                this._description.getCanvasInstances().each(function(instance) {
                    instance.destroy(removeFromServer, true);
                }.bind(this));

                this._description.getConditionInstances().each(function(instance) {
                    instance.destroy(removeFromServer, true);
                }.bind(this));

                GVS.getDocumentController().closeDocument(this._tabId);
            
        }
    },


    /**
     * onClick handler
     * @private
     */
    _onClick: function() {
        this._setSelectedElement();
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
        var node = instance.getView().getNode();
        node.parentNode.removeChild(node);
        this._setSelectedElement();
        instance.destroy(true);
        this._setDirty(true);
        this._refreshReachability();
    },

    _addToArea:function(/** Area */ area, /** ComponentInstance */ instance,
                        /** Object */ position){
        var node = instance.getView().getNode();
        area.getNode().appendChild(node);
        node.setStyle({
            'left': position.left + "px",
            'top': position.top + "px",
            'position': 'absolute'
        });
    },

    /**
     * Starts the process of saving the screenflow
     * @private
     * @override
     */
    _save: function(/** Boolean (Optional) */ _showMessage) {
        var showMessage = Utils.variableOrDefault(_showMessage, true);
        if (showMessage) {
            Utils.showMessage("Saving " + this._typeName);
        }
        if (this._description.getId() == null) {
            // Save it for the first time
            PersistenceEngine.sendPost(this._getSaveUri(), {'buildingblock':  Object.toJSON(this._description.toJSON())}, null,
                                       this, this._onSaveSuccess, this._onSaveError);
        } else {
            var uri = URIs.buildingblock + this._description.getId();
            PersistenceEngine.sendUpdate(uri, {'buildingblock': Object.toJSON(this._description.toJSON())}, null,
                                      this, this._onSaveSuccess, this._onSaveError);
        }
    },

    /**
     * Create a copy of the document with a new name/version
     * @private
     */
    _saveAs: function(/** Boolean */ cloned) {
        if (this._description.getId()) {
            var saveAsDialog = new SaveAsDialog(this._description.name,
                                                this._description.version,
                                                this._onSaveAsSuccess.bind(this),
                                                cloned);
            saveAsDialog.show();
        } else {
            this._save();
        }
    },

    _onSaveAsSuccess: function(/** String */ name, /** String */ version) {
        this._description.name = name;
        this._description.label['en-gb'] = name;
        this._description.version = version;
        this._description.id = null;
        this._description.creationDate = null;
        this._setTitle(this._description.name);
        this._save();
    },


    /**
     * On success handler when saving
     * @private
     */
    _onSaveSuccess: function(/** XMLHttpRequest */ transport) {
        this._setDirty(false);
        Utils.showMessage("Saved", {
            'hide': true
        });
        this._updatePanes();
        if (this._description.getId() == null) {
            var data = JSON.parse(transport.responseText);
            this._description.addProperties({'id': data.id,
                                            'version': data.version,
                                            'creationDate': data.creationDate});
        }
        if (this._pendingOperation) {
            var operation = this._pendingOperation;
            this._pendingOperation = null;
            operation();
        }
    },

    /**
     * On save error: the screen already exists
     * @private
     */
    _onSaveError: function(/** XMLHttpRequest */ transport) {
        // TODO: think about what to do when a screen cannot be saved
        // (problems with wrong versions)
        if (!this._pendingOperation) {
            Utils.showMessage("Cannot save " + this._typeName, {
                'hide': true,
                'error': true
            });
        } else {
            var operation = this._pendingOperation;
            this._pendingOperation = null;
            this._setDirty(false);
            operation();
        }
    },

    /**
     * Creates the instances coming from a list of uris
     * @private
     */
    _createInstances: function(/** BuildingBlockFactory */ factory, /** Array */ buildingBlocks,
                                /** Area */ area) {
        buildingBlocks.each(function(buildingBlock) {
            // More than one buildingblock for a given uri
            var ids = this._canvasCache.getIds(buildingBlock.uri);
            ids.each(function(id) {
                var instance = factory.getInstance(buildingBlock, this._inferenceEngine);
                instance.setId(id);
                instance.setParams(this._canvasCache.getParams(id));
                var position = this._canvasCache.getPosition(id);
                instance.onFinish(true, position);
                var dropNode = area.getNode();
                $("main").appendChild(instance.getView().getNode());
                var effectivePosition = Geometry.adaptInitialPosition(dropNode,
                                        instance.getView().getNode(), position);
                $("main").removeChild(instance.getView().getNode());
                this._drop(area, instance, effectivePosition, true);
            }.bind(this));
        }.bind(this));
    },

    /**
     * Returns the areas of the document
     * @private
     * @abstract
     * @type Hash
     */
    _getAreas:function() {
        throw "Abstract method invocation: PaletteDocument::_getAreas";
    },

    /**
     * Returns the sets of the document
     * @private
     * @abstract
     * @type Array
     */
    _getSets:function() {
        throw "Abstract method invocation: PaletteDocument::_getSets";
    },

    /**
     * Gets the document description
     * @abstract
     * @private
     * @type BuildingBlockDescription
     */
    _getDescription: function(/** Object */ properties) {
        throw "Abstract method invocation: PaletteDocument::_getDescription";
    },

    /**
     * Get the canvas cache for loading
     * @abstract
     * @private
     * @type String
     */
    _getCanvasCache: function(/** Object */ properties) {
        throw "Abstract method invocation: PaletteDocument::_getCanvasCache";
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
     * Updates the toolbar with the selected element
     * @private
     */
    _updateToolbar: function(/** ComponentInstance */ element) {
        // Do nothing
    },

    /**
     * Updates the panes with the selected element
     * @private
     */
    _updatePanes: function() {
        // Do nothing
    },

    /**
     * Returns the save uri
     * @type String
     * @private
     * @abstract
     */
    _getSaveUri: function() {
        throw "Abstract method invocation. PaletteDocument::_getSaveUri";
    },

    /**
     * Returns the empty palette status
     * @type Object
     * @private
     * @abstract
     */
    _getEmptyPalette: function() {
        throw "Abstract method invocation. PaletteDocument::_getEmptyPalette";
    }
});

// vim:ts=4:sw=4:et:
