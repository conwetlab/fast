var ScreenflowDocument = Class.create(AbstractDocument,
    /** @lends ScreenflowDocument.prototype */ {

    /**
     * Screenflow document.
     * @constructs
     * @extends AbstractDocument
     */
    initialize: function($super, /** String */ title) {
        $super(title);
        this._detailsTitle = null;
        this._detailsTable = null;
        
        this._validResources = ['screen','flowControl','connector', 'domainConcept'];
        this._documentType='screenflow';
        /*Screenflow Definition*/
        this._resourceDescription = new ScreenflowDescription();
        this._screens = [];
        this._connectors = [];
        this._domainConcepts = [];
        this._selectedElement = null;
        this._paletteController = new PaletteController(this.getTabId());
        this._populate();
        
        /**
         * Dialog to create a new document
         * @type FormDialog
         * @private
         */
        this._DeployGadgetDialog = null;
    },


    // **************** PUBLIC METHODS **************** //
    /**
     * Returns the Resource Description for the screenflow document
     * @type {ScreenflowDescription}
     */
    getResourceDescription: function () {
        return this._resourceDescription;
    },
    
    updateResourceDescription: function () {
        var form = this.getDeployGadgetDialog().getForm();
        this.getResourceDescription().setLabel("en-GB", $F(form.name));
        this.getResourceDescription().setVersion($F(form.version));
        this.getResourceDescription().setDescription("en-GB", $F(form.info));
        this.getResourceDescription().setCreator($F(form.author));
    },
    
    /**
     * Returns the Gadget Deployment Dialog
     * @type {FormDialog}
     */
    getDeployGadgetDialog: function (){
        return this._DeployGadgetDialog;
    },

    /**
     * Returns the list of screens for the screenflow document
     * @type {ScreenInstance[]}
     */
    getScreens: function () {
        return this._screens;
    },
    
    /**
     * Returns the list of connectors for the screenflow document
     * @type {ConnectorInstance[]}
     */
    getConnectors: function () {
        return this._connectors;
    },

    /**
     * Returns the list of domain concepts for the screenflow document
     * @type {DomainConceptInstance[]}
     */
    getDomainConcepts: function () {
        return this._domainConcepts;
    },

    /**
     * Returns an array with the resource description and the resource type for the resource view id 
     * passed as a parameter of the screenflow document
     * @type {[ResourceDescription, String]}
     */
    getResourceInstance: function (resourceViewId) {
        for (var i=0; i<this._screens.length; i++) {
            if (this._screens[i].getView().getId()==resourceViewId) {
                return this._screens[i];
            }
        }
        for (var i=0; i<this._connectors.length; i++) {
            if (this._connectors[i].getView().getId()==resourceViewId) {
                return this._connectors[i];
            }
        }
        for (var i=0; i<this._domainConcepts.length; i++) {
            if (this._domainConcepts[i].getView().getId()==resourceViewId) {
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
            var screenDescUri = $H(screen.getResourceDescription()).get('uri');
            this.getResourceDescription().addScreen(screen.getId(), screenDescUri, screen.getPosition());
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
            this.getResourceDescription().addConnector(connector.getId(), connector, connector.getPosition());
        }
    },
    
    //TODO
    updateConnector: function (connector) {
        /*
        if(connector!=null) {
            this.getResourceDescription().updateConnector(connector.getId(), connector, connector.getPosition());
        }
        */
    },

    /**
     * Adds a new domain concept.
     * @param domainConcept
     *      Domain Concept to be added to the
     *      Screenflow document.
     */
    addDomainConcept: function (domainConcept) {
        if(domainConcept!=null) {
            this._domainConcepts.push(domainConcept);
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
                this._resourceDescription.deleteScreen(this._screens[i].getId());
                this._screens[i] = null;
                break;
            }
        }
        this._screens = this._screens.compact();
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        var canvas = currentDocument.getCanvas();
        var domainContext = {
            "tags":currentDocument.getResourceDescription().getDomainContexts(),
            "user":null
        };
        var elements = currentDocument.getPaletteElements();
        CatalogueSingleton.getInstance().check(canvas, domainContext, elements, 'reachability');
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
                this._resourceDescription.deleteConnector(this._connectors[i].getId());
                this._connectors[i] = null;
                break;
            }
        }
        this._connectors = this._connectors.compact();
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        var canvas = currentDocument.getCanvas();
        var domainContext = {
            "tags":currentDocument.getResourceDescription().getDomainContexts(),
            "user":null
        };
        var elements = currentDocument.getPaletteElements();
        CatalogueSingleton.getInstance().check(canvas, domainContext, elements, 'reachability');
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
                //this._resourceDescription.deleteDomainConcept(this._domainConcepts[i].getId());
                this._domainConcepts[i] = null;
                break;
            }
        }
        this._domainConcepts = this._domainConcepts.compact();
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        var canvas = currentDocument.getCanvas();
        var domainContext = {
            "tags":currentDocument.getResourceDescription().getDomainContexts(),
            "user":null
        };
        var elements = currentDocument.getPaletteElements();
        CatalogueSingleton.getInstance().check(canvas, domainContext, elements, 'reachability');
    },

    /**
     * Gets the palette controller
     * @type PaletteController
     * @public
     */
    getPaletteController: function () {
        return this._paletteController;
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
        this.getResourceDescription().deployGadget();
    },

    /**
     * Gets the elements of the canvas
     * @type String[]
     * @public
     */
    getCanvas: function () {
        var canvas = [];
        var screen_uris = [];
        $H(this._resourceDescription.getScreens()).each(function(pair){
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
        (this._paletteController.getPalette("screen").getComponents()).each(function(component){
            elements.push({'uri':component.getResourceDescription().uri});
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
    
    updatePropertiesPane: function( /** ResourceId */ resourceId, /** String */ resourceType) {
        var resourceInstance = this.getResourceInstance(resourceId);
        var resourceDescription = resourceInstance.getResourceDescription();
        this.emptyPropertiesPane();
        switch(resourceType){
            case "screen":
                $(this.getDetailsTitle('detailsTitle')).update('Properties of screen: ' + resourceDescription.label['en-gb']);
                var propertiesHash = new Hash();
                propertiesHash.set('title',resourceDescription.label['en-gb']);
                propertiesHash.set('id',resourceDescription.uri);
                propertiesHash.set('desc',resourceDescription.description['en-gb']);
                propertiesHash.set('tags',resourceDescription.domainContext.tags);
                this._updatePropertiesTable(propertiesHash);
                break;

            case "connector":
                var propertiesHash = resourceInstance.getProperties().clone();
                $(this.getDetailsTitle('detailsTitle')).update('Properties of connector: ' + propertiesHash.get('type'));
                
                //propertiesHash.set('type',resourceDescription.type);
                this._updatePropertiesTable(propertiesHash);
                break;

            case "domainConcept":
                $(this.getDetailsTitle('detailsTitle')).update('Properties of domain concept: ' + resourceDescription.name);
                var propertiesHash = new Hash();
                propertiesHash.set('name',resourceDescription.name);
                propertiesHash.set('description',resourceDescription.description);
                propertiesHash.set('semantics',resourceDescription.semantics);
                this._updatePropertiesTable(propertiesHash);
                break;

            default:
                console.debug("properties pane called without resourcetype", resourceType);
                break;
        }
    },

    emptyPropertiesPane: function() {
        $(this.getDetailsTitle('detailsTitle')).update('Properties');
        var detArray = $A(this._detailsTable.childElements());
        for (var i = 0; i < detArray.length-1; i++){
            this._detailsTable.removeChild(detArray[detArray.length-1-i]);
        }
    },

    updateReachability: function(/** map id->value*/screenList){
        var screens = this.getScreens();
        for (var i = 0; i < screens.length; i++) {
            for (var j = 0; j < screenList.length; j++) {
                if (screens[i].getResourceDescription().uri == screenList[j].uri) {
                    if (screenList[j].reachability == true) {
                        screens[i].getResourceDescription().satisfeable = true;
                        break;
                    }
                    else {
                        screens[i].getResourceDescription().satisfeable = false;
                    }
                }
            }
            screens[i].colorize();
        }
    },
    
    showDeployGadgetDialog: function(){
        if (this._DeployGadgetDialog == null) {
            this._DeployGadgetDialog = new FormDialog({
                "title": "Deploy Gadget",
                "style": "display:none;"
            });
            
            var dialogDiv = new Element("div");
            var h2 = new Element("h2").update("Fulfill Gadget Information");
            dialogDiv.appendChild(h2);
            
            var divWizardInfo = new Element('div');
            var divInfo = new Element("div", {
                "class": "line"
            }).update("Please fulfill the required information in order to" +
            " deploy a gadget.");
            
            divWizardInfo.insert(divInfo);

            var form1 = new Element('form', {
                method: "post"
            });
            var hGadgetInformation = new Element('h3').update("Gadget information");
            form1.insert(hGadgetInformation);
            
            var divGadgetName = new Element("div", {
                "class": "line"
            });
            var labelGadgetName = new Element("label").update("Gadget Name:");
            divGadgetName.insert(labelGadgetName);
            var inputGadgetName = new Element("input", {
                type: "text",
                name: "name",
                value: this.getTitle(),
                "class": "input_GadgetInfo"
            });
            divGadgetName.insert(inputGadgetName);
            form1.insert(divGadgetName);
            
            var divVendor = new Element("div", {
                "class": "line"
            });
            var labelVendor = new Element("label").update("Vendor:");
            divVendor.insert(labelVendor);
            var inputVendor = new Element("input", {
                type: "text",
                name: "vendor",
                value: "Morfeo",
                "class": "input_GadgetInfo"
            });
            divVendor.insert(inputVendor);
            form1.insert(divVendor);
            
            var divVersion = new Element("div", {
                "class": "line"
            });
            var labelVersion = new Element("label").update("Version:");
            divVersion.insert(labelVersion);
            var inputVersion = new Element("input", {
                type: "text",
                name: "version",
                value: "1.0",
                "class": "input_GadgetInfo"
            });
            divVersion.insert(inputVersion);
            form1.insert(divVersion);
            
            var divGadgetDescription = new Element("div", {
                "class": "line"
            });
            var labelGadgetDescription = new Element("label").update("Gadget Description:");
            divGadgetDescription.insert(labelGadgetDescription);
            var inputGadgetDescription = new Element("input", {
                type: "text",
                name: "info",
                value: "Write your description here...",
                "class": "input_GadgetInfo"
            });
            divGadgetDescription.insert(inputGadgetDescription);
            form1.insert(divGadgetDescription);
            
            var hAuthorInformation = new Element('h3').update("Author information");
            form1.insert(hAuthorInformation);
            
            var divAuthorName = new Element("div", {
                "class": "line"
            });
            var labelAuthorName = new Element("label").update("Author Name:");
            divAuthorName.insert(labelAuthorName);
            var inputAuthorName = new Element("input", {
                type: "text",
                name: "author",
                value: "Your Author name",
                "class": "input_GadgetInfo"
            });
            divAuthorName.insert(inputAuthorName);
            form1.insert(divAuthorName);
            
            var divEmail = new Element("div", {
                "class": "line"
            });
            var labelEmail = new Element("label").update("E-Mail:");
            divEmail.insert(labelEmail);
            var inputEmail = new Element("input", {
                type: "text",
                name: "email",
                value: "email@yourcompany.com",
                "class": "input_GadgetInfo"
            });
            divEmail.insert(inputEmail);
            form1.insert(divEmail);
            
            var inputDeployScreens = new Element("input", {
                type: "hidden",
                name: "screens",
                "class": "input_GadgetInfo"
            });
            form1.insert(inputDeployScreens);
            
            var inputDeploySlots = new Element("input", {
                type: "hidden",
                name: "slots"
            });
            form1.insert(inputDeploySlots);
            
            var inputDeployEvents = new Element("input", {
                type: "hidden",
                name: "events"
            });
            form1.insert(inputDeployEvents);
            
            divWizardInfo.insert(form1);
            dialogDiv.appendChild(divWizardInfo);
            
            var divWizardButtons = new Element("div");
            var mine = this;
            var sendButton = new dijit.form.Button({
                'label': 'Send',
                onClick: function(){
                    ScreenflowDocument.prototype.updateResourceDescription.apply(mine, arguments);
                    ScreenflowDocument.prototype.deployGadget.apply(mine, arguments);
                    ScreenflowDocument.prototype.hideDeployGadgetDialog.apply(mine, arguments);
                }
            });
            divWizardButtons.insert(sendButton.domNode);
            var cancelButton = new dijit.form.Button({
                'label': 'Cancel',
                onClick: function(){
                    ScreenflowDocument.prototype.hideDeployGadgetDialog.apply(mine, arguments);
                }
            });
            divWizardButtons.appendChild(cancelButton.domNode);
            dialogDiv.appendChild(divWizardButtons);
            this._DeployGadgetDialog.getDialog().setContent(dialogDiv);
        } else {
            this._DeployGadgetDialog.getForm().name.setValue(this.getTitle());
        }
        this._DeployGadgetDialog.show();
    },
    
    hideDeployGadgetDialog: function(){
        this._DeployGadgetDialog.hide();
    },
    
    onClickCanvas: function( /**Element*/ element){
        var clickedElement = this.getBuildingBlockElement(element);
        var resourceType = this.getBuildingBlockType(clickedElement);
        switch (resourceType) {
            case "screen":
                console.log("screen clicked");
                this.setSelectedElement(clickedElement);
                this.updatePropertiesPane(clickedElement.id, "screen");
                break;
            case "domainConcept":
                console.log("domain concept clicked");
                this.setSelectedElement(clickedElement);
                this.updatePropertiesPane(clickedElement.id, "domainConcept");
                break;
            case "connector":
                console.log("connector clicked");
                this.setSelectedElement(clickedElement);
                this.updatePropertiesPane(clickedElement.id, "connector");
                break;
            case "canvas":
                console.log("canvas clicked");
                this.setSelectedElement();
                this.emptyPropertiesPane();
                break;
            case "unknown":
            default:
                console.log("unknown clicked");
                this.setSelectedElement();
                this.emptyPropertiesPane();
                break;
        }
    },

    onDblClickCanvas: function( /**Element*/ element){
        var clickedElement = this.getBuildingBlockElement(element);
        var resourceType = this.getBuildingBlockType(clickedElement);
        switch (resourceType) {
            case "screen":
                console.log("screen dbl-clicked");
                var screenDescription = this.getResourceInstance(clickedElement.id).getResourceDescription();
                var screenflowDoc = GVSSingleton.getInstance().getDocumentController().createPreviewDocument(screenDescription);
                break;
            case "domainConcept":
                console.log("domain concept dbl-clicked");
                break;
            case "connector":
                console.log("connector dbl-clicked");
                this.getResourceInstance(clickedElement.id).showPropertiesDialog();
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
            elementClass = elementClass.without("unknown").without("satisfeable").without("unsatisfeable").without("selected").without("view");
            return ((elementClass.size() >= 1) ? elementClass[0] : 'unknown');
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

        /* Properties pane*/
        var propertiesPane = this._createPropertiesPane();

        /* Pre/Post pane*/
        var prePostPane = this._createPrePostPane();

        /* Facts pane*/
        var factsPane = this._createFactsPane();

        var inspectorArea = this._createInspectorArea();
        inspectorArea.addChild(propertiesPane);
        inspectorArea.addChild(prePostPane);
        inspectorArea.addChild(factsPane);

        rightBorderContainer.addChild(documentPane);
        rightBorderContainer.addChild(inspectorArea);
        mainBorderContainer.addChild(this.getPaletteController().getNode());
        mainBorderContainer.addChild(rightBorderContainer);

        this._tab.setContent(mainBorderContainer.domNode);
    },
    
    _createInspectorArea: function(){
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var inspectorAreaId = uidGenerator.generate("inspectorArea");
        var inspectorArea = new dijit.layout.SplitContainer({
            id:inspectorAreaId,
            region:"bottom",
            orientation:"horizontal",
            activeSizing:"false",
            style:"height: 180px;",
            persist:"false",
            splitter:true
            });
        return inspectorArea;
    },
    
    _createPropertiesPane: function(){
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var propertiesPaneId = uidGenerator.generate("propertiesPane");
        var propertiesPane = new dijit.layout.ContentPane({
            id:propertiesPaneId,
            minSize:"100px",
            sizeShare:"10"
        });
        this._detailsTitle = new Array();
        this._detailsTitle['detailsTitle'] = uidGenerator.generate("detailsTitle");
        this._detailsTitle['title'] = uidGenerator.generate("details")+".title";
        this._detailsTitle['id'] = uidGenerator.generate("details")+".id";
        this._detailsTitle['desc'] = uidGenerator.generate("details")+".desc";
        this._detailsTitle['tags'] = uidGenerator.generate("details")+".tags";

        var detailsTitle = new Element('div', {
            'id': this._detailsTitle['detailsTitle'],
            'class': 'dijitAccordionTitle properties'
        }).update('Properties');
        
        var propertiesDiv = new Element('div', {
            'id': uidGenerator.generate("properties")
        });
        
        this._detailsTable = new Element('table', {
            'class': 'inspector_table'
        });
        var tr = new Element('tr', {
            'class': 'tableHeader'
        });
        var td_p = new Element('td', {
            'class': 'left'
        }).update('Property');
        var td_v = new Element('td', {
            'class': 'left'
        }).update('Value');
        tr.insert(td_p);
        tr.insert(td_v);
        this._detailsTable.insert(tr);
        propertiesDiv.insert(this._detailsTable);
        
        propertiesPane.domNode.insert(detailsTitle);
        propertiesPane.domNode.insert(propertiesDiv);
        return propertiesPane;
    },

    _updatePropertiesTable: function( /** Hash */ propertiesHash) {
        var detTable = this._detailsTable;
        propertiesHash.each(function(pair) {
            var tr = new Element('tr');
            var td_p = new Element('td', {
                'class': 'left'
            }).update(pair.key);
            var td_v = new Element('td', {
                'class': 'right'
            }).update(pair.value);
            tr.insert(td_p);
            tr.insert(td_v);
            detTable.insert(tr);
        });
    },

    _createPrePostPane: function() {
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var prePostPaneId = uidGenerator.generate("prePostPane");
        var prePostPane = new dijit.layout.ContentPane({
            id:prePostPaneId,
            minSize:"100px",
            sizeShare:"10"
        });
        content = "<div class='dijitAccordionTitle properties'>PRE / POST</div>";
        content += "<table id='"+uidGenerator.generate("prepostContainer")+"' class='inspector_table'>";
        content += '<tr class="tableHeader"><td class="inspectorIcon bold">&nbsp;</td>';
        content += '<td class="inspectorName bold">PRE Name</td>';
        content += '<td class="inspectorDesc bold">Description</td>';
        content += '<td class="inspectorSem bold">Semantics</td></tr>';
        content += '<tr class="tableHeader"><td class="inspectorIcon bold">&nbsp;</td>';
        content += '<td class="inspectorName bold">POST Name</td>';
        content += '<td class="inspectorDesc bold">Description</td>';
        content += '<td class="inspectorSem bold">Semantics</td></tr>';
        content += "</table>";
        prePostPane.setContent(content);
        return prePostPane;
    },

    _createFactsPane: function() {
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var factsPaneId = uidGenerator.generate("factsPane");
        var factsPane = new dijit.layout.ContentPane({
            id:factsPaneId,
            minSize:"100px",
            sizeShare:"10"
        });
        content = "<div class='dijitAccordionTitle properties'>Fact Inspector</div>";
        content += "<div id='"+uidGenerator.generate("inspector")+"'>";
        content += "<table class='inspector_table'>";
        content += "<tr class='tableHeader'><td class='inspectorIcon bold'>&nbsp;</td><td class='inspectorName bold'>Name</td><td class='inspectorDesc bold'>Description</td><td class='inspectorSem bold'>Semantics</td></tr>";
        content += "<tbody id='"+uidGenerator.generate("inspectorContainer")+"' style='overflow:auto'>";
        content += "</tbody>";
        content += "</table>";
        content += "</div>";
        factsPane.setContent(content);
        return factsPane;
    }
});

// vim:ts=4:sw=4:et:
