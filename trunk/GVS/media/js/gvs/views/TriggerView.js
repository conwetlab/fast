var TriggerView = Class.create( /**DragSource **/
    /** @lends TriggerView.prototype */ {

    /**
     * Triggers graphical representation
     * @constructs
     */ 
    initialize: function(/** String */ description) {

        /**
         * @type DOMNode
         * @private
         */
        this._node = null;
        
        /**
         * TODO
         * @type DragHandler
         * @private
         */
        this._dragHandler = null;
        
        this._node = new Element("div", {
            "class": "trigger"
        }).update(description);
        
    },
    
    // **************** PUBLIC METHODS **************** //
    
    getNode: function() {
        return this._node;    
    },
    
    destroy: function () {
        // Let the garbage collector to do its job
        this._node = null;
    }
    
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
