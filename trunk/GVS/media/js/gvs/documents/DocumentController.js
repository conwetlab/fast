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
        var screenflow = new ScreenflowDocument(name, tags, version);
        this.addDocument(screenflow);
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
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        var uri = URIs.buildingblock + id;
        persistenceEngine.sendGet(uri, this, this._onScreenLoadSuccess, this._onLoadError);
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
    addDocument: function(document){
        this._documents.set(document.getTabId(), document);
        this._documentContainer.addChild(document.getTab());

        $$(".tabLabel").each(function(canvas) {
            canvas.observe("focus",function(e) {
                var element = Event.element(e);
                element.blur();
            })
        });
        
        if (this._documents.keys().size() > 1) {
            this._documentContainer.selectChild(document.getTabId());    
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
    },
    
    
    /**
     * OnKeyPressed listener
     * @private
     */
    _onKeyPressed: function(/** String */ key) {
        this._currentDocument.onKeyPressed(key);
    },

    /**
     * On screen load success
     * @private
     */
    _onScreenLoadSuccess: function (/** XMLHttpRequest */ transport) {
        var screenData = JSON.parse(transport.responseText);
        var screen = new ScreenDocument(screenData);
        this.addDocument(screen);
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
