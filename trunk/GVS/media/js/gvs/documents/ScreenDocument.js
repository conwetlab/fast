var ScreenDocument = Class.create(PaletteDocument,
    /** @lends ScreenDocument.prototype */ {

    /**
     * Screen document.
     * @constructs
     * @extends PaletteDocument
     */
    initialize: function($super, /** Object */ properties) {     
        $super("Screen", properties, new ScreenInferenceEngine());

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
       
        this._start();
    },


    // **************** PUBLIC METHODS **************** //
    

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

    // **************** PRIVATE METHODS **************** //

    /**
     * Returns the areas of the document
     * @override
     * @private
     * @type Hash
     */
    _getAreas: function() {
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

        return $H({
            'form': formArea,
            'operator': operatorArea,
            'resource': resourceArea,
            'pre': preArea,
            'post': postArea
        });

    },

    /**
     * @private
     * @override
     */
    _getSets: function() {
      // Palette sets
        var formSet = new BuildingBlockSet(this._tags, Catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.FORM));
        var operatorSet = new BuildingBlockSet(this._tags, Catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.OPERATOR));
        var resourceSet = new BuildingBlockSet(this._tags, Catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.RESOURCE));
        var domainConceptSet = new DomainConceptSet(this._tags, Catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT));

        return [formSet, operatorSet, resourceSet, domainConceptSet];
    },

    /**
     * Gets the document description
     * @override
     * @private
     * @type BuildingBlockDescription
     */
    _getDescription: function(/** Object */ properties) {
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
                'label': {'en-gb': properties.name},
                'name': properties.name,
                'version': properties.version,
                'tags':  this._tags,
                "creator": GVS.getUser().getUserName(),
                "description": {"en-gb": "Please fill the description..."},
                "rights": "http://creativecommons.org/",
                "creationDate": null,
                "icon": "http://fast.morfeo-project.eu/icon.png",
                "screenshot": "http://fast.morfeo-project.eu/screenshot.png",
                "homepage": "http://fast.morfeo-project.eu/"
            };
        }

        return new ScreenDescription(description);
    },

    /**
     * Get the canvas cache for loading
     * @override
     * @private
     * @type String
     */
    _getCanvasCache: function(/** Object */ properties) {
        return new ScreenCanvasCache(properties);
    },

    /**
     * Returns the save uri
     * @type String
     * @private
     * @override
     */
    _getSaveUri: function() {
        return URIs.screen;
    },

    /**
     * Returns the empty palette status
     * @type Object
     * @private
     * @override
     */
    _getEmptyPalette: function() {
        return {
            "forms": [],
            "operators": [],
            "backendservices": [],
            "preconditions": [],
            "postconditions":[],
            "pipes":[]
        };
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
                this._description.contains(instance.getUri())) {
            Utils.showMessage("There is another element like this. Cannot add it", {
                'hide': true,
                'error': true
            });
            return false;
        }
        if (instance.constructor == FormInstance) {
            if (this._formInstance) {
                Utils.showMessage("Only one form per screen is allowed", {
                    'hide': true,
                    'error': true
                });
                return false;
            } else {
                this._formInstance = instance;
                this._description.icon = instance.getBuildingBlockDescription().icon;
                this._description.screenshot = instance.getBuildingBlockDescription().screenshot;
            }
        }

        this._addToArea(area, instance, position);
        
        if (!instance.getId()) {
            instance.setId(UIDGenerator.generate(instance.getTitle()));
        } else {
            UIDGenerator.setStartId(instance.getId());
        }
          
        if (instance.constructor != PrePostInstance) {
            instance.createTerminals(this._onPipeHandler.bind(this));
            this._description.addBuildingBlock(instance, position);
        } else {
            instance.setConfigurable(false);
            
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
        if (!isLoading) {
            this._setSelectedElement(instance);
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
    _deleteInstance: function($super, /** ComponentInstance */ instance) {
        
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

        $super(instance);
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

    /**
     * Configure the toolbar
     * @private
     */
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
     * This function updates the toolbar status
     * @private
     * @override
     */
    _updateToolbar: function(/** ComponentInstance */ element) {
        this._toolbarElements.get('deleteElement').setEnabled(element!=null);
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

        this._designContainer.domNode.addClassName('canvas');

        leftSplitter = this._designContainer.getSplitter("left");
        dojo.connect(leftSplitter,'onmousemove', this._repaint.bind(this));

        bottomSplitter = this._designContainer.getSplitter("bottom");
        dojo.connect(bottomSplitter,'onmousemove', this._repaint.bind(this));

        var rightSplitter = this._designContainer.getSplitter("right");
        dojo.connect(rightSplitter,'onmousemove', this._repaint.bind(this));

        var topSplitter = this._designContainer.getSplitter("top");
        dojo.connect(topSplitter,'onmousemove', this._repaint.bind(this));

        centerContainer.addChild(this._designContainer);
        centerContainer.addChild(this._inspectorArea);

        return centerContainer;
    },

    
    /**
     * This function repaints the terminals in the document
     * @private
     */
    _repaint: function() {
        this._description.getCanvasInstances().each(function(instance){
            instance.onUpdate();
        });
        this._description.getConditionInstances().each(function(instance) {
            instance.onUpdate();
        });
    },
    
    
    /**
     * This function updates the reachability in all
     * Elements: canvas and palettes
     * @private
     */
    _refreshReachability: function (/** Boolean (Optional) */_isFindCheck) {
        var isFindCheck = Utils.variableOrDefault(_isFindCheck, true);
        var canvas = this._getCanvasUris();
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
                var postInstance = this._description.getPost(post.id);
                if (postInstance) {
                    postInstance.getView().setReachability(post);
                }               
            }.bind(this));
        }
        if (reachabilityData.pipes) {
            reachabilityData.pipes.each(function(pipeData) {
                var pipe = this._pipeFactory.getPipeFromJSON(pipeData);
                if (pipe) {
                    pipe.setReachability(pipeData);
                }
            }.bind(this));
        }
        if (reachabilityData.connections) {
            reachabilityData.connections.each(function(connection) {
                // TODO
            }.bind(this));
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
                                            this._description.getCanvasInstances(),
                                            this._onTriggerChange.bind(this));
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
                instance = this._description.getInstance(triggerSplittedInfo[0]);
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
                instance = this._description.getInstance(triggerSplittedInfo[0]);
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
     * Publish a screen into the catalogue
     * @private
     */
    _share: function() {
        if (this._description.isValid()) {
            if (this._isDirty) {
                this._pendingOperation = this._share.bind(this);
                this._save(false);
            } else {
                var uri = URIs.share.replace("<id>", this._description.getId());
                PersistenceEngine.sendPost(uri, null, null,
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
                fromInstance = this._description.getInstance(pipeData.from.buildingblock);
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
                toInstance = this._description.getInstance(pipeData.to.buildingblock);
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
                fromInstance = this._description.getInstance(triggerJSON.from.buildingblock);
            }
            var toInstance = this._description.getInstance(triggerJSON.to.buildingblock);
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
