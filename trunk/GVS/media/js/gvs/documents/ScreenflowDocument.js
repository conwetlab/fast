var ScreenflowDocument = Class.create(PaletteDocument,
    /** @lends ScreenflowDocument.prototype */ {

    /**
     * Screenflow document.
     * @constructs
     * @extends PaletteDocument
     */
    initialize: function($super, /** String */ title, /** Array */ domainContext) {
        
        
        
        this._inspectorArea = this._createInspectorArea(); 
               
        /** 
         * Variable
         * @type PropertiesPane
         * @private @member
         */
        this._propertiesPane = new PropertiesPane(this._inspectorArea);
        
        /** 
         * Variable
         * @type PrePostPane
         * @private @member
         */
        this._prePostPane = new PrePostPane(this._inspectorArea);
        
         /** 
         * Variable
         * @type FactsPane
         * @private @member
         */
        this._factsPane = new InspectorPane(this._inspectorArea);
        
        $super(title, [Constants.BuildingBlock.SCREEN, Constants.BuildingBlock.DOMAIN_CONCEPT], 
        domainContext);
        
        /**
         * Dialog to create a new document
         * @type FormDialog
         * @private @member
         */
        this._deployGadgetDialog = new DeployGadgetDialog(this);
       
              
        // Screenflow Definition
        
         /**
         * The screenflow description
         * @type ScreenflowDescription
         * @private @member
         */       
        this._description = new ScreenflowDescription();

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
    
    // FIXME: this method stinks
    updateBuildingBlockDescription: function () {
        var form = this._deployGadgetDialog.getForm();
        this._description.label = {"en-GB": $F(form.name)};
        this._description.version = $F(form.version);
        this._description.description = {"en-GB": $F(form.info)};
        this._description.creator = $F(form.author);
    },

    
    
    /**
     * Implementing DropZone interface.
     * @override
     */
    drop: function(/** ComponentInstance */ droppedElement) {
        // Reject repeated elements (except domain concepts)
        if (this._canvasInstances.get(droppedElement.getUri()) &&
            (droppedElement.constructor != DomainConceptInstance)) {
            return false;
        }
        
        this._canvasInstances.set(droppedElement.getUri(), droppedElement);
        
        switch (droppedElement.constructor) {
            case ScreenInstance:
                this._description.addScreen(droppedElement.getUri(), droppedElement);
                this._refreshReachability();
                break;
                
            case DomainConceptInstance:
                // TODO
                break;
                
            default:
                alert("Don't know how to accept that kind of element. ScreenflowDocument::drop");    
        }            

       
        this.updateToolbar();
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
        
        this._updatePropertiesPane();
    },

    /**
     * Creates a gadget deployment for the screenflow
     * @public
     */
    deployGadget: function () {
        // FIXME: move the method here
        this.getBuildingBlockDescription().deployGadget();
    },
    
    showDeployGadgetDialog: function(){
        this._deployGadgetDialog.show();
    },
    
    hideDeployGadgetDialog: function(){
        this._deployGadgetDialog.hide();
    },
    
    /**
     * @override
     */
    updateToolbar: function () {
           //TODO: this should be managed by a ToolbarManager
           $("header_button").show();
           //TODO: Enable or disable the button checking 
           //reachability and not the number of screens
           if (this._canvasInstances.keys().size() > 0){
               dijit.byId("showDeployGadgetDialog").attr("disabled",false);
           }
           else{
               dijit.byId("showDeployGadgetDialog").attr("disabled",true);               
           }
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
        if (this._canvasInstances.get(instance.getUri())) {
            
            var node = instance.getView().getNode();
            node.parentNode.removeChild(node);
            
            this._canvasInstances.unset(instance.getUri());
            
            switch(instance.constructor) {
                case ScreenInstance:
                    this._description.removeScreen(instance.getUri());
                    break;
                    
                case DomainConceptInstance:
                    alert("Not yet implemented. ScreenflowDocument::deleteInstance");
                    break;
                    
                default:
                    throw "Illegal state. ScreenflowDocument::deleteInstance";
            }
            
            this._refreshReachability();
            this.updateToolbar();
            this.setSelectedElement();
            instance.destroy();
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
    _findCheckCallback: function(/** Array */ uris) {
        // Update screen palette        
        var screenPalette = this._paletteController.getPalette(Constants.BuildingBlock.SCREEN);
        var screenSet = screenPalette.getBuildingBlockSet();      
        screenSet.addURIs(uris);
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
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var inspectorAreaId = uidGenerator.generate("inspectorArea");
        var inspectorArea = new dijit.layout.BorderContainer({
            id:inspectorAreaId,
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
    },
    /**
     * This function updates the properties table
     * depending on the selected element
     * @private
     */
    _updatePropertiesPane: function() {
        if (!this._selectedElement) {
            this._propertiesPane.clearElement();
        } else {
            this._propertiesPane.selectElement(this._selectedElement);
        }
    },
    
    /**
     * onClick handler
     * @private
     */
    _onClick: function() {
        this.setSelectedElement();
    }
});

// vim:ts=4:sw=4:et:
