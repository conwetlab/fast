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
        this._dragHandler = new DragHandler(this, GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getContentId());

        /**
         * DOM node identifier
         * @type String
         * @private
         */
        this._id = null;

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
        
        /**
         * Building block type this class represents
         * @type String
         * @private
         */
        this._buildingBlockType = 'unknown';
    },
    

    // **************** PUBLIC METHODS **************** //
    /**
     * Returns the handler that manages the drag-n-drop operation.
     * @type DOMNode
     * @override
     */
    getDragHandler: function() {
        return this._dragHandler;
    },

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
     * getId
     * @type String
     */
    getId: function () {
        return this._id;
    },

    /**
     * Gets the component position
     * @type Object
     * @public
     */
    getPosition: function() {
        var left = parseInt(this.getHandlerNode().offsetLeft)-parseInt(this.getHandlerNode().getStyle("margin-left"));
        var top = parseInt(this.getHandlerNode().offsetTop)-parseInt(this.getHandlerNode().getStyle("margin-top"));
        var position = {
            "left": left,
            "top": top
        };
        return position;
    },

    /**
     * Sets the component position
     * @params Object
     * @public
     */
    setPosition: function( /**Object*/ position) {
        this.getHandlerNode().style.left = position.left + "px";
        this.getHandlerNode().style.top = position.top + "px";
    },

    /**
     * Returns the resourcedescription
     * @public
     */
    getResourceDescription: function() {
        return this._resourceDescription;
    },

    /**
     * Returns the building block type of this class
     * @public
     */
    getBuildingBlockType: function() {
        return this._buildingBlockType;
    },
    
    /**
     * Destroys the view
     * @public
     */
    destroy: function() {
        this._view.destroy();
        this._view = null;
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:

