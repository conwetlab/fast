var BuildingBlockView = Class.create( /** @lends BuildingBlockView.prototype */ {
    /**
     * This interface is met by all the building block graphical representations.
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
     * Colorize the component depending on the reachability
     * @public
     */
    colorize: function( /** Boolean */ satisfeable) {
        throw 'Abstract Method invocation. ' + 
            'BuildingBlockView :: colorize';
    },

    /**
     * Removes the DOM Elements and frees building blocks
     */
    destroy: function () {
    },
    
    /**
     * Adds a listener
     */
    addListener: function (/** Function */ handler, /** String */ event){
        Element.observe(this._node, event, handler);
    }
});

// vim:ts=4:sw=4:et:
