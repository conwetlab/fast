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
        
        // The welcome document is the initial document
        var welcome = new WelcomeDocument();

        // FIXME: Work around for tab rendering bug when there is only one tab.
        this.addDocument(welcome);
        dijit.byId("documentContainer").layout();

        //Arming onFocus callback
        var mine = this;
        dojo.connect(dijit.byId("documentContainer"), "selectChild", function(tab){
            DocumentController.prototype._selectDocument.apply(mine, arguments);
        });
        //Arming onClose callback
        dojo.connect(dijit.byId("documentContainer"), "closeChild", function(tab){
            DocumentController.prototype._closeDocument.apply(mine, arguments);
        });
    },
        
        
    // **************** PUBLIC METHODS **************** //
        
        
    /**
     * Adds a new document.
     */
    addDocument: function(document){
        this._documents[document.getTabId()] = document;
        dijit.byId("documentContainer").addChild(document.getTab());
        dijit.byId("documentContainer").selectChild(document.getTabId());
        
    },


    /**
     * Gets the currently focused document.
     * @type AbstractDocument
     */
    getCurrentDocument: function(){
        return this._currentDocument;
    },
    
    /**
     * Deploy the currently focused document.
     */
    deployCurrentDocument: function(){
        switch(this._currentDocument.getDocumentType()) {
            case 'welcome':
                break;
            case 'screenflow':
                this.getCurrentDocument().deployGadget();
                break;
            // TODO: there can be something similar for other documents...?
            default:
                break;
        }
    },

    // **************** PRIVATE METHODS **************** //

        
    /**
     * Close document event handler.
     * @private
     */
    _closeDocument: function(/** {String|DOMNode} */ tab) {
        var id;

        if (tab.id) { // it is tab widget
            id = tab.id;
        } else { //it is a string id
            id = tab;
        }

        delete this._documents[id];

        if (dijit.byId("documentContainer").getChildren().length === 0){
            //Show the welcome Document
            var welcome = new WelcomeDocument();
            this.addDocument(welcome);

            // FIXME: Work around for tab rendering bug when there is
            //        only one tab.
            dijit.byId("documentContainer").layout();
        }
    },
    

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

        var controller = GVSSingleton.getInstance().getPaletteController();
        controller.showValidPalettes(this._currentDocument.getValidResources());
    }
    
});

// vim:ts=4:sw=4:et:
