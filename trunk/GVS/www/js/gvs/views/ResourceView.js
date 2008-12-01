var ResourceView = Class.create( /** @lends ResourceView.prototype */ {
    /**
     * This interface is met by all the resource graphical representations.
     * @abstract
     * @constructs
     */ 
    initialize: function() {
        /** 
         * DOM Node
         * @type DOMNode
         * @private @member
         */
        this._node = null;
        
        /**
         * DOM node identifier
         * @type String
         * @private
         */
        this._id = null;
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * getNode
     * @type DOMNode
     */
    getNode: function () {
        return this._node;
    },

    /**
     * getId
     * @type String
     */
    getId: function () {
        return this._id;
    },
    
    /**
     * Removes the DOM Elements and frees resources
     */
    destroy: function () {
    }    
});

// vim:ts=4:sw=4:et:
