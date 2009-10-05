var ScreenflowDocument = Class.create(PaletteDocument,
    /** @lends ScreenflowDocument.prototype */ {

    /**
     * Screenflow document.
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
        
        
        $super(title, [Constants.BuildingBlock.SCREEN, Constants.BuildingBlock.DOMAIN_CONCEPT], 
        domainContext);
        
        /**
         * @type Deployer
         * @private @member
         */
        this._deployer = new Deployer();
       
              
        // Screenflow Definition
        
         /**
         * The screenflow description
         * @type ScreenflowDescription
         * @private @member
         */       
        this._description = new ScreenflowDescription({
            'label': {'en-gb': title},
            'name': title,
            'version': version,
            'domainContext': {
                'tags': domainContext
            }
        });
        //Screenflow properties
        this._propertiesPane.fillTable(this._description);

        this._configureToolbar();
        
        /**
         * Screen and domain concept instances on the
         * canvas by uri
         * @private
         * @type Hash 
         */
        this._canvasInstances = new Hash();

        // Start retrieving data
        this._inferenceEngine.findCheck(
                this._getCanvas(),
                /* palette elements */ [],
                this._domainContext,
                'reachability',
                this._findCheckCallback.bind(this)
        );
        this._paletteController.startRetrievingData();   
    },


    // **************** PUBLIC METHODS **************** //
    
    /**
     * Returns the BuildingBlock Description for the screenflow document
     * @type ScreenflowDescription
     */
    getBuildingBlockDescription: function () {
        return this._description;
    },

    /**
     * Implementing DropZone interface.
     * @override
     */
    drop: function(/** ComponentInstance */ droppedElement) {
        // Reject repeated elements (except domain concepts)
        if (this._canvasInstances.get(droppedElement.getUri()) &&
            (droppedElement.constructor != PrePostInstance)) {
            return false;
        }
      
        switch (droppedElement.constructor) {
            case ScreenInstance:
                this._canvasInstances.set(droppedElement.getUri(), droppedElement);
                this._description.addScreen(droppedElement.getUri(), droppedElement.getPosition());
                this._refreshReachability();
                break;
                
            case PrePostInstance:
                droppedElement.setChangeHandler(this._onPrePostChange.bind(this));
                break;
                
            default:
                alert("Don't know how to accept that kind of element. ScreenflowDocument::drop");    
        }            

        this.setSelectedElement(droppedElement);
        return true; // Accept element
    },

    /**
     * Select a screen in the screenflow document
     * @param ComponentInstance
     *      Element to be selected for the
     *      Screenflow document.
     * @override
     */
    setSelectedElement: function ($super, element) {
        $super(element);
        this._toolbarElements.get('deleteElement').setEnabled(element!=null);
        this._toolbarElements.get('previewElement').setEnabled(element!=null);
        this._updatePanes();
    },

    // **************** PRIVATE METHODS **************** //
    

    /**
     * Delete a screen.
     * @param ComponentInstance
     *      Instance to be deleted from the
     *      Screenflow document.
     * @override
     */
    _deleteInstance: function(instance) {
            
        var node = instance.getView().getNode();
        node.parentNode.removeChild(node);
        
        this._canvasInstances.unset(instance.getUri());
        
        switch(instance.constructor) {
            case ScreenInstance:
                this._description.removeScreen(instance.getUri());
                break;
                
            case PrePostInstance:
                this._description.removePrePost(instance.getUri());
                break;
                
            default:
                throw "Illegal state. ScreenflowDocument::deleteInstance";
        }
        
        this._refreshReachability();
        this.setSelectedElement();
        instance.destroy();
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
    _findCheckCallback: function(/** Array */ uris) {
        // Update screen palette        
        var screenPalette = this._paletteController.getPalette(Constants.BuildingBlock.SCREEN);
        var screenSet = screenPalette.getBuildingBlockSet();      
        screenSet.addURIs(uris);
    },
    
    _configureToolbar: function() {
        this._addToolbarElement('save', new ToolbarButton(
                'Save the current screenflow',
                'save',
                this._saveScreenflow.bind(this),
                false // disabled by default
        ));
        this._addToolbarElement('previewElement', new ToolbarButton(
                'Preview selected element',
                'preview',
                this._previewSelectedElement.bind(this),
                false // disabled by default
        ));
        this._addToolbarElement('deleteElement', new ToolbarButton(
                'Delete selected element',
                'delete',
                this._startDeletingSelectedElement.bind(this),
                false // disabled by default
        ));
        this._addToolbarElement('deploy', new ToolbarButton(
                'Store & Deploy Gadget',
                'deploy',
                this._deployGadget.bind(this),
                false // disabled by default
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
        
        this._tabContent.addClassName("screenflow").
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
            persist:"false",
            splitter:true
            });
        return inspectorArea;
    },
    
    
    /**
     * Close document event handler.
     * @overrides
     * @private
     */
    _closeDocument: function() {
        confirm("Are you sure you want to close the current Screenflow?" + 
            " Unsaved changes will be lost", this._confirmCallback.bind(this));
        return false;
    },
    
    
    /**
     * This function is called when the user has confirmed the closing
     * @private
     * @param boolean
     *     The parameter represents if the user has accepted the closing (true)
     *     or not (false)
     */
    _confirmCallback: function (close){
        if (close){
            var gvs = GVSSingleton.getInstance();
            gvs.getDocumentController().closeDocument(this._tabId);
        }
    },
    
    
    /**
     * This function updates the reachability in all
     * Elements: canvas and palettes
     * @private
     */
    _refreshReachability: function () {
        var canvas = this._getCanvas();
        var palette = this._paletteController.getComponentUris();
        
        if (URIs.catalogueFlow =='check') {
            this._inferenceEngine.check(canvas, palette, this._domainContext, 'reachability');
        } else {
            this._inferenceEngine.findAndCheck(canvas, palette,  this._domainContext, 'reachability');
        }
        
        // FIXME: we must learn about document reachability from the inference 
        //        engine. By the moment, one screen == deployable screenflow ;)
        this._toolbarElements.get('deploy').setEnabled(canvas.size() > 0);
        this._toolbarElements.get('save').setEnabled(canvas.size() > 0);
    },
    
    
    /**
     * This function updates the properties table and 
     * the pre/post pane depending on the selected element
     * @private
     */
    _updatePanes: function() {
        var facts = this._getAllFacts();
        if (!this._selectedElement) {
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
                    var factInfo = [this._selectedElement.getConditionTable(
                        this._inferenceEngine.isReachable(this._selectedElement.getUri())
                    )];
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
        this._canvasInstances.each(function(pair){
            var instance = pair.value;
            if (instance.constructor == ScreenInstance) {
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
                var factInfo = instance.getConditionTable(
                    this._inferenceEngine.isReachable(instance.getUri())
                );
                if (!resultHash.get(factInfo[2]/*The uri of the pre/post*/)) {
                    resultHash.set(factInfo[2], factInfo);
                }
            }
        }.bind(this));
        return resultHash.values();
    },
    
    /**
     * onClick handler
     * @private
     */
    _onClick: function() {
        this.setSelectedElement();
    },
    
    
    /**
     * Creates a gadget deployment for the screenflow
     * @private
     */
    _deployGadget: function () {
        this._deployer.deployGadget(this._description);
    },
    
    /**
     * @private
     */
    _onPrePostChange: function(/** String */ previousUri, /** PrePostInstance */ instance) {
        if (previousUri) {
            this._canvasInstances.unset(previousUri);
            this._description.removePrePost(previousUri);
        }
        
        this._canvasInstances.set(instance.getUri(), instance);
        this._description.addPrePost(instance);
        
        this._refreshReachability();
        
        this.setSelectedElement();
    },
    
    
    /**
     * Previews the selected element
     * depending on the type of the
     * selected element
     * @private
     */
    _previewSelectedElement: function() {
        this._selectedElement.showPreviewDialog();
    },
      
    
    /**
     * Starts the process of saving the screenflow
     * @private
     */
    _saveScreenflow: function() {
        //TODO: Do it!
    }
});

// vim:ts=4:sw=4:et:
