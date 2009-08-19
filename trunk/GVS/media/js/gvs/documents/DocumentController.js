var DocumentController = Class.create(
    /** @lends DocumentController.prototype */ {

    /**
     * Container that manages the set of open documents.
     * @constructs
     */
    initialize: function() {
        /**
         * List of open documents
         * @type Hash
         * @private
         */
        this._documents = {};

        /**
         * Currently selected document
         * @type AbstractDocument
         * @private
         */
        this._currentDocument = null;
        
        /**
         * Dialog to create a new document
         * @type FastDialog
         * @private
         */
        this._newSFDocDialog = null;
            
        // The welcome document is the initial document
        var welcome = new WelcomeDocument();

        // FIXME: Work around for updating the Fact Factory
        FactFactorySingleton.getInstance().updateFacts();
        
        //Arming onFocus callback
        var mine = this;
        dojo.connect(dijit.byId("documentContainer"), "selectChild", function(tab){
            DocumentController.prototype._selectDocument.apply(mine, arguments);
        });
        /*//Arming onClose callback
        dojo.connect(dijit.byId("documentContainer"), "closeChild", function(tab){
            DocumentController.prototype._closeDocument.apply(mine, arguments);
        });*/
        
        // FIXME: Work around for tab rendering bug when there is only one tab.
        this.addDocument(welcome);
        dijit.byId("documentContainer").layout();
    },

    // **************** PUBLIC METHODS **************** //
    
    /**
     * Shows a dialog to create a new screenflow document
     */
    showNewSFDocDialog: function(){
        if (this._newSFDocDialog == null) {
            this._newSFDocDialog = new FormDialog({
                "title": "New Screenflow",
                "style": "display:none;"
            });
            var dialogDiv = new Element("div");
            var h2 = new Element("h2").update("Fulfill Screenflow Information");
            dialogDiv.appendChild(h2);
            
            var divSFInfo = new Element("div", {
                "class": "line"
            }).update("Please fulfill the required information in order to" +
            " create a new screenflow.");
            dialogDiv.insert(divSFInfo);

            var form = new Element("form");

            var divSFName = new Element("div", {
                "class": "line"
            });
            var labelSFName = new Element("label").update("Screenflow Name:");
            divSFName.insert(labelSFName);
            var inputSFName = new Element("input", {
                type: "text",
                name: 'SFName',
                value: "New Screenflow",
                "class": "input_SFDialog"
            });
            divSFName.insert(inputSFName);
            form.insert(divSFName);
            
            var divSFDomainContext = new Element("div", {
                "class": "line"
            });
            var labelSFDomainContext = new Element("label").update("Domain Context:");
            divSFDomainContext.insert(labelSFDomainContext);
            var inputSFDomainContext = new Element("input", {
                type: "text",
                name: "SFDomainContext",
                value: "",
                "class": "input_SFDialog"
            });
            divSFDomainContext.insert(inputSFDomainContext);
            form.insert(divSFDomainContext);
            
            dialogDiv.insert(form);
            
            var divSFButtons = new Element("div");
            var mine = this;
            var acceptSFButton = new dijit.form.Button({
                "label": "Accept",
                onClick: function(){
                    var name = $F(mine._newSFDocDialog.getForm().SFName);
                    if (name && name != "") {
                        var domainContext = $F(mine._newSFDocDialog.getForm().SFDomainContext);
                        DocumentController.prototype.createSFDocument.apply(mine, [name, domainContext]);
                        DocumentController.prototype.hideNewSFDocDialog.apply(mine, arguments);
                    }
                    else {
                        alert("A Screenflow name must be provided");
                    }
                }
            });
            divSFButtons.insert(acceptSFButton.domNode);
            var cancelSFButton = new dijit.form.Button({
                label: "Cancel",
                onClick: function(){
                    DocumentController.prototype.hideNewSFDocDialog.apply(mine, arguments);
                }
            });
            divSFButtons.appendChild(cancelSFButton.domNode);
            dialogDiv.insert(divSFButtons);
            this._newSFDocDialog.getDialog().setContent(dialogDiv);
        } else {
            this._newSFDocDialog.getForm().SFName.setValue("New Screenflow");
            this._newSFDocDialog.getForm().SFDomainContext.setValue("");
        }
        this._newSFDocDialog.show();
    },

    /**
     * Hides the dialog to create a new screenflow document
     */
    hideNewSFDocDialog: function(){
        this._newSFDocDialog.hide();
    },
    
    /**
     * Creates a new screenflow document
     */
    createSFDocument: function(name, domainContext){
        var screenflow = new ScreenflowDocument(name);
        if(name && name != "") {
            screenflow.getBuildingBlockDescription().setDomainContexts(domainContext);
        }
        this.addDocument(screenflow);
        screenflow.getPaletteController().updatePalettes();
        return screenflow;
    },

    /**
     * Creates a new deployment document
     */
    createDeploymentDocument: function(deploymentContent){
        var deployment = new DeploymentDocument();
        this.addDocument(deployment);
        deployment.populate(deploymentContent);
    },
    
    /**
     * Creates a preview document
     */
    createPreviewDocument: function(buildingBlockDesc){
        var preview = new PreviewDocument(buildingBlockDesc.label['en-gb']);
        this.addDocument(preview);
        preview.populate(buildingBlockDesc);
    },

    /**
     * Adds a new document.
     */
    addDocument: function(document){
        this._documents[document.getTabId()] = document;
        dijit.byId("documentContainer").addChild(document.getTab());
        dijit.byId("documentContainer").selectChild(document.getTabId());
        $$(".tabLabel").each(function(canvas){canvas.observe("focus",function(e){
           var element = Event.element(e);
           element.blur();
        })});
    },

    /**
     * Gets a document.
     * @param docId: document Id
     * @type AbstractDocument
     */
    getDocument: function(docId) {
        return this._documents[docId];
    },

    /**
     * Gets the currently focused document.
     * @type AbstractDocument
     */
    getCurrentDocument: function(){
        return this._currentDocument;
    },

    /**
     * Shows the deployment dialog of the currently focused document.
     */
    showDeployCurrentDocDialog: function(){
        switch(this._currentDocument.getDocumentType()) {
            case Constants.DocumentType.WELCOME:
                break;
            case Constants.DocumentType.SCREENFLOW:
                this.getCurrentDocument().showDeployGadgetDialog();
                break;
            // TODO: there can be something similar for other documents...?
            default:
                break;
        }
    },
    /**
     * this function closes a document by its Id
     * @param String id
     */
    closeDocument: function (id){
        delete this._documents[id];
        if ($H(this._documents).keys().length == 0){
            //Show the welcome Document
            var welcome = new WelcomeDocument();
            this.addDocument(welcome);

            // FIXME: Work around for tab rendering bug when there is
            //        only one tab.
            dijit.byId("documentContainer").layout();
        }
    },

    // **************** PRIVATE METHODS **************** //
    

    /**
     * Select Document event handler.
     * @private
     */
    _selectDocument: function( /** {String|DOMNode} */ tab) {
        var id;

        if (tab.id) {  // it is tab widget
            id = tab.id;
        } else { //it is a string id
            id = tab;
        }
        this._currentDocument = this._documents[id];
        //Update the set of buttons
        this._currentDocument.updateToolbar();
    }
});

// vim:ts=4:sw=4:et:
