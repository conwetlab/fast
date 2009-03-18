var FactIcon = Class.create( /** @lends FactIcon.prototype */ {

    /**
     * Graphical representation of a fact.
     * @constructs
     * @param Fact fact   
     * @param String size  Icon size ("small"|"medium"|"big")
     */
    initialize: function(fact, size) {
        /**
         * Fact
         * @type Fact
         * @private
         */
        this._fact = fact;

        // TODO: assert size in {small, medium, big}
        /**
         * Icon size
         * @type String
         * @private
         */
        this._size = size;

        var uidGenerator = UIDGeneratorSingleton.getInstance();

        /**
         * Fact icon unique identifier
         * @type String
         * @private
         */
        this._id = uidGenerator.generate("facticon");

        /**
         * Fact icon root node 
         * @type DOMNode
         * @private
         */
        this._node = new Element ("div", {
                "id": this._id,
                "class": this._size + "_fact unknown fact"}
            ).update(this._fact.getShortcut());
    },

    
    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the root node.
     * @type DOMNode
     * @public
     */
    getNode: function () {
        return this._node;
    },
    
    
    /**
     * Gets the fact icon unique identifier.
     * @type String
     * @public
     */
    getId: function() {
        return this._id;
    }


    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
