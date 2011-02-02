var ScreenflowDocument = Class.create(PaletteDocument,
    /** @lends ScreenflowDocument.prototype */ {

    /**
     * Screenflow document.
     * @constructs
     * @extends PaletteDocument
     */
    initialize: function($super, /** Object */ properties) {
        /**
         * Panel that will contain the plans
         * @private
         * @type PlanPanel
         */
        this._planPanel = new PlanPanel();

        $super("Screenflow", properties, new ScreenflowInferenceEngine());

        this._planPanel.setDropZone(this._areas.get('screen'));
        this._planPanel.setInferenceEngine(this._inferenceEngine);

        /**
         * @type GadgetDialog
         * @private @member
         */
        this._gadgetDialog = new GadgetDialog(this._description);

        /**
         * @type Player
         * @private @member
         */
        this._player = new ScreenflowPlayer();

        this._start();

        /**
         * "Edit the selected element" menu action
         * @type MenuAction
         * @private
         */
        this._editMenuAction = new MenuAction({
                            'label': 'Edit screen',
                            'weight':1,
                            'enabled': false,
                            'handler': function() {
                                this._cloneSelectedElement();
                            }.bind(this)});

        // Are the unreachable items shown?
        this._unreachableShown = true;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Loads the definition of a screenflow, when the screen is opened
     */
    loadInstances: function() {

        var screenFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.SCREEN);
        screenFactory.cacheBuildingBlocks(this._canvasCache.getScreenURIs(),
                    this._onScreenLoaded.bind(this));
    },


    /**
     * Implementing event listener
     * @override
     */
    positionUpdated: function(/** ComponentInstance */ element, /** Object */ position) {
        var isChanged;
        switch (element.constructor) {
            case ScreenInstance:
                isChanged = this._description.updateScreen(element.getUri(), position);
                break;
            case PrePostInstance:
                isChanged = this._description.updatePrePost(element.getUri(), position);
                break;
        }
        if (isChanged) {
            this._setDirty(true);
        }
    },

    /**
     * @override
     */
    getMenuElements: function($super) {
        var parentMenu = $super();
        parentMenu.edit.children.clone = {
            'type': 'Action',
            'action': this._editMenuAction,
            'group': 1
        };
        parentMenu.file.children.play = {
            'type': 'Action',
            'action': new MenuAction({
                'label': 'Play Gadget',
                'handler': function() {
                    this._playScreenflow();
                }.bind(this),
                'weight': 1
            }),
            'group': 2
        };
        parentMenu.file.children.gadget = {
            'type': 'Action',
            'action': new MenuAction({
                'label': 'Build Gadget',
                'handler': function() {
                    this._buildGadget();
                }.bind(this),
                'weight': 2
            }),
            'group': 2
        };
        return parentMenu;
    },

    /**
     * Creates a clone of the element screen
     */
    cloneElement: function(element) {
        var description = element.getBuildingBlockDescription();
        if (description.definition) {
            GVS.getDocumentController().cloneScreen(description.id);
        }
    },

    /**
     * Creates a plan from the canvas
     */
    getPlansElement: function() {

        var goal = this._getCanvasUris().collect(function(e) {
            return e.uri;
        });
        var canvas = this._getCanvasUris();
        this._inferenceEngine.getPlans(canvas, goal,
            this._onSuccessGetPlans.bind(this)
        );
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
        var screenArea = new Area('screen',
                                $A([Constants.BuildingBlock.SCREEN]),
                                this._drop.bind(this),
                                {splitter: true, region: 'center'});
        var preArea = new Area('pre',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'left', minWidth:100});
        var postArea = new Area('post',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'right', minWidth:100});
        screenArea.getNode().parentNode.appendChild(this._planPanel.getNode());

        return $H({
            'screen': screenArea,
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
        var screenSet = new BuildingBlockSet(this._tags, Catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.SCREEN));
        var domainConceptSet = new DomainConceptSet(this._tags, Catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT));

        return [screenSet, domainConceptSet];
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
            /*description.definition = null;
            description.precondition = null;
            description.postconditions = null;*/
            // TODO
        } else {
            // A new screenflow
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

        return new ScreenflowDescription(description);
    },

    /**
     * Get the canvas cache for loading
     * @override
     * @private
     * @type String
     */
    _getCanvasCache: function(/** Object */ properties) {
        return new ScreenflowCanvasCache(properties);
    },

    /**
     * Returns the save uri
     * @type String
     * @private
     * @override
     */
    _getSaveUri: function() {
        return URIs.screenflow;
    },

    /*
     * @override
     */
    _getType: function() {
        return "screenflow";
    },


    /**
     * Returns the empty palette status
     * @type Object
     * @private
     * @override
     */
    _getEmptyPalette: function() {
        return {
            "palette": [],
            "canvas": {
                "preconditions": [],
                "postconditions": []
            }
        };
    },


    /**
     * Implementing DropZone interface
     * @type Object
     *      It must contain two variables
     *      * Boolean accepted: the element is accepted
     *      * Boolean handledByDropZone: The position of the element
     *                                   will be defined by the dropzone and
     *                                   not by the draghandler
     */
    _drop: function(/** Area */ area, /** ComponentInstance */ instance,
                    /**Object */ position, /** Number */ orientation,
                    /** Boolean (Optional) */ _isLoading) {
        var isLoading = Utils.variableOrDefault(_isLoading, false);

        // Reject repeated elements (except domain concepts)
        if (instance.constructor != PrePostInstance &&
            instance.constructor != PlanInstance) {
            var uri;
            if (isLoading) {
                uri = instance.getOriginalUri();
            } else {
                // If the instance is new, _uri attribute is the original one
                uri = instance.getUri();
            }
            if (this._description.contains(uri)) {
                Utils.showMessage("There is another element like this. Cannot add it", {
                    'hide': true,
                    'error': true
                });
                return false;
            }
        }

        if (instance.constructor != PlanInstance) {
            this._addToArea(area, instance, position);
            instance.setEventListener(this);
            instance.enableDragNDrop(area,[area]);
        }

        switch (instance.constructor) {
            case ScreenInstance:
                if (isLoading) {
                    this._description.addScreen(instance, position);
                    this._inferenceEngine.addReachabilityListener(instance.getUri(),
                    instance.getView());
                } else {
                    instance.createCatalogueCopy(function() {
                        this._description.addScreen(instance, position);
                        this._refreshReachability();
                        this._setSelectedElement(instance);
                        this._save(false);
                    }.bind(this));
                }

                break;

            case PrePostInstance:
                instance.setChangeHandler(this._onPrePostChange.bind({
                        'mine':this,
                        'position': position,
                        'isLoading': isLoading
                    }));
                if (area.getNode().className.include("pre")) {
                    instance.setType("pre");
                    instance.getView().setReachability({"satisfied": true});
                } else if (area.getNode().className.include("post")) {
                    instance.setType("post");
                }
                if (!instance.getId()) {
                    instance.setId(UIDGenerator.generate(instance.getTitle()));
                    this._save(false);
                } else {
                    UIDGenerator.setStartId(instance.getId());
                }
                this._description.addPrePost(instance, position);
                this._refreshReachability();
                break;

            case PlanInstance:
                this._planPanel.hide();
                this._addPlan(instance, position);
                break;
        }
        this._setDirty(true);
        // Only for piping
        //instance.getView().addGhost();
        return true;
    },

    /**
     * @override
     */
    _setSelectedElement: function($super, element) {
        $super(element, false);
    },

    /**
     * Delete an instance.
     * @param ComponentInstance
     *      Instance to be deleted from the
     *      Screenflow document.
     * @override
     */
    _deleteInstance: function($super, /** ComponentInstance */ instance) {

        this._description.remove(instance.getUri());
        $super(instance);
    },

    /**
     * Callback to be called when the findCheck operation
     * finishes
     * @private
     */
    _findCheckCallback: function(/** Array */ uris, /** Object */ reachabilityData) {
        // Update screen palette
        var screenPalette = this._paletteController.getPalette(Constants.BuildingBlock.SCREEN);
        var screenSet = screenPalette.getBuildingBlockSet();
        screenSet.setURIs(uris);

        if (reachabilityData.canvas.postconditions) {
            reachabilityData.canvas.postconditions.each(function(post) {
                var postInstance = this._description.getPost(post.id);
                if (postInstance) {
                    var view = postInstance.getView();
                    if (view) {
                        view.setReachability(post);
                    }
                }
            }.bind(this));
        }

        this._updatePanes();
    },

    _configureToolbar: function() {
        this._addToolbarElement('save', new ToolbarButton(
                'Save the current screenflow',
                'save',
                this._save.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('properties', new ToolbarButton(
                'Edit screenflow properties',
                'properties',
                this._propertiesDialog.show.bind(this._propertiesDialog),
                true
            ));
        this._addToolbarElement('sep-1', new ToolbarSeparator());

        this._addToolbarElement('player', new ToolbarButton(
                'Play Screenflow',
                'player',
                this._playScreenflow.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('debugger', new ToolbarButton(
                'Debug (Test) Screenflow',
                'debugger',
                this._debugScreenflow.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('sep-2', new ToolbarSeparator());

        this._addToolbarElement('refresh', new ToolbarButton(
                'Refresh the buildingBlocks catalog',
                'refresh',
                this._refresh.bind(this),
                true
            ));
        this._addToolbarElement('toggleVisibility', new ToolbarButton(
                'Toggle Unreachable screens visibility',
                'toggle',
                this._toggleUnreachableScreens.bind(this),
                true
            ));
        this._addToolbarElement('planner', new ToolbarButton(
                'Create a plan for this screen',
                'planner',
                this._getPlans.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('sep-3', new ToolbarSeparator());

        this._addToolbarElement('previewElement', new ToolbarButton(
                'Preview selected element',
                'preview',
                this._previewSelectedElement.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('cloneElement', new ToolbarButton(
                'Clone selected element',
                'clone',
                this._cloneSelectedElement.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('deleteElement', new ToolbarButton(
                'Delete selected element',
                'delete',
                this._startDeletingSelectedElement.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('sep-4', new ToolbarSeparator());

        this._addToolbarElement('build', new ToolbarButton(
                'Build Gadget',
                'build',
                this._buildGadget.bind(this),
                false // disabled by default
            ));
        this._toolbarElements.get('build').setTextVisible(true);
    },

    /**
     * This function updates all the BuildingBlocks
     * Elements: canvas and palettes
     * @private
     */
    _refresh: function() {
        var canvas = this._getCanvasUris();
        var palette = this._paletteController.getComponentUris(Constants.BuildingBlock.SCREEN);
        var body = {
            'palette': this._paletteController.getComponentUris(Constants.BuildingBlock.SCREEN),
            'canvas': {
                'preconditions': this._description.getPreconditions(),
                'postconditions': this._description.getPostconditions()
            }
        };

        this._inferenceEngine.findCheck(
                canvas,
                body,
                this._tags,
                'reachability',
                this._findCheckCallback.bind(this)
        );
    },

    /**
     * This function updates the toolbar status
     * @private
     */
    _updateToolbar: function(/** ComponentInstance */ element) {
        this._toolbarElements.get('deleteElement').setEnabled(element!=null);
        this._toolbarElements.get('previewElement').setEnabled(element!=null);
        this._toolbarElements.get('planner').setEnabled(this._getCanvasUris().size()
        > 0);
        var enableClone = (element!=null &&
                            element.constructor == ScreenInstance &&
                            element.getBuildingBlockDescription().definition != null);
        this._toolbarElements.get('cloneElement').setEnabled(enableClone);
        this._editMenuAction.setEnabled(enableClone);
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

        this._designContainer.domNode.addClassName('canvas');

        centerContainer.addChild(this._designContainer);
        centerContainer.addChild(this._inspectorArea);

        return centerContainer;
    },


    /**
     * This function creates
     * the inspector area
     * @private
     */
    _createInspectorArea: function(){

        var inspectorArea = new dijit.layout.BorderContainer({
            region:"bottom",
            design:"horizontal",
            style:"height: 180px;",
            minSize:"100",
            maxSize:"220",
            persist:"false",
            splitter:true
            });
        return inspectorArea;
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
            'palette': this._paletteController.getComponentUris(Constants.BuildingBlock.SCREEN),
            'canvas': {
                'preconditions': this._description.getPreconditionsCatalogue(),
                'postconditions': this._description.getPostconditionsCatalogue()
            }
        };

        if (isFindCheck) {
            this._inferenceEngine.findCheck(canvas, body, this._tags,
                                    'reachability', this._findCheckCallback.bind(this));
        } else {
            this._inferenceEngine.check(canvas, body, this._tags,
                                    'reachability', this._updatePanes.bind(this));
        }

        // FIXME: we must learn about document reachability from the inference
        //        engine. By the moment, one screen == deployable screenflow ;)
        this._toolbarElements.get('build').setEnabled(canvas.size() > 0);
        this._toolbarElements.get('player').setEnabled(canvas.size() > 0);
        this._toolbarElements.get('debugger').setEnabled(canvas.size() > 0);
    },


    /**
     * This function updates the properties table and
     * the pre/post pane depending on the selected element
     * @private
     */
    _updatePanes: function() {
        if (!this._selectedElement) {
            var facts = this._getAllFacts();
            this._propertiesPane.fillTable(this._description);
            this._factPane.fillTable([], [], facts);
        } else {
            this._propertiesPane.fillTable(this._selectedElement);

            if (this._selectedElement.constructor == ScreenInstance) {
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
     * Play a screenflow
     * @private
     */
    _playScreenflow: function () {
        if (this._isDirty) {
                this._pendingOperation = this._playScreenflow.bind(this);
                this._save(false);
        } else {
            this._player.playScreenflow(this._description);
        }
    },

    /**
     * Debug a screenflow
     * @private
     */
    _debugScreenflow: function () {
        if (this._isDirty) {
                this._pendingOperation = this._debugScreenflow.bind(this);
                this._save(false);
        } else {
            this._player.debugScreenflow(this._description);
        }
    },

    /**
     * Build a gadget for the screenflow
     * @private
     */
    _buildGadget: function () {
        if (this._isDirty) {
                this._pendingOperation = this._buildGadget.bind(this);
                this._save(false);
        } else {
            this._gadgetDialog.show();
        }
    },

    /**
     * Runs when a *-condition changes
     * @private
     */
    _onPrePostChange: function(/** PrePostInstance */ instance) {
        this.mine._description.addPrePost(instance, this.position);
        if (!this.isLoading) {
            this.mine._refreshReachability();
            this.mine._setSelectedElement(instance);
            this.mine._setDirty(true);
        }
    },

    /**
     * Creates a plan taking as end the selected Element
     * @private
     */
    _getPlans: function() {
        if (this._planPanel.isVisible()) {
            this._planPanel.hide();
        } else {
            this.getPlansElement();
        }
    },

    /**
     * Called when the plans are returned
     * @private
     */
    _onSuccessGetPlans: function(/** Array */ plans) {
        if (plans.length > 0 && plans[0].length > 0) {
            this._planPanel.showPlans(plans);
        } else {
            alert("Sorry, but there is not any available plan for the selected screen");
        }
    },


    /**
     * This function adds all the (new) screens of the plan
     * to the screenflow
     * @private
     */
    _addPlan: function(/** PlanInstance */ plan, /** Object */ position){
        var screenPosition = {
            'left': position.left + 3, //with margin
            'top': position.top + 3
        };

        var pendingScreens = new Hash();

        plan.getPlanElements().each(function(screenDescription) {
            if (!this._description.contains(screenDescription.uri)) {
                var screen = new ScreenInstance(screenDescription,
                        this._inferenceEngine);
                pendingScreens.set(screenDescription.uri, screen);
            }
        }.bind(this));

        var request = pendingScreens.keys().collect(function(uri) {
            return {"uri": uri};
        });

        PersistenceEngine.sendPost(URIs.catalogueCopy, null, Object.toJSON(request), this,
            function(transport) {
                var screens = JSON.parse(transport.responseText);
                screens.each(function(screenData) {
                    var screenInstance = pendingScreens.get(screenData.uri);
                    screenInstance.setCopyUri(screenData.clone);

                    this._addToArea(this._areas.get('screen'), screenInstance, screenPosition);
                    this._description.addScreen(screenInstance, screenPosition);

                    //Incrementing the screen position for the next screen
                    screenPosition.left += 108; // Screen size=100 + margin=6 + border=2

                    screenInstance.setEventListener(this);
                    screenInstance.enableDragNDrop(this._areas.get('screen'),[this._areas.get('screen')]);
                    screenInstance.onFinish(true);
                }.bind(this));
                this._setSelectedElement();
                this._refreshReachability();

            }.bind(this), Utils.onAJAXError);


    },

    /**
     * On screens loaded
     * @private
     */
    _onScreenLoaded: function() {
        var screenFactory = Catalogue.
                getBuildingBlockFactory(Constants.BuildingBlock.SCREEN);
        var screens = screenFactory.getBuildingBlocks(this._canvasCache.getScreenURIs());
        this._createInstances(screenFactory, screens, this._areas.get('screen'));
        this._loadConditions();
    },

    /**
     * Create the pre and post conditions
     * @private
     */
     _createConditions: function(/** Array */ conditionList, /** DropZone */ area) {
        conditionList.each(function(condition) {
            var description = new PrePostDescription(condition);
            var instance = new PrePostInstance(description, this._inferenceEngine);
            instance.onFinish(true, condition.position);
            var zonePosition = area.getNode();
            $("main").appendChild(instance.getView().getNode());
            var effectivePosition = Geometry.adaptInitialPosition(zonePosition,
                                    instance.getView().getNode(), condition.position);
            $("main").removeChild(instance.getView().getNode());
            this._drop(area, instance, effectivePosition, true);
            this._description.addPrePost(instance, effectivePosition);
        }.bind(this));
    },

    /**
     * Function that loads the pre and post conditions
     * @private
     */
    _loadConditions: function() {
        // Load pre and postconditions
        this._createConditions(this._canvasCache.getPreconditions(), this._areas.get('pre'));
        this._createConditions(this._canvasCache.getPostconditions(), this._areas.get('post'));
        this._setDirty(false);
        this._refreshReachability();
        if (this._description.cloned) {
            this._saveAs(true);
        }
    },

    /**
     * Creates a clone of the selected screen
     * @private
     */
    _cloneSelectedElement: function() {
        this.cloneElement(this._selectedElement);
    },

    /**
     * Toggles the status of the unreachable screens of the palette
     * (hidden/shown)
     * @private
     */
    _toggleUnreachableScreens: function() {
        this._unreachableShown = !this._unreachableShown;
        this._refreshVisibility();
    },

    /**
     * Refreshes the visibility of unreachable screens
     * @private
     */
    _refreshVisibility: function() {

        var screenPalette = this._paletteController.getPalette(Constants.BuildingBlock.SCREEN);
        var paletteNode = screenPalette.getContentNode();

        var visibility = this._unreachableShown ? "block": "none";
        $A(paletteNode.childNodes).each(function(element) {
            if (element.match(".slot")) {

                if (element.firstChild.match(".unsatisfeable")) {
                    element.setStyle({
                        "display": visibility
                    });
                }
                if (element.firstChild.match(".satisfeable")) {
                    element.setStyle({
                        "display": "block"
                    });
                }
            }
        }, this);
    }
});

// vim:ts=4:sw=4:et:
