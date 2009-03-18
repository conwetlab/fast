var ComponentInstance = Class.create(DragSource,
    /** @lends ComponentInstance.prototype */ {
    
    /**
     * This class is an instance of a palette component
     * in the Document area
     * @constructs
     * @extends DragSource
     */ 
    initialize: function($super, /**ResourceDescription*/ resourceDescription) {
        $super();
        
        /**
         * Handles the drag'n'drop stuff
         * @type DragHandler
         * @private
         */
        //TODO: FIX THIS!!!
        this._dragHandler = new DragHandler(this, "tabContent_2");
        
        /**
         * Resource description graphical representation
         * @type ResourceView
         * @private
         */ 
        this._view = resourceDescription.createView();
        
        /** 
         * Resource description this class is instance of
         * @type ResourceDescription
         * @private @member
         */
        this._resourceDescription = resourceDescription;
    },
    

    // **************** PUBLIC METHODS **************** //
    /**
     * Returns the node that can be clicked to start a drag-n-drop operation.
     * @type DOMNode
     * @override
     */
    getHandlerNode: function() {
        return this._view.getNode();
    },
    
    /**
     * Returns the node that is going to be moved in drag-n-drop operation.
     * @type DOMNode
     * @override
     */
    getDraggableObject: function() {
        return this;
    },
    
        /**
     * Returns the root node
     * @type DOMNode
     * @public
     */
    getView: function() {
        return this._view;
    },

    /**
     * Returns the root node
     * @type DOMNode
     * @public
     */
    getNode: function() {
        return this._view.getNode();
    },

    /**
     * Returns the resourcedescription
     * @public
     */
    getResourceDescription: function() {
        return this._resourceDescription;
    },
    
    /**
     * Destroys the view
     * @public
     */
    destroy: function() {
        this._view.destroy();
        this._view = null;
    },
    
    /**
     * Drop event handler for the DragSource
     * @override
     * @abstract
     */
    // FIXME: is this method useful?
    onFinish: function() {
        throw "Abstract Method invocation: ComponentInstance::onFinish"
    }

    // **************** PRIVATE METHODS **************** //

    
});

// vim:ts=4:sw=4:et:

