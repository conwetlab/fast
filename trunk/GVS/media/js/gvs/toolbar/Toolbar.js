var Toolbar = Class.create( /** @lends Toolbar.prototype */ {
    /**
     * The toolbar itself
     * 
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
    },
    
    /**
     * Sets the model for the toolbar section on the given position.
     * ToolbarModel must provide objects implementing the following interface:
     * 
     *   interface ToolbarElement
     *      Widget getWidget()  // dojo widget
     */
    setModel: function(/** Number */position, /** ToolbarModel */ model) {
        this._removeModel(position);
        
        if (model) {
            var toolbarElements = model.getToolbarElements();
            
            if (toolbarElements.size() > 0) {
                this._models[position] = model;
                
                this._initSection(position);
                
                toolbarElements.each(function (element) {
                    this._sections[position].push(element.getWidget());
                }.bind(this));
            }
        }
        
        this._refreshToolbar();
    },
    
    // ************************ PRIVATE METHODS ************************* //
    
    _removeModel: function(/** Number */ position) {
        if (this._models[position]) {
            this._models[position] = null;
            this._sections[position].clear();
        }
    },
    
    _initSection: function(/** Number */ position) {
        if (!this._sections[position]) {
            this._sections[position] = new Array();
        }
        if (position != 0 && !this._sections[position][0]) {
            this._sections[position][0] = new dijit.ToolbarSeparator();
        }
    },
    
    _refreshToolbar: function() {
        this._toolbar.getDescendants().each(function(descendant) {
            this._toolbar.removeChild(descendant);
        }.bind(this));
        
        this._sections.each(function (section) {
            section.each(function (element) {
                this._toolbar.addChild(element);
            }.bind(this));
        }.bind(this));
    }
    
});

// vim:ts=4:sw=4:et:
