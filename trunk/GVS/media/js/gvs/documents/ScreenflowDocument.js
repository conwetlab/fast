var ScreenflowDocument = Class.create(AbstractDocument,
    /** @lends ScreenflowDocument.prototype */ {

    /**
     * Screenflow document.
     * @constructs
     * @extends AbstractDocument
     */
    initialize: function($super, /** String */ title, /** String */ domainContext) {
        $super(title, [Constants.BuildingBlock.SCREEN, Constants.BuildingBlock.CONNECTOR, 
               Constants.BuildingBlock.DOMAIN_CONCEPT]);
               
        this._documentType= Constants.DocumentType.SCREENFLOW;
       
        /** 
         * Variable
         * @type PropertiesPane
         * @private @member
         */
        this._propertiesPane = null;
        
        /** 
         * Variable
         * @type PrePostPane
         * @private @member
         */
        this._prePostPane = null;
        
         /** 
         * Variable
         * @type FactsPane
         * @private @member
         */
        this._factsPane = null;
        
        /**
         * Dialog to create a new document
         * @type FormDialog
         * @private @member
         */
        this._deployGadgetDialog = new DeployGadgetDialog(this);

        /**
         * Palette Controller
         * @type PaletteController
         * @private @member
         */ 
        this._paletteController = new PaletteController(this);
        
         /**
         * InferenceEngine
         * @type InferenceEngine
         * @private @member
         */ 
        this._inferenceEngine = new InferenceEngine(this);
        
        
        /*Screenflow Definition*/
        this._buildingBlockDescription = new ScreenflowDescription();
        
        
        this._screens = [];
        this._connectors = [];
        this._domainConcepts = [];
        this._selectedElement = null;
        
        this._buildingBlockDescription.setDomainContext(domainContext);
        
        this._populate();     
 
    },


    // **************** PUBLIC METHODS **************** //
    
    /**
     * This function populates the building blocks in the palettes
     */
    populateBuildingBlocks: function (){
        //Do the magic:
        //Fill palette data
        //calculate reachability
        this._paletteController.populateBuildingBlocks(this._buildingBlockDescription.getDomainContext());       
    },
    /**
     * Returns the BuildingBlock Description for the screenflow document
     * @type ScreenflowDescription
     */
    getBuildingBlockDescription: function () {
        return this._buildingBlockDescription;
    },
    
    updateBuildingBlockDescription: function () {
        var form = this._deployGadgetDialog.getForm();
        this.getBuildingBlockDescription().setLabel("en-GB", $F(form.name));
        this.getBuildingBlockDescription().setVersion($F(form.version));
        this.getBuildingBlockDescription().setDescription("en-GB", $F(form.info));
        this.getBuildingBlockDescription().setCreator($F(form.author));
    },
    
    /**
     * Returns the document inference engine
     * @type InferenceEngine
     */
    getInferenceEngine: function () {
        return this._inferenceEngine;
    },

    /**
     * Returns the list of screens for the screenflow document
     * @type ScreenInstance[]
     */
    getScreens: function () {
        return this._screens;
    },
    
    /**
     * Returns the list of connectors for the screenflow document
     * @type ConnectorInstance[]
     */
    getConnectors: function () {
        return this._connectors;
    },

    /**
     * Returns the list of domain concepts for the screenflow document
     * @type DomainConceptInstance[]
     */
    getDomainConcepts: function () {
        return this._domainConcepts;
    },

    /**
     * Returns an array with the building block description and the Building block type
     * for the building block view id passed as a parameter of the screenflow document
     * @type [BuildingBlockDescription, String]
     */
    getBuildingBlockInstance: function (buildingBlockViewId) {
        for (var i=0; i<this._screens.length; i++) {
            if (this._screens[i].getView().getId()==buildingBlockViewId) {
                return this._screens[i];
            }
        }
        for (var i=0; i<this._connectors.length; i++) {
            if (this._connectors[i].getView().getId()==buildingBlockViewId) {
                return this._connectors[i];
            }
        }
        for (var i=0; i<this._domainConcepts.length; i++) {
            if (this._domainConcepts[i].getView().getId()==buildingBlockViewId) {
                return this._domainConcepts[i];
            }
        }
        return null;
    },

    /**
     * Adds a new screen.
     * @param screen
     *      Screen to be added to the
     *      Screenflow document.
     */
    addScreen: function (screen) {
        if(screen!=null) {
            this._screens.push(screen);
            var screenDescUri = $H(screen.getBuildingBlockDescription()).get('uri');
            this._buildingBlockDescription.addScreen(screen.getId(), screenDescUri, screen.getPosition());
            
            this._updateReachability();           
            this.updateToolbar();         
        }
    },
    
    /**
     * Adds a new connector.
     * @param connector
     *      Connector to be added to the
     *      Screenflow document.
     */
    addConnector: function (connector) {
        if(connector!=null) {
            this._connectors.push(connector);
            this._updateReachability();      
            this.getBuildingBlockDescription().addConnector(connector.getId(), connector, connector.getPosition());
        }
    },
    
    //TODO: Call the catalogue
    updateConnector: function (connector) {
        /*
        if(connector!=null) {
            this.getBuildingBlockDescription().updateConnector(connector.getId(), connector, connector.getPosition());
        }
        */
    },

    /**
     * Adds a new domain concept.
     * @param domainConcept
     *      Domain Concept to be added to the
     *      Screenflow document.
     */
    //TODO: call the catalogue
    addDomainConcept: function (domainConcept) {
        if(domainConcept!=null) {
            this._domainConcepts.push(domainConcept);
            this._updateReachability();      
            //TODO: add the domain concept somehow inside the screenflowdescription
        }
    },

    /**
     * Delete a screen.
     * @param ScreenView.id
     *      Screen to be deleted from the
     *      Screenflow document.
     */
    deleteScreen: function(screenViewId) {
        for (var i=0; i<this._screens.length; i++) {
            if (this._screens[i].getView().getId()==screenViewId) {
                this._buildingBlockDescription.deleteScreen(this._screens[i].getId());
                this._screens[i] = null;
                break;
            }
        }
        this._screens = this._screens.compact();
        
        this._updateReachability();
        this.updateToolbar();
        this.setSelectedElement();
        this._propertiesPane.clearElement();
    },

    /**
     * Delete a connector.
     * @param ConnectorView.id
     *      Connector to be deleted from the
     *      Screenflow document.
     */
    deleteConnector: function(connectorViewId) {
        for (var i=0; i<this._connectors.length; i++) {
            if (this._connectors[i].getView().getId()==connectorViewId) {
                this._buildingBlockDescription.deleteConnector(this._connectors[i].getId());
                this._connectors[i] = null;
                break;
            }
        }
        this._connectors = this._connectors.compact();
        
        this._updateReachability();
        this.setSelectedElement();
        this._propertiesPane.clearElement();
    },

    /**
     * Delete a domain concept.
     * @param DomainConceptView.id
     *      Domain Concept to be deleted from the
     *      Screenflow document.
     */
    deleteDomainConcept: function(domainConceptViewId) {
        for (var i=0; i<this._domainConcepts.length; i++) {
            if (this._domainConcepts[i].getView().getId()==domainConceptViewId) {
                //TODO: fix this
                //this._buildingBlockDescription.deleteDomainConcept(this._domainConcepts[i].getId());
                this._domainConcepts[i] = null;
                break;
            }
        }
        this._domainConcepts = this._domainConcepts.compact();
        this._updateReachability();
        this.setSelectedElement();
        this._propertiesPane.clearElement();
    },

    /**
     * Returns the selected element for the screenflow document
     * @type {String[]}
     */
    getSelectedElement: function () {
        return this._selectedElement;
    },

    /**
     * Select a screen in the screenflow document
     * @param screen view
     *      Screen to be selected for the
     *      Screenflow document.
     */
    setSelectedElement: function (element) {
        if (this.getSelectedElement() != null) {
            this.getSelectedElement().removeClassName("selected");
        }
        if (element != undefined) {
            this._selectedElement = element;
            this.getSelectedElement().addClassName("selected");
        } else {
            this._selectedElement = null;
        }
    },

    /**
     * Creates a gadget deployment for the screenflow
     * @public
     */
    deployGadget: function () {
        this.getBuildingBlockDescription().deployGadget();
    },

    /**
     * Gets the elements of the canvas
     * @type String[]
     * @public
     */
    getCanvas: function () {
        var canvas = [];
        var screen_uris = [];
        $H(this._buildingBlockDescription.getScreens()).each(function(pair){
            screen_uris.push(pair.value.screen);
        });
        screen_uris = screen_uris.uniq();
        screen_uris.each(function(uri){
            canvas.push({'uri': uri});
        });
        return canvas;
    },

    /**
     * Gets the elements of the palette
     * @type String[]
     * @public
     */
    getPaletteElements: function () {
        var elements = [];
        (this._paletteController.getPalette(Constants.BuildingBlock.SCREEN).getComponents()).each(function(component){
            elements.push({'uri':component.getBuildingBlockDescription().uri});
        });
        return elements;
    },
    
    /**
     * Gets a detail from the detailPane
     * @type String
     * @public
     */
    getDetailsTitle: function ( /** String */ detail ) {
        return this._detailsTitle[detail];
    },
    
    updatePropertiesPane: function( /** BuildingBlockId */ buildingBlockId, /** String */ buildingBlockType) {
        var buildingBlockInstance = this.getBuildingBlockInstance(buildingBlockId);
        var buildingBlockDescription = buildingBlockInstance.getBuildingBlockDescription();
        switch(buildingBlockType){
            case Constants.BuildingBlock.SCREEN:
                var propertiesHash = new Hash();
                propertiesHash.set('title',buildingBlockDescription.label['en-gb']);
                propertiesHash.set('id',buildingBlockDescription.uri);
                propertiesHash.set('desc',buildingBlockDescription.description['en-gb']);
                propertiesHash.set('tags',buildingBlockDescription.domainContext.tags);
                this._propertiesPane.selectElement(propertiesHash,"screen",buildingBlockDescription.label['en-gb']);
                break;

            case Constants.BuildingBlock.CONNECTOR:
                var propertiesHash = buildingBlockInstance.getProperties().clone();
                this._propertiesPane.selectElement(propertiesHash,"connector",propertiesHash.get('type'));
                break;

            case Constants.BuildingBlock.DOMAIN_CONCEPT:
                var propertiesHash = new Hash();
                propertiesHash.set('name',buildingBlockDescription.name);
                propertiesHash.set('description',buildingBlockDescription.description);
                propertiesHash.set('semantics',buildingBlockDescription.semantics);
                this._propertiesPane.selectElement(propertiesHash,"domain concept", buildingBlockDescription.name);
                break;

            default:
                console.debug("properties pane called without buildingBlocktype", buildingBlockType);
                break;
        }
    },


    updateReachability: function(/** map id->value*/screenList){
        var screens = this.getScreens();
        for (var i = 0; i < screens.length; i++) {
            for (var j = 0; j < screenList.length; j++) {
                if (screens[i].getBuildingBlockDescription().uri == screenList[j].uri) {
                    if (screenList[j].reachability == true) {
                        screens[i].getBuildingBlockDescription().satisfeable = true;
                        break;
                    }
                    else {
                        screens[i].getBuildingBlockDescription().satisfeable = false;
                    }
                }
            }
            screens[i].colorize();
        }
    },
    
    showDeployGadgetDialog: function(){
        this._deployGadgetDialog.show();
    },
    
    hideDeployGadgetDialog: function(){
        this._deployGadgetDialog.hide();
    },
    
    onClickCanvas: function( /**Element*/ element){
        var clickedElement = this.getBuildingBlockElement(element);
        var buildingBlockType = this.getBuildingBlockType(clickedElement);
        switch (buildingBlockType) {
            case Constants.BuildingBlock.SCREEN:
                console.log("screen clicked");
                this.setSelectedElement(clickedElement);
                this.updatePropertiesPane(clickedElement.id, Constants.BuildingBlock.SCREEN);
                break;
            case Constants.BuildingBlock.DOMAIN_CONCEPT:
                console.log("domain concept clicked");
                this.setSelectedElement(clickedElement);
                this.updatePropertiesPane(clickedElement.id, Constants.BuildingBlock.DOMAIN_CONCEPT);
                break;
            case Constants.BuildingBlock.CONNECTOR:
                console.log("connector clicked");
                this.setSelectedElement(clickedElement);
                this.updatePropertiesPane(clickedElement.id, Constants.BuildingBlock.CONNECTOR);
                break;
            case 'canvas':
                console.log("canvas clicked");
                this.setSelectedElement();
                this._propertiesPane.clearElement();
                break;
            case "unknown":
            default:
                console.log("unknown clicked");
                this.setSelectedElement();
                this._propertiesPane.clearElement();
                break;
        }
    },

    onDblClickCanvas: function( /**Element*/ element){
        var clickedElement = this.getBuildingBlockElement(element);
        var buildingBlockType = this.getBuildingBlockType(clickedElement);
        switch (buildingBlockType) {
            case Constants.BuildingBlock.SCREEN:
                console.log("screen dbl-clicked");
                var screenDescription = this.getBuildingBlockInstance(clickedElement.id).getBuildingBlockDescription();
                var screenflowDoc = GVSSingleton.getInstance().getDocumentController().createPreviewDocument(screenDescription);
                break;
            case Constants.BuildingBlock.DOMAIN_CONCEPT:
                console.log("domain concept dbl-clicked");
                break;
            case Constants.BuildingBlock.CONNECTOR:
                console.log("connector dbl-clicked");
                this.getBuildingBlockInstance(clickedElement.id).showPropertiesDialog();
                break;
            case "canvas":
                console.log("canvas dbl-clicked");
                break;
            case "unknown":
            default:
                console.log("unknown dbl-clicked");
                break;
        }
    },

    /**
     * Gets the building block div in the canvas
     * @param {Element} element
     */
    getBuildingBlockElement: function(element){
        if (element.hasClassName('canvas') && element.hasClassName('document')) {
            return element;
        } else {
            while (element.up(0) != undefined) {
                if (element.up(0).hasClassName('canvas') && element.up(0).hasClassName('document')) {
                    return element;
                } else {
                    element = element.up(0);
                }
            }
        }
        return null;
    },

    getBuildingBlockType: function(element){
        if (element.hasClassName('canvas') && element.hasClassName('document')) {
            return 'canvas';
        } else {
            var elementClass = $w(element.className);
            elementClass = elementClass.without("unknown").without("satisfeable").
                            without("unsatisfeable").without("selected").without("view");
            return ((elementClass.size() >= 1) ? elementClass[0] : 'unknown');
        }
    },
    /**
     * @override
     */
    updateToolbar: function () {
           //TODO: this should be managed by a ToolbarManager
           $("header_button").show();
           //TODO: Enable or disable the button checking 
           //reachability and not the number of screens
           if (this.getScreens().length > 0){
               dijit.byId("showDeployGadgetDialog").attr("disabled",false);
           }
           else{
               dijit.byId("showDeployGadgetDialog").attr("disabled",true);               
           }
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Constructs the document content.
     * @private
     */
    _populate: function(){
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var borderContainerId = uidGenerator.generate("borderContainer");
        var mainBorderContainer = new dijit.layout.BorderContainer({
            id:borderContainerId,
            design:"sidebar",
            liveSplitters:"false",
            splitter:"true"
        });
        
        var rightBorderContainer = new dijit.layout.BorderContainer({
            id:borderContainerId + "Child",
            design:"headline",
            liveSplitters:"false",
            region:"center"
        });

        var documentContent = new Element("div", {
            "id": this._tabContentId,
            "class": "document screenflow canvas"
        });
        documentContent.observe('click', function(event){
            this.onClickCanvas(event.element());
        }.bind(this));
        documentContent.observe('dblclick', function(event){
            this.onDblClickCanvas(event.element());
        }.bind(this));
        var documentPaneId = uidGenerator.generate("documentPane");
        var documentPane = new dijit.layout.ContentPane({
            id:documentPaneId,
            region:"center"
        });
        documentPane.setContent(documentContent);
        
        var inspectorArea = this._createInspectorArea();   

        /* Properties pane*/
        this._propertiesPane = new PropertiesPane (inspectorArea);

        /* Pre/Post pane*/
        this._prePostPane = new PrePostPane(inspectorArea);

        /* Facts pane*/
        this._factsPane = new InspectorPane(inspectorArea);


        rightBorderContainer.addChild(documentPane);
        rightBorderContainer.addChild(inspectorArea);
        mainBorderContainer.addChild(this.getPaletteController().getNode());
        mainBorderContainer.addChild(rightBorderContainer);

        this._tab.setContent(mainBorderContainer.domNode);
    },
    
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
     */
    _updateReachability: function () {
        var canvas = this.getCanvas();
        var domainContext = this.getBuildingBlockDescription().getDomainContext();
        
        var palette = this.getPaletteElements();
        
        if (URIs.catalogueFlow =='check'){
            this._inferenceEngine.check(canvas, domainContext, palette, 'reachability');
        } else {
            this._inferenceEngine.findAndCheck(canvas, domainContext, palette, 'reachability');
        }
    }

});

// vim:ts=4:sw=4:et:
