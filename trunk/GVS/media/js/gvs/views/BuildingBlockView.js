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
     * Sets the title if possible
     */
    setTitle: function(title) {
        // Do nothing
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

    /**
     * Adds a new div layer on top of the view, covering it, in order
     * to handle onclick and onmousedown events, when
     * the view includes some terminals, as they consume
     * these events by default
     */
    addGhost: function() {
        var ghost = new Element('div', {
            'class': 'ghost ghostLayer'
        });
        this._node.appendChild(ghost);
    },

    // **************** PRIVATE METHODS **************** //

    _setViewReachability: function(/** Object */ reachability,
                            /** Hash */ preHash, /** Array */ postList,
                            /** DOMNode */ node) {

        var satisfeable = reachability.reachability;
        Utils.setSatisfeabilityClass(node, satisfeable);

        postList.each(function(post) {
            Utils.setSatisfeabilityClass(post.getNode(), satisfeable);
        });

        reachability.actions.each(function(action) {
            action.preconditions.each(function(pre) {
                var preNode = preHash.get(pre.id).getNode();
                Utils.setSatisfeabilityClass(preNode, pre.satisfied);
            }.bind(this));
        }.bind(this));
    }
});

// vim:ts=4:sw=4:et:
