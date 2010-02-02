var ScreenDocument = Class.create(PaletteDocument,
    /** @lends ScreenDocument.prototype */ {

    /**
     * Screen document.
     * @constructs
     * @extends PaletteDocument
     */
    initialize: function($super, /** Object */ properties) {
        var tags = properties.tags;
        var name = properties.name;
        var version = properties.version;

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
        

        // Palette sets
        var formSet = new BuildingBlockSet(tags, Catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.FORM));
        var operatorSet = new BuildingBlockSet(tags, Catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.OPERATOR));
        var resourceSet = new BuildingBlockSet(tags, Catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.RESOURCE));
        var domainConceptSet = new DomainConceptSet(tags, Catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT));
        
        // Dropping areas
        var formArea = new Area('form',
                                $A([Constants.BuildingBlock.FORM]),
                                this._drop.bind(this),
                                {splitter: true, region: 'top', minHeight:300});
        var operatorArea = new Area('operator',
                                    $A([Constants.BuildingBlock.OPERATOR]),
                                    this._drop.bind(this),
                                    {splitter: true, region: 'center', minHeight:200, minWidth:200});
        var resourceArea = new Area('resource',
                                    $A([Constants.BuildingBlock.RESOURCE]),
                                    this._drop.bind(this),
                                    {splitter: true, region: 'bottom', minHeight:100});
        var preArea = new Area('pre',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'left', minWidth:100});
        var postArea = new Area('post',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'right', minWidth:100});

        /**
         * Areas of the canvas
         * @type Hash
         * @private
         */
        this._areas = $H({
            'form': formArea,
            'operator': operatorArea,
            'resource': resourceArea,
            'pre': preArea,
            'post': postArea
        });
        
        $super(name, $A([formSet, operatorSet, resourceSet, domainConceptSet]),
                this._areas.values(),
                tags,  new ScreenInferenceEngine());
        
        // Adding the dropping areas to the document
        this._areas.values().each(function(area) {
            var contentPane = area.getWidget();
            this._screenDesignContainer.addChild(contentPane);

            var contentNode = area.getNode();

            contentNode.observe('click', function() {
                this._onClick();
            }.bind(this));
            contentNode.observe('dblclick', function() {
                this._onClick();
            }.bind(this));
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

        var description;
        if (properties.id) {
            // An existing screen
            description = Object.clone(properties);
            // Removing the definition, which will be interpreted in other
            // functions
            description.definition = null;
            description.precondition = null;
            description.postconditions = null;
        } else {
            // A new screen
            description = {
                'label': {'en-gb': name},
                'name': name,
                'version': version,
                'tags':  this._tags,
                "creator": "http://fast.morfeo-project.eu",
                "description": {"en-gb": "Please fill the description..."},
                "rights": "http://creativecommons.org/",
                "creationDate": null,
                "icon": "http://fast.morfeo-project.eu/icon.png",
                "screenshot": "http://fast.morfeo-project.eu/screenshot.png",
                "homepage": "http://fast.morfeo-project.eu/"
            };
        }
         /**
         * The screenflow description
         * @type ScreenDescription
         * @private @member
         */       
        this._description = new ScreenDescription(description);

        /**
         * Screen properties dialog
         * @type PropertiesDialog
         * @private
         */
        this._propertiesDialog = new PropertiesDialog("Screen", this._description,
                                                        this._onPropertiesChange.bind(this));

        this._configureToolbar();

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
          
        /**
         * Resource instances on the canvas by uri
         * @private
         * @type Hash
         */
        this._canvasInstances = new Hash();

        /**
         * Screen canvas position cache
         * @private
         * @type ScreenCanvasCache
         */
        this._canvasCache = null;

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
                this._tags,
                'reachability',
                this._findCheckCallback.bind(this)
        );
        domainConceptSet.startRetrievingData();

        if (this._description.getId()) {
            this._canvasCache = new ScreenCanvasCache(properties);
        } else {
            this._setSelectedElement();
        }
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

    /**
     * Implementing event listener
     * @override
     */
    positionUpdated: function(/** ComponentInstance */ element, /** Object */ position) {
        switch (element.constructor) {
            case PrePostInstance:
                this._description.updatePrePost(element, position);
                break;
            default:
                this._description.updateBuildingBlock(element, position);
                break;
        }
        this._setDirty(true);
    },

    /**
     * Loads the definition of a screen, when the screen is opened
     */
    loadInstances: function() {

        var formFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.FORM);
        formFactory.cacheBuildingBlocks(this._canvasCache.getFormURI(),
                    this._onFormLoaded.bind(this));

        var operatorFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.OPERATOR);
        operatorFactory.cacheBuildingBlocks(this._canvasCache.getOperatorURIs(),
                    this._onOperatorsLoaded.bind(this));

        var resourceFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.RESOURCE);
        resourceFactory.cacheBuildingBlocks(this._canvasCache.getResourceURIs(),
                    this._onResourcesLoaded.bind(this));


    },

    // **************** PRIVATE METHODS **************** //
    
    /**
     * Sets the screen saving status
     */
    _setDirty: function(/** Boolean */ dirty) {
        this._isDirty = dirty;
        this._toolbarElements.get('save').setEnabled(dirty);
    },

    /**
     * An element has been dropped into an area inside the canvas
     * @private
     * @type Boolean
     */
    _drop: function(/** Area */ area, /** ComponentInstance */ instance, /** Object */ position, 
        /** Boolean (Optional) */ _isLoading) {
        var isLoading = Utils.variableOrDefault(_isLoading, false);
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
            'top': position.top + "px",
            'position': 'absolute'
        });
        
        if (!instance.getId()) {
            instance.setId(UIDGenerator.generate(instance.getTitle()));
        } else {
            UIDGenerator.setStartId(instance.getId());
        }
          
        if (instance.constructor != PrePostInstance) {
            instance.createTerminals(this._onPipeHandler.bind(this));
            this._canvasInstances.set(instance.getUri(), instance);
            this._description.addBuildingBlock(instance, position);
            if (!isLoading) {
                this._setSelectedElement(instance);
            }
        } else {
            //instance.setChangeHandler(this._onPrePostAdded.bind(this));
            if (area.getNode().className.include("pre")) {
                instance.setType("pre");
                instance.createTerminal(this._onPipeHandler.bind(this));
                this._description.addPre(instance, position);
                instance.getView().setReachability({"satisfied": true});
            } else if (area.getNode().className.include("post")) {
                instance.setType("post");
                instance.createTerminal();
                this._description.addPost(instance, position);
            }
        }
        instance.setEventListener(this);
        instance.enableDragNDrop(area,[area]);
        instance.getView().addGhost();
        this._setDirty(true);
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
            this._setDirty(true);
        }
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
        this._setDirty(true);
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
            false
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

        var leftSplitter = centerContainer.getSplitter("left");
        dojo.connect(leftSplitter,'onmousemove', this._repaint.bind(this));

        var bottomSplitter = centerContainer.getSplitter("bottom");
        dojo.connect(bottomSplitter,'onmousemove', this._repaint.bind(this));

        this._screenDesignContainer = new dijit.layout.BorderContainer({
            region: 'center',
            design: 'sidebar',
            splitter: true,
            gutters: false
        });
        this._screenDesignContainer.domNode.addClassName('screenDesign');

        leftSplitter = this._screenDesignContainer.getSplitter("left");
        dojo.connect(leftSplitter,'onmousemove', this._repaint.bind(this));

        bottomSplitter = this._screenDesignContainer.getSplitter("bottom");
        dojo.connect(bottomSplitter,'onmousemove', this._repaint.bind(this));

        var rightSplitter = this._screenDesignContainer.getSplitter("right");
        dojo.connect(rightSplitter,'onmousemove', this._repaint.bind(this));

        var topSplitter = this._screenDesignContainer.getSplitter("top");
        dojo.connect(topSplitter,'onmousemove', this._repaint.bind(this));

        centerContainer.addChild(this._screenDesignContainer);
        centerContainer.addChild(this._inspectorArea);

        return centerContainer;
    },

    
    /**
     * This function repaints the terminals in the document
     * @private
     */
    _repaint: function() {
        this._canvasInstances.values().each(function(instance){
            instance.onUpdate();
        });
        this._description.getConditionInstances().each(function(instance) {
            instance.onUpdate();
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
    _closeDocument: function() {
        if (this._isDirty) {
            this._pendingOperation = this._closeDocument.bind(this);
            this._save();
            return false;
        } else {
            this._canvasInstances.each(function(pair) {
                pair.value.destroy(true);
            }.bind(this));
            
            GVS.getDocumentController().closeDocument(this._tabId);
        }
    },
    
    
    /**
     * This function updates the reachability in all
     * Elements: canvas and palettes
     * @private
     */
    _refreshReachability: function (/** Boolean (Optional) */_isFindCheck) {
        var isFindCheck = Utils.variableOrDefault(_isFindCheck, false);
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
        
        if (isFindCheck) {
            this._inferenceEngine.findCheck(canvas, body,  this._tags,
                                    'reachability', this._onUpdateReachability.bind(this));
        } else {
            this._inferenceEngine.check(canvas, body, this._tags, 'reachability',
                                        this._onUpdateReachability.bind(this));
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
                pipe.setReachability(pipeData.satisfied);
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
     _onTriggerChange: function(/** String*/ action, /** Array */ triggersAdded,
                                /** Array */ triggersRemoved) {
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
        this._setDirty(true);
     },

     /**
      * Finds an instance inside the canvas, by its id
      * @private
      * @type ComponentInstance
      */
     _findInstance: function(/** String */ instanceId) {
        return this._canvasInstances.values().detect(function(element) {
                    return element.getId() == instanceId;
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
        Utils.showMessage("Saving screen");
        if (this._description.getId() == null) {
            // Save it for the first time
            PersistenceEngine.sendPost(URIs.screen, null, "buildingblock=" + Object.toJSON(this._description.toJSON()),
                                       this, this._onSaveSuccess, this._onSaveError);
        } else {            
            var uri = URIs.buildingblock + this._description.getId();
            PersistenceEngine.sendUpdate(uri, null, "buildingblock=" + Object.toJSON(this._description.toJSON()),
                                      this, this._onSaveSuccess, this._onSaveError);
        }
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
        if (this._description.getId() == null) {
            var data = JSON.parse(transport.responseText);
            this._description.addProperties({'id': data.id});
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
        Utils.showMessage("Cannot save screen. A screen with that name already " +
        "exists", {
            'hide': true,
            'error': true
        });
    },

    /**
     * Call whenever a properties dialog has been changed
     */
    _onPropertiesChange: function() {
        this._setDirty(true);
        // Just in case
        this._setTitle(this._description.name);
    },

    /**
     * Publish a screen into the catalogue
     * @private
     */
    _share: function() {
        if (this._description.isValid()) {
            if (this._isDirty) {
                this._pendingOperation = this._share.bind(this);
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
        Utils.showMessage("Screen successfully shared", {'hide': true});
    },

    /**
     * On forms loaded
     * @private
     */
    _onFormLoaded: function() {
        var formFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.FORM);
        var forms = formFactory.getBuildingBlocks(this._canvasCache.getFormURI());
        this._createInstances(formFactory, forms, this._areas.get('form'));
        this._canvasCache.setLoaded(Constants.BuildingBlock.FORM);     
        this._loadConnections();
    },

    /**
     * On operators loaded
     * @private
     */
    _onOperatorsLoaded: function() {
        var operatorFactory = Catalogue.
                    getBuildingBlockFactory(Constants.BuildingBlock.OPERATOR);
        var operators = operatorFactory.getBuildingBlocks(this._canvasCache.getOperatorURIs());
        this._createInstances(operatorFactory, operators, this._areas.get('operator'));
        this._canvasCache.setLoaded(Constants.BuildingBlock.OPERATOR);
        this._loadConnections();
    },

    /**
     * On resources loaded
     * @private
     */
    _onResourcesLoaded: function() {
        var resourceFactory = Catalogue.
                getBuildingBlockFactory(Constants.BuildingBlock.RESOURCE);
        var resources = resourceFactory.getBuildingBlocks(this._canvasCache.getResourceURIs());
        this._createInstances(resourceFactory, resources, this._areas.get('resource'));
        this._canvasCache.setLoaded(Constants.BuildingBlock.RESOURCE);
        this._loadConnections();
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
     * Create the pre and post conditions
     * @private
     */
     _createConditions: function(/** Array */ conditionList, /** DropZone */ area) {
        conditionList.each(function(condition) {
            var description = new BuildingBlockDescription(condition);
            var instance = new PrePostInstance(description, this._inferenceEngine, false);
            instance.setId(condition.id);
            instance.onFinish(true, condition.position);
            var zonePosition = area.getNode();
            $("main").appendChild(instance.getView().getNode());
            var effectivePosition = Geometry.adaptInitialPosition(zonePosition,
                                    instance.getView().getNode(), condition.position);
            $("main").removeChild(instance.getView().getNode());
            this._drop(area, instance, effectivePosition, true);
        }.bind(this));
    },

    /**
     * Creates the pipes programmatically
     * @private
     */
    _createPipes: function(/** Array */ pipes) {
        pipes.each(function(pipeData) {
            var fromInstance;
            var fromTerminal;
            if (pipeData.from.buildingblock != "") {
                fromInstance = this._findInstance(pipeData.from.buildingblock);
                fromTerminal = fromInstance.getTerminal(pipeData.from.condition);
            } else {
                fromInstance = this._description.getPre(pipeData.from.condition);
                if (!fromInstance) {
                    fromInstance = this._description.getPost(pipeData.from.condition);
                }
                fromTerminal = fromInstance.getTerminal();
            }
            var toInstance;
            var toTerminal;
            if (pipeData.to.buildingblock != "") {
                toInstance = this._findInstance(pipeData.to.buildingblock);
                toTerminal = toInstance.getTerminal(pipeData.to.condition);
            } else {
                toInstance = this._description.getPre(pipeData.to.condition);
                if (!toInstance) {
                    toInstance = this._description.getPost(pipeData.to.condition);
                }
                toTerminal = toInstance.getTerminal();
            }
            var pipe = this._pipeFactory.getPipe(fromTerminal, toTerminal);
            this._description.addPipe(pipe);
        }.bind(this));
    },

    /**
     * Creates the triggers
     * @private
     */
    _createTriggers: function(/** Array */ triggers) {
        triggers.each(function(triggerJSON) {
            var fromInstance = null;
            if (triggerJSON.from.buildingblock != "") {
                fromInstance = this._findInstance(triggerJSON.from.buildingblock);
            }
            var toInstance = this._findInstance(triggerJSON.to.buildingblock);
            var triggerData = {
                'from': {
                    'instance': fromInstance ? fromInstance : ScreenTrigger.INSTANCE_NAME,
                    'name': fromInstance ? triggerJSON.from.name : ScreenTrigger.ONLOAD
                },
                'to': {
                    'instance': toInstance,
                    'action': triggerJSON.to.action
                }
            }
            var trigger = this._triggerMappingFactory.createTrigger(triggerData);
            this._description.addTrigger(trigger);
        }.bind(this));
    },

    /**
     * Function that loads the triggers and the pipes of the loaded screens
     * @private
     */
    _loadConnections: function() {

        if (this._canvasCache.areInstancesLoaded()) {
            // Load pre and postconditions
            this._createConditions(this._canvasCache.getPreconditions(), this._areas.get('pre'));
            this._createConditions(this._canvasCache.getPostconditions(), this._areas.get('post'));
            this._createPipes(this._canvasCache.getPipes());
            this._createTriggers(this._canvasCache.getTriggers());
            this._setDirty(false);
            this._refreshReachability();
        }
    }
});

// vim:ts=4:sw=4:et:
