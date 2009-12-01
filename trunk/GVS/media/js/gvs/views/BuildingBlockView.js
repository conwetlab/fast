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
     * Colorize the component depending on the reachability
     * @public
     */
    setReachability: function( /** Hash */ reachabilityData) {
        throw 'Abstract Method invocation. ' + 
            'BuildingBlockView :: setReachability';
    },
    
    setSelected: function(/** Boolean */ selected) {
        if (selected) {
            this._node.addClassName('selected');
        } else {
            this._node.removeClassName('selected');
        }    
    },

    /**
     * Removes the DOM Elements and frees building blocks
     */
    destroy: function () {
    },
    
    /**
     * Adds an event listener
     */
    addEventListener: function (/** Function */ handler, /** String */ event){
        Element.observe(this._node, event, handler);
    },
    
    addGhost: function() {
        var ghost = new Element('div', {
            'class': 'ghost ghostLayer'
        });
        this._node.appendChild(ghost);
    }
});

// vim:ts=4:sw=4:et:
