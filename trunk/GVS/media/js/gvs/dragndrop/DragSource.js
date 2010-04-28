var DragSource = Class.create( /** @lends DragSource.prototype */ {
    /**
     * This is the interface for widgets that are sources of drag'n'drop
     * operations.
     * @abstract
     * @constructs
     */
    initialize: function() {

        /**
         * Handles the drag'n'drop stuff
         * @type DragHandler
         * @private
         */
        this._dragHandler = new DragHandler(this);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Returns the node of the area that can start a dragging operation.
     * @type Object
     * @abstract
     */
    getHandlerNode: function () {
        throw "Abstract Method invocation: DragSource::_getHandlerNode";
    },

    /**
     * Enables the drag'n'drop
     */
    enableDragNDrop: function(/** DropZone */ currentDropZone, /** Array */ validDropZones) {
        this._dragHandler.enableDragNDrop(currentDropZone, validDropZones);
    },


    /**
     * Returns the object to be dragged.
     * @type Object   Object implementing getNode() method
     * @abstract
     */
    getDraggableObject: function () {
        throw "Abstract Method invocation: DragSource::getDraggableObject";
    },


    /**
     * Drag'n'drop start event handler
     * @protected
     */
    onStart: function() {},


    /**
     * Update position event handler
     * @protected
     */
    onUpdate: function(/** Number */ x, /** Number */ y) {},


    /**
     * Drag'n'drop position event handler
     * @protected
     */
    onFinish: function(/**Boolean*/ finishedOK) {},

    /**
     * This function can add restrictions to the calculation
     * of a valid position in a drag'n'drop action
     * @protected
     * @type Boolean
     */
    isValidPosition: function(/** Integer */ x, /**Integer */ y) {
        return true;
    }
});

// vim:ts=4:sw=4:et:
