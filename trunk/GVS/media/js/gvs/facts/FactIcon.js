var FactIcon = Class.create( /** @lends FactIcon.prototype */ {

    /**
     * Graphical representation of a fact.
     * @constructs
     * @param Fact fact   
     * @param String size  Icon size ("inline"|"embedded"|"standalone")
     */
    initialize: function(fact, size) {
        /**
         * Fact
         * @type Fact
         * @private
         */
        this._fact = fact;

        /**
         * Icon size
         * @type String
         * @private
         */
        this._size = size;

        /**
         * Fact icon root node 
         * @type DOMNode
         * @private
         */
        this._node = new Element ("div", {
                "class": this._size + "_fact fact",
                'title': this._fact.getDescription()}
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
     * Gets the fact object
     * @type Fact
     * @public
     */
    getFact: function () {
        return this._fact;
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
