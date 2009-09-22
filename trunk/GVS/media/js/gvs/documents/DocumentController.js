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
        this._documents = new Hash();

        /**
         * Currently selected document
         * @type AbstractDocument
         * @private
         */
        this._currentDocument = null;
        
        // Arming onFocus callback
        dojo.connect(dijit.byId("documentContainer"), "selectChild", function(tab){
            DocumentController.prototype._selectDocument.apply(this, arguments);
        }.bind(this));
        
        // The welcome document is the initial document
        var welcome = new WelcomeDocument();
        this.addDocument(welcome);
        
        this.setEnabled(true);
    },

    // **************** PUBLIC METHODS **************** //

    setEnabled: function(/** Boolean */ enabled) {
        if (enabled) {
            document.observe('keypress', this._onKeyPressed.bind(this));
        } else {
            document.stopObserving('keypress', this._onKeyPressed.bind(this));
        }        
    },
    
    /**
     * Creates a new screenflow document
     */
    createScreenflow: function(name, domainContext){
        var screenflow = new ScreenflowDocument(name,domainContext);
        this.addDocument(screenflow);
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
        this._documents.set(document.getTabId(), document);
        dijit.byId("documentContainer").addChild(document.getTab());
        dijit.byId("documentContainer").selectChild(document.getTabId());
        $$(".tabLabel").each(function(canvas) {
            canvas.observe("focus",function(e) {
                var element = Event.element(e);
                element.blur();
            })
        });
    },

    /**
     * Gets a document.
     * @param docId: document Id
     * @type AbstractDocument
     */
    getDocument: function(docId) {
        return this._documents.get(docId);
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
        //FIXME: to be called from other place (Toolbar)
        this.getCurrentDocument()._deployGadget();
    },
    /**
     * this function closes a document by its Id
     * @param String id
     */
    closeDocument: function (id){

        //Go to the previous tab and not to the
        //initial tab
        dijit.byId("documentContainer").back();
        
        //Remove the tab
        dijit.byId("documentContainer").removeChild(dijit.byId(id));
        dijit.byId(id).destroyRecursive(true);
         
        this._documents.unset(id);
        
        if ($H(this._documents).keys().length == 0){
            //Show the welcome Document
            var welcome = new WelcomeDocument();
            this.addDocument(welcome);
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
        this._currentDocument = this._documents.get(id);
        //Update the set of buttons
        this._currentDocument.updateToolbar();
    },
    
    /**
     * Function that passes the key events to the current document
     */
    _onKeyPressed: function (/** Event */ e) {
        this._currentDocument.onKeyPressed(e);    
    }
});

// vim:ts=4:sw=4:et:
