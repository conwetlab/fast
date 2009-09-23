var Toolbar = Class.create( /** @lends Toolbar.prototype */ {
    /**
     * The toolbar itself
     * @constructs
     */ 
    initialize: function() {
        /** 
         * @type dijit.dialog.Toolbar
         * @private @member
         */
        this._toolbar = dijit.byId("toolbar");
        
        /**
         * List of toolbar models
         * @type Array
         * @private @member
         */
        this._models = new Array();
        
        /**
         * List of section elements.
         * Each section have another array with the Widget of the buttons plus a 
         * separator on the first position (index 0).
         * 
         * @type Array
         * @private @member
         */
        this._sections = new Array();
        this._sections[0] = new Array();
        this._sections[0][0] = dijit.byId("firstSeparator").domNode;
    },
    
    setModel: function(/** Number */position, /** ToolbarModel */ model) {
        this._removeModel(position);
        
        if (model) {
            this._models[position] = model;
            
            this._initSection(position);
            
            model.getToolbarElements().each(function (element) {
                this._sections[position].push(element.getWidget());
            });            
        }
        
        this._refreshToolbar();
    },
    
    // ************************ PRIVATE METHODS ************************* //
    
    _removeModel: function(/** Number */ position) {
        this._models[position] = null;
        this._sections[position].clear();
    },
    
    _initSection: function(/** Number */ position) {
        if (!this._sections[position]) {
            this._sections[position] = new Array();
        }
        if (!this._sections[position][0]) {
            this._sections[position][0] = new dijit.ToolbarSeparator();
        }
    },
    
    _refreshToolbar: function() {
        this._toolbar.destroyDescendants(true);
        
        this._sections.each(function (section) {
            section.each(function (element) {
                this._toolbar.addChild(element);
            }.bind(this));
        }.bind(this));
    }
    
});

// vim:ts=4:sw=4:et:
