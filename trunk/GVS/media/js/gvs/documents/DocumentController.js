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
        
        /**
         * Welcome Document, if any
         * @type WelcomeDocument
         * @private 
         */
        this._welcomeDocument = null;
        
        /**
         * The keypress registry
         * @type KeyPressRegistry
         * @private
         */
        this._registry = new KeyPressRegistry();
        
        /**
         * Toolbar handler object
         * @type Toolbar
         * @private @member
         */
        this._toolbar = new Toolbar();
        
        /**
         * Menu handler
         * @type Menu
         * @private
         */
        this._menu = new Menu(this._registry);
        
        /**
         * The document container element
         * @type diji.layout.TabContainer
         */
        this._documentContainer = dijit.byId("documentContainer");
        
        // Arming onFocus callback
        dojo.connect(this._documentContainer, "selectChild", function(tab){
            DocumentController.prototype._selectDocument.apply(this, arguments);
        }.bind(this));
        
        // The welcome document is the initial document
        this.showWelcomeDocument();
        
        this._registry.addHandler('delete', this._onKeyPressed.bind(this)); 
        this._registry.addHandler('space' , this._onKeyPressed.bind(this));
    },

    // **************** PUBLIC METHODS **************** //
    
    
    /**
     * Creates a new screenflow document
     */
    createScreenflow: function(/** String */ name, /** String */ tags,
                               /** String */ version){
        var screenflow = new ScreenflowDocument({
            'name': name,
            'tags': tags,
            'version': version
        });
        this.addDocument(screenflow);
    },

    /**
     * Opens an existing screenflow by its id
     */
    loadScreenflow: function(/** String */ id) {

        var uri = URIs.buildingblock + id;
        PersistenceEngine.sendGet(uri, {'mine':this}, this._onScreenflowLoadSuccess,
                                        this._onLoadError);
    },

    /**
     * Opens an existing screenflow by its id
     */
    cloneScreenflow: function(/** String */ id) {

        var uri = URIs.buildingblock + id;
        PersistenceEngine.sendGet(uri, {'mine':this, 'cloned': true},
                                        this._onScreenflowLoadSuccess,
                                        this._onLoadError);
    },


    /**
     * Creates a new screen document
     */
    createScreen: function(/** String */ name, /** Array */ tags,
                            /** String */ version){
        var screen = new ScreenDocument({
                'name': name,
                'tags': tags,
                'version': version
            });
        this.addDocument(screen);
    },

    /**
     * Opens an existing screen by its id
     */
    loadScreen: function(/** String */ id) {
        
        var uri = URIs.buildingblock + id;
        PersistenceEngine.sendGet(uri, {'mine':this}, this._onScreenLoadSuccess,
                                    this._onLoadError);
    },

    /**
     * Clones an existing screen
     */
    cloneScreen: function(/** String */ id) {
        var uri = URIs.buildingblock + id;
        PersistenceEngine.sendGet(uri, {'mine':this, 'cloned': true},
                                    this._onScreenLoadSuccess,
                                    this._onLoadError);
    },

    /**
     * Opens a wrapper service session
     */
    openWrapperService: function() {
        var wrapper = new ExternalDocument("Wrapper Service", URIs.wrapperService);
        this.addDocument(wrapper);
    },
    
    /**
     * Shows the welcome document
     */
    showWelcomeDocument: function() {
        if (this._welcomeDocument) {
            this._documentContainer.selectChild(this._welcomeDocument.getTabId());
            this._selectDocument(this._welcomeDocument.getTabId());
        } else {
            this._welcomeDocument = new WelcomeDocument();
            this.addDocument(this._welcomeDocument);  
        }  
    },

    /**
     * Adds a new document.
     */
    addDocument: function(doc){
        this._documents.set(doc.getTabId(), doc);
        this._documentContainer.addChild(doc.getTab());
        
        if (this._documents.keys().size() > 1) {
            this._documentContainer.selectChild(doc.getTabId());
        }
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
     * this function closes a document by its Id
     * @param id String
     */
    closeDocument: function(id) {

        // Go to the previous tab and not to the
        // initial tab
        this._documentContainer.back();
        
        // Remove the reference to the welcome document, if
        // the document being closed is it
        if (this._welcomeDocument && this._welcomeDocument.getTabId() == id) {
            this._welcomeDocument = null;
        }
        
        // Remove the tab
        this._documentContainer.removeChild(dijit.byId(id));
        dijit.byId(id).destroyRecursive(true);
         
        this._documents.unset(id);
        
        
        if ($H(this._documents).keys().length == 0){
             //Show the welcome Document
             this.showWelcomeDocument();
        }
    },
    
    /**
     * Returns the toolbar object
     * @type Toolbar
     */
    getToolbar: function() {
        return this._toolbar;
    },
    
    
    /**
     * Returns the menu object
     * @type Menu
     */
    getMenu: function() {
        return this._menu;
    },
    /**
     * 
     * @type KeyPressRegistry
     */
    getKeyPressRegistry: function() {
        return this._registry;    
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
        if (this._currentDocument) {
            this._currentDocument.hide();
        }
        this._currentDocument = this._documents.get(id);
        this._currentDocument.show();
        
        this._toolbar.setModel(1, this._currentDocument);
        this._menu.setModel('document', this._currentDocument);
        // FIXME: Workaround for removing focus from the tab node
        $("logout").focus();
        $("logout").blur();
    },
    
    
    /**
     * OnKeyPressed listener
     * @private
     */
    _onKeyPressed: function(/** String */ key) {
        this._currentDocument.onKeyPressed(key);
    },

    /**
     * On screenflow load success
     * @private
     */
    _onScreenflowLoadSuccess: function (/** XMLHttpRequest */ transport) {
        var screenflowData = JSON.parse(transport.responseText);
        screenflowData.cloned = this.cloned;
        screenflowData.uri = null;
        var screenflow = new ScreenflowDocument(screenflowData);
        this.mine.addDocument(screenflow);
        screenflow.loadInstances();
    },

    /**
     * On screen load success
     * @private
     */
    _onScreenLoadSuccess: function (/** XMLHttpRequest */ transport) {
        var screenData = JSON.parse(transport.responseText);
        screenData.cloned = this.cloned;
        screenData.uri = null;
        var screen = new ScreenDocument(screenData);
        this.mine.addDocument(screen);
        screen.loadInstances();
    },

    _onLoadError: function() {
        Utils.showMessage("Can not open the selected element", {
            'error': true,
            'hide': true
        });
    }
});

// vim:ts=4:sw=4:et:
