var AbstractDocument = Class.create( /** @lends AbstractDocument.prototype */ {
    /**
     * Represents a document and its tab. Subclasses must provide the 
     * inner content.
     * @abstract
     * @constructs
     */ 
    initialize: function(/** String */ title) {
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        
        /**
         * Tab title
         * @type String
         * @private
         */
        this._title = title;
        
        /**
         * Actual Tab Id
         * @type String
         * @private
         */
        this._tabId = uidGenerator.generate("tab");
       
        
        /**
         * Initial tab content (empty by default)
         * @type DOMNode
         * @private
         */
        this._tabContent = new Element("div", {
            "class": "document"
        });        
        
        /**
         * Actual tab
         * @type DOMNode
         * @private
         */
        this._tab = new dijit.layout.ContentPane({
            title: this._title,
            id: this._tabId,
            closable: true,
            onClose: this._closeDocument.bind(this)
        }, null);
        
        
        this._tab.setContent(this._tabContent);
    },
    

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets the tab id.
     * @type String
     */
    getTabId: function() {
        return this._tabId;
    },
    
    
    /**
     * Gets the tab node.
     * @type DOMNode
     */
    getTab: function() {
        return this._tab;
    },
    
    
    /**
     * Gets the title.
     * @type String
     */
    getTitle: function() {
        return this._title;
    },

    /**
     * Gets the content node.
     * @type DOMNode
     */
    getNode: function() {
        return this._tabContent;
    },
    
    /**
     * Method called on keypress. Might be overloaded
     */
    onKeyPressed: function(/** Event */ e) {
        // Do nothing
    },

    /**
     * FIXME: this is responsibility of document controller
     * Select this tab.
     */
    select: function() {
        dijit.byId("documentContainer").selectChild(this._tabId);
    },
    
    // **************** PRIVATE METHODS **************** //
    
    /**
     * Updates the set of buttons to be shown, depending on the
     * document type
     * @abstract
     * @private
     */
    _updateToolbar: function () {
        throw "Abstract Method invocation: AbstractDocument::updateToolbar";
    },

    /**
     * Close document event handler.
     * @private
     */
    _closeDocument: function() {
        var gvs = GVSSingleton.getInstance();
        gvs.getDocumentController().closeDocument(this._tabId);
        return true;
    }
});

// vim:ts=4:sw=4:et:
