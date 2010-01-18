var ScreenDocument = Class.create(PaletteDocument,
    /** @lends ScreenDocument.prototype */ {

    /**
     * Screen document.
     * @constructs
     * @extends PaletteDocument
     */
    initialize: function($super, /** String */ title, /** Array */ domainContext, /** String */ version) {
        this._inspectorArea = this._createInspectorArea(); 
               
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
        
        var catalogue = CatalogueSingleton.getInstance();

        // Palette sets
        var formSet = new BuildingBlockSet(domainContext, catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.FORM));
        var operatorSet = new BuildingBlockSet(domainContext, catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.OPERATOR));
        var resourceSet = new BuildingBlockSet(domainContext, catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.RESOURCE));
        var domainConceptSet = new DomainConceptSet(domainContext, catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT));
        
        // Dropping areas
        var formArea = new Area('form', $A([Constants.BuildingBlock.FORM]), this._drop.bind(this));
        var operatorArea = new Area('operator', $A([Constants.BuildingBlock.OPERATOR]), this._drop.bind(this));
        var resourceArea = new Area('resource', $A([Constants.BuildingBlock.RESOURCE]), this._drop.bind(this));
        var preArea = new Area('pre', $A([Constants.BuildingBlock.DOMAIN_CONCEPT]), this._drop.bind(this));
        var postArea = new Area('post', $A([Constants.BuildingBlock.DOMAIN_CONCEPT]), this._drop.bind(this));
        
        var areas = $A([formArea, operatorArea, resourceArea, preArea, postArea]);
        
        $super(title, $A([formSet, operatorSet, resourceSet, domainConceptSet]),
                areas,
                domainContext,  new ScreenInferenceEngine());
        
        // Adding the dropping areas to the document
        areas.each(function(area) {
            this._tabContent.appendChild(area.getNode());     
        }.bind(this));

        /**
         * Form instance of the screen, if any
         * @type FormInstance
         * @private
         */
        this._formInstance = null;

        /**
         * Pipe Factory
         * @type PipeFactory
         * @private
         */
        this._pipeFactory = new PipeFactory();

        /**
         * Trigger mapping factory
         * @type TriggerMappingFactory
         * @private
         */
        this._triggerMappingFactory = new TriggerMappingFactory();
              
        // Screen Definition

         /**
         * The screenflow description
         * @type ScreenDescription
         * @private @member
         */       
        this._description = new ScreenDescription({
            'label': {'en-gb': title},
            'name': title,
            'version': version,
            'domainContext': {
                'tags': domainContext,
                'user': null
            },
            "creator": "http://fast.morfeo-project.eu",
            "description": {"en-gb": "Please fill the description..."},
            "rights": "http://creativecommons.org/",
            "creationDate": new Date().toUTCString(),
            "icon": "http://fast.morfeo-project.eu/icon.png",
            "screenshot": "http://fast.morfeo-project.eu/screenshot.png",
            "homepage": "http://fast.morfeo-project.eu/"
        });

        /**
         * Screen properties dialog
         * @type PropertiesDialog
         * @private
         */
        this._propertiesDialog = new PropertiesDialog("Screen", this._description);

        this._configureToolbar();

        /**
         * Has unsaved changes control variable
         * @type Boolean
         * @private
         */
        this._hasUnsavedChanges = false;

        /**
         * A sharing operation was started but not finished
         * @type Boolean
         * @private
         */
        this._sharingPending = false;
          
        /**
         * Resource instances on the canvas by uri
         * @private
         * @type Hash
         */
        this._canvasInstances = new Hash();
        
        var paletteStatus = {
            "forms": [],
            "operators": [],
            "backendservices": [],
            "preconditions": [],
            "postconditions":[],
            "pipes":[]
        };


        // Start retrieving data
        this._inferenceEngine.findCheck(
                this._getCanvas(),
                paletteStatus,
                this._domainContext,
                'reachability',
                this._findCheckCallback.bind(this)
        );
        domainConceptSet.startRetrievingData();
        this._setSelectedElement();

        this._save();
    },


    // **************** PUBLIC METHODS **************** //
    
    /**
     * Returns the BuildingBlock Description for the screenflow document
     * @type ScreenDescription
     */
    getBuildingBlockDescription: function () {
        return this._description;
    },
    

    /**
     * @override
     */
    show: function() {
        this._pipeFactory.showPipes();
    },

    /**
     * @override
     */
    hide: function() {
        this._pipeFactory.hidePipes();
    },

    // **************** PRIVATE METHODS **************** //
    

    /**
     * An element has been dropped into an area inside the canvas
     * @private
     * @type Boolean
     */
    _drop: function(/** Area */ area, /** ComponentInstance */ instance, /** Object */ position) {
        // Reject repeated elements (except domain concepts or operators)
        if (instance.constructor != OperatorInstance  &&
                this._canvasInstances.get(instance.getUri())) {
            return false;
        }
        if (instance.constructor == FormInstance) {
            if (this._formInstance) {
                return false;
            } else {
                this._formInstance = instance;
                this._description.icon = instance.getBuildingBlockDescription().icon;
                this._description.screenshot = instance.getBuildingBlockDescription().screenshot;
            }
        }

        var node = instance.getView().getNode();
        area.getNode().appendChild(node);
        node.setStyle({
            'left': position.left + "px",
            'top': position.top + "px"
        });
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        instance.setId(uidGenerator.generate(instance.getTitle()));
        
        if (instance.constructor != PrePostInstance) {
            instance.createTerminals(this._onPipeHandler.bind(this));
            this._canvasInstances.set(instance.getUri(), instance);
            this._description.addBuildingBlock(instance);
            this._setSelectedElement(instance);
        } else {
            instance.setChangeHandler(this._onPrePostAdded.bind(this));
            if (area.getNode().className.include("pre")) {
                instance.setType("pre");
                instance.createTerminal(this._onPipeHandler.bind(this));
                this._description.addPre(instance);
                instance.getView().setReachability({"satisfied": true});
            } else if (area.getNode().className.include("post")) {
                instance.setType("post");
                instance.createTerminal();
                this._description.addPost(instance);
            }
        }
        instance.setEventListener(this);
        instance.enableDragNDrop(area,[area]);
        instance.getView().addGhost();
        this._hasUnsavedChanges = true;
        return true;
    },
    
    /**
     * Launched whenever a pipe is added or removed from
     * @private
     */
    _onPipeHandler: function(/** Event */ event, /** Array */ params, /** Boolean */ addedPipe) {
        var wire = params[0];
        if (wire.terminal1.parentEl && wire.terminal2.parentEl) {
            var pipe = this._pipeFactory.getPipe(wire);
            if (pipe) {
                if (addedPipe) {
                    this._description.addPipe(pipe);
                } else {
                    this._pipeFactory.removePipe(pipe);
                    this._description.remove(pipe);
                }
                this._refreshReachability();
            }
            this._hasUnsavedChanges = true;
        }
    },

    /**
     * Runs when a *-condition is created in the server
     * @private
     */
    _onPrePostAdded: function(/** String */ previousUri, /** PrePostInstance */ instance) {
        if (previousUri) {
            // TODO: Think if this is possible
        }
        this._setSelectedElement(instance);
    },
    
    /**
     * Delete an instance.
     * @param instance ComponentInstance
     *      Instance to be deleted from the
     *      Screen document.
     * @override
     */
    _deleteInstance: function(/** ComponentInstance */ instance) {
            
        var node = instance.getView().getNode();
        node.parentNode.removeChild(node);
        
        this._canvasInstances.unset(instance.getUri());
        
        if (instance.constructor == FormInstance) {
                this._formInstance = null;
        }
        this._description.remove(instance);

        this._pipeFactory.getPipes(instance).each(function(pipe){
            this._pipeFactory.removePipe(pipe);
            this._description.remove(pipe);
        }.bind(this));

        this._triggerMappingFactory.getRelatedTriggers(instance).each(function(trigger) {
            this._triggerMappingFactory.removeTrigger(trigger);
            this._description.remove(trigger);
        }.bind(this));
        
        this._refreshReachability();
        this._setSelectedElement();
        instance.destroy();
        this._hasUnsavedChanges = true;
    },


    /**
     * Select a screen in the screenflow document
     * @param element ComponentInstance
     *      Element to be selected for the
     *      Screen document.
     * @private
     * @override
     */
    _setSelectedElement: function ($super, element) {
        $super(element);
        this._toolbarElements.get('deleteElement').setEnabled(element!=null);
        if (element) {
            this._refreshReachability();
        } else {
            this._updatePanes();
        }
    },
    
    /**
     * Gets the elements of the canvas
     * @type String[]
     * @private
     */
    _getCanvas: function () {
        var canvas = [];
        
        this._canvasInstances.keys().each(function(uri) {
            canvas.push({
                'uri': uri
            });
        });
        return canvas;
    },   
    
    /**
     * Callback to be called when the findCheck operation
     * finishes
     * @private
     */
    _findCheckCallback: function(/** Object */ componentUris) {
        $H(componentUris).each(function(pair) {
            var palette = this._paletteController.getPalette(Constants.CatalogueRelationships[pair.key]);
            if (palette) {
                var set = palette.getBuildingBlockSet();
                set.addURIs(pair.value);
            } 
        }.bind(this));
    },
    
    _configureToolbar: function() {
       
        this._addToolbarElement('save', new ToolbarButton(
            'Save the current screen',
            'save',
            this._save.bind(this),
            true
        ));
        this._addToolbarElement('properties', new ToolbarButton(
            'Edit screen properties',
            'properties',
            this._propertiesDialog.show.bind(this._propertiesDialog),
            true
        ));
        this._addToolbarElement('deleteElement', new ToolbarButton(
            'Delete selected element',
            'delete',
            this._startDeletingSelectedElement.bind(this),
            false // disabled by default
        ));
        this._addToolbarElement('share', new ToolbarButton(
            'Share the current screen with the community',
            'share',
            this._share.bind(this),
            true
        ));
    },

    /**
     * This function creates the area containing the canvas
     * and the inspectors
     * @override
     */
    _renderCenterContainer: function() {
        
        var centerContainer = new dijit.layout.BorderContainer({
            design:"headline",
            liveSplitters:"false",
            region:"center"
        });
        
        this._tabContent.addClassName("screenDoc").
                        addClassName("canvas");
                        
        this._tabContent.observe('click', function(){
            this._onClick();
        }.bind(this));
        this._tabContent.observe('dblclick', function(event){
            this._onClick();
        }.bind(this));

        var documentPane = new dijit.layout.ContentPane({
            region:"center"
        });
        documentPane.setContent(this._tabContent);
        
        centerContainer.addChild(documentPane);
        centerContainer.addChild(this._inspectorArea);

        var leftSplitter = centerContainer.getSplitter("left");
        dojo.connect(leftSplitter,'onmousemove', this._repaint.bind(this));

        var bottomSplitter = centerContainer.getSplitter("bottom");
        dojo.connect(bottomSplitter,'onmousemove', this._repaint.bind(this));

        return centerContainer;
    },

    
    /**
     * This function repaints the terminals in the document
     * @private
     */
    _repaint: function() {
        this._canvasInstances.each(function(pair){
            pair.value.onUpdate();
        });
    },
    
    /**
     * This function creates
     * the inspector area
     * @private
     */
    _createInspectorArea: function(){
     
        var inspectorArea = new dijit.layout.BorderContainer({
            "region":"bottom",
            "design":"horizontal",
            "style":"height: 180px; z-index:21 !important;",
            "minSize":"100",
            "maxSize":"220",
            "persist":false,
            "splitter":true
            });

        return inspectorArea;
    },
    
    
    /**
     * Close document event handler.
     * @overrides
     * @private
     */
    _closeDocument: function($super) {
        if (this._hasUnsavedChanges) {
             confirm("Are you sure you want to close the current Screen?" +
                " Unsaved changes will be lost", this._confirmCallback.bind(this));
            return false;
        } else {
            return true;
        }
    },
    
    
    /**
     * This function is called when the user has confirmed the closing
     * @private
     * @param close Boolean
     *     The parameter represents if the user has accepted the closing (true)
     *     or not (false)
     */
    _confirmCallback: function (close){
        if (close){
            var gvs = GVSSingleton.getInstance();
            gvs.getDocumentController().closeDocument(this._tabId);
            // Be careful when removing instances
            // from server if the document is saved
            this._canvasInstances.each(function(pair) {
                pair.value.destroy(true);    
            }.bind(this));
        }
    },
    
    
    /**
     * This function updates the reachability in all
     * Elements: canvas and palettes
     * @private
     */
    _refreshReachability: function () {
        var canvas = this._getCanvas();
        var body = {
            'forms': this._paletteController.getComponentUris(Constants.BuildingBlock.FORM),
            'operators': this._paletteController.getComponentUris(Constants.BuildingBlock.OPERATOR),
            'backendservices': this._paletteController.getComponentUris(Constants.BuildingBlock.RESOURCE),
            'pipes': this._description.getPipes(),
            'preconditions': this._description.getPreconditions(),
            'postconditions': this._description.getPostconditions()
        }
        if (this._selectedElement && this._selectedElement.getUri()) {
            body.selectedItem = this._selectedElement.getUri();
        }
        
        if (URIs.catalogueFlow =='check') {
            this._inferenceEngine.check(canvas, body, this._domainContext, 'reachability',
                                        this._onUpdateReachability.bind(this));
        } else {
            this._inferenceEngine.findCheck(canvas, body,  this._domainContext,
                                    'reachability', this._onUpdateReachability.bind(this));
        }
    },

    /**
     * @private
     */
    _onUpdateReachability: function(reachabilityData) {
        if (reachabilityData.postconditions) {
            reachabilityData.postconditions.each(function(post) {
                this._description.getPost(post.id).getView().setReachability(post);
            }.bind(this));
        }
        if (reachabilityData.pipes) {
            reachabilityData.pipes.each(function(pipeData) {
                var pipe = this._pipeFactory.getPipeFromJSON(pipeData);
                pipe.setReachability(pipe.satisfied);
            }.bind(this));
        }
        if (reachabilityData.connections) {
            // TODO
        }
        this._updatePanes();
    },
    
    
    /**
     * This function updates the properties table and 
     * the pre/post pane depending on the selected element
     * @private
     */
    _updatePanes: function() {

        if (!this._selectedElement) {
            this._propertiesPane.fillTable(this._description);
            var facts = this._getAllFacts();     
            this._factPane.fillTable([], [], facts);
        } else {
            this._propertiesPane.fillTable(this._selectedElement);
           
            if (this._selectedElement.constructor != PrePostInstance) {

                var instanceActions = this._getInstanceActions();
                this._propertiesPane.addSection(['Action', 'Triggers'], instanceActions);

                var preReachability = this._inferenceEngine.getPreconditionReachability(
                            this._selectedElement.getUri());
                var preconditions = this._selectedElement.getPreconditionTable(preReachability);
                
                var postReachability = this._inferenceEngine.isReachable(
                            this._selectedElement.getUri());
                var postconditions = this._selectedElement.getPostconditionTable(postReachability);
                
                this._factPane.fillTable(preconditions,postconditions,[]);           
            } else {
                //PrePostInstance
                if (this._selectedElement.getType()) {
                    //Pre or post condition
                    var factInfo = [this._selectedElement.getConditionTable()];
                    this._factPane.fillTable([], [], factInfo);
                }
            }    
        }
    },
    
    /**
     * This function returns the data array containing all the
     * facts belonging to the screenflow
     * @type Array
     */
    _getAllFacts: function() {
        var resultHash = new Hash();
        var instanceList = this._canvasInstances.values().
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
     * This function returns a hash containing all the actions of the
     * selected element and its triggers, if any
     * @private
     * @type Hash
     */
    _getInstanceActions: function() {
        var triggers = this._triggerMappingFactory.getTriggerList(this._selectedElement);
        var result = new Hash();
        var actions = this._selectedElement.getBuildingBlockDescription().actions;
        actions.each(function(action) {
            result.set(action.name, this._buildTriggerList(action.name, triggers.get(action.name)));
        }.bind(this));
        return result;
    },

    /**
     * This function builds a HTML chunk with the list of triggers of an action and
     * the button to change the trigger mappings
     * @private
     * @type DOMNode
     */
    _buildTriggerList: function(/** String */ actionName, /** Array */ triggerList) {     
        
        var result = new Element('div');
        var content = "";
        if (triggerList) {
            triggerList.each(function(trigger) {
                content += trigger.getTriggerName() + ", ";
            });
            content = content.slice(0, -2);
        } else {
            content = new Element('span', {
                'class': 'triggerInfo'
            }).update("No triggers for this action");
        }
        result.update(content);
        var triggerDialog = new TriggerDialog(actionName, triggerList,
                                            this._canvasInstances.values(), this._onTriggerChange.bind(this));
        result.appendChild(triggerDialog.getButtonNode());
        return result;
     },

     /**
      * Called whenever a trigger dialog finishes its job
      * @private
      */
     _onTriggerChange: function(/** String*/ action, /** Array */ triggersAdded, /** Array */ triggersRemoved) {
        triggersAdded.each(function(triggerInfo) {
            var triggerSplittedInfo = triggerInfo.split("#");
            var instance;
            if (triggerSplittedInfo[0] == ScreenTrigger.INSTANCE_NAME) {
                instance = triggerSplittedInfo[0];
            } else {
                instance = this._findInstance(triggerSplittedInfo[0]);
            }
            var triggerData = {
                'from': {
                    'instance': instance,
                    'name': triggerSplittedInfo[1]
                },
                'to': {
                    'instance': this._selectedElement,
                    'action': action
                }
            }
            var trigger = this._triggerMappingFactory.createTrigger(triggerData);
            this._description.addTrigger(trigger);
        }.bind(this));

        triggersRemoved.each(function(triggerInfo) {
            var triggerSplittedInfo = triggerInfo.split("#");
            var instance;
            if (triggerSplittedInfo[0] == ScreenTrigger.INSTANCE_NAME) {
                instance = triggerSplittedInfo[0];
            } else {
                instance = this._findInstance(triggerSplittedInfo[0]);
            }
            var triggerData = {
                'from': {
                    'instance': instance,
                    'name': triggerSplittedInfo[1]
                },
                'to': {
                    'instance': this._selectedElement,
                    'action': action
                }
            }
            var trigger = this._triggerMappingFactory.removeTrigger(triggerData);
            this._description.remove(trigger);
        }.bind(this));
        this._updatePanes();
        this._hasUnsavedChanges = true;
     },

     /**
      * Finds an instance inside the canvas, by its id
      * @private
      * @type ComponentInstance
      */
     _findInstance: function(/** String */ instanceId) {
        return this._canvasInstances.values().detect(function(element) {
                    return element.getId() == instanceId
         });
     },

    /**
     * onClick handler
     * @private
     */
    _onClick: function() {
        this._setSelectedElement();
    },
    
    
    /**
     * Creates a gadget deployment for the screenflow
     * @private
     */
    _deployGadget: function () {
        this._deployer.deployGadget(this._description);
    },    
    
    /**
     * Previews the selected element   
     * @private
     */
    _previewSelectedElement: function() {
        this._selectedElement.showPreviewDialog();
    },
    
    /**
     * Starts the process of saving the screenflow
     * @private
     * @override
     */
    _save: function() {
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        if (this._description.getId() == null) {
            // Save it for the first time
            persistenceEngine.sendPost(URIs.screen, null, "buildingblock=" + Object.toJSON(this._description.toJSON()),
                                       this, this._onSaveSuccess, this._onSaveError);
        } else {
            var uri = URIs.buildingblock + this._description.getId();
            persistenceEngine.sendUpdate(uri, null, "buildingblock=" + Object.toJSON(this._description.toJSON()),
                                      this, this._onSaveSuccess, this._onSaveError);
        }
        // TODO: Show a saving message
    },

    /**
     * On success handler when saving
     * @private
     */
    _onSaveSuccess: function(/** XMLHttpRequest */ transport) {
        this._hasUnsavedChanges = false;
        if (this._description.getId() == null) {
            var data = JSON.parse(transport.responseText);
            this._description.addProperties({'id': data.id});
        }
        if (this._sharingPending) {
            this._sharingPending = false;
            this._share();
        }
    },

    /**
     * On save error: the screen already exists
     */
    _onSaveError: function(/** XMLHttpRequest */ transport) {
        // TODO: think about what to do when a screen cannot be saved
        // (problems with wrong versions)
    },

    /**
     * Publish a screen into the catalogue
     * @private
     */
    _share: function() {
        if (this._description.isValid()) {
            if (this._hasUnsavedChanges) {
                this._sharingPending = true;
                this._save();
            } else {
                var persistenceEngine = PersistenceEngineFactory.getInstance();
                var uri = URIs.share.replace("<id>", this._description.getId());
                persistenceEngine.sendPost(uri, null, null,
                                        this, this._onShareSuccess, Utils.onAJAXError);
            }
           
        } else {
            this._propertiesDialog.show(this._share.bind(this));
        }
    },

    /**
     * On share success
     * @private
     */
    _onShareSuccess: function(/** XMLHttpRequest */ transport) {
        // TODO
    }
});

// vim:ts=4:sw=4:et:
