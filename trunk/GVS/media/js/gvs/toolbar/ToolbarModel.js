var ToolbarModel = Class.create( /** @lends ToolbarModel.prototype */ {
    /**
     * Provides toolbar elements for a toolbar section.
     * @abstract
     * @constructs
     */ 
    initialize: function() {
        
        /**
         * All the toolbar elements
         * @type Hash
         * @private @member
         */
        this._toolbarElements = new Hash();
        
        /** 
         * Order of the elements in the toolbar interface
         * @type Array
         * @private @member
         */
        this._toolbarElementOrder = new Array();
        
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * 
     * @type Array   Array of ToolbarElement
     */
    getToolbarElements: function() {
        var elements = new Array();
        this._toolbarElementOrder.each(function(name) {
            elements.push(this._toolbarElements.get(name));    
        }.bind(this));
        return elements;
    },   

    // **************** PRIVATE METHODS **************** //


    /** 
     * Adds a new element to the list
     * @private
     */
    _addToolbarElement: function(/** String */ elementName, /** ToolbarElement */ element) {
        this._toolbarElementOrder.push(elementName);
        this._toolbarElements.set(elementName, element);
    }
});

// vim:ts=4:sw=4:et:
