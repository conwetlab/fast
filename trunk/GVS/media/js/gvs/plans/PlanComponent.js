var PlanComponent = Class.create(DragSource,
    /** @lends PlanComponent.prototype */ {

    /**
     * GUI element that represents a Plan element.
     * @constructs
     * @extends DragSource
     */ 
    initialize: function($super,/** Array */ plan, /** DropZone */ dropZone, 
                        /** InferenceEngine */ inferenceEngine) {
        $super();
        
        /**
         * Component and instance Drop zone 
         * @type DropZone
         * @private
         */
        this._dropZone = dropZone;

        /**
         * List of buildingBlock description of the plan
         * @type Array
         * @private
         */
        this._plan = plan;
        
        
        /**
         * Inference engine
         * @type InferenceEngine
         * @private
         */
        this._inferenceEngine = inferenceEngine;
        
        /**
         * Plan view
         * @type PlanView
         * @private
         */
        this._view = new PlanView(this._plan);
        
        /**
         * Node of the component.
         * @type DOMNode
         * @private
         */
        this._node = this._view.getNode();
        
        
        this.enableDragNDrop(null, [this._dropZone]);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets the component root node.
     * @type DOMNode
     * @public
     */
    getNode: function() {
        return this._node;
    },
    

    /**
     * Returns the node that can be clicked to start a drag-n-drop operation.
     * @type DOMNode
     * @override
     */
    getHandlerNode: function() {
        return this._node;
    },

    /**
     * Creates a new Plan component to be dragged.
     * Returned object must have a getNode() method.
     * @type Object
     * @override
     */
    getDraggableObject: function() {
        var instance = new PlanInstance (this._plan, this._inferenceEngine);
        var node = instance.getHandlerNode();
        dijit.byId("main").domNode.appendChild(node);
        node.setStyle({
            'top': this._getContentOffsetTop() + 'px',
            'left':  this._getContentOffsetLeft() + 'px',
            'position': 'absolute'
        });
        instance.getDragHandler().initializeDragnDropHandlers();
        return instance;
    },

    
    // **************** PRIVATE METHODS **************** //

    /**
     * Calculates the distance from the window top to the palette component.
     * @type Integer
     * @private
     */
    _getContentOffsetTop: function() {
        
        return this._node.cumulativeOffset().top -
                this._node.cumulativeScrollOffset().top;
    },

    /**
     * Calculates the distance from the window left border to the palette
     * component.
     * @type Integer
     * @private
     */
    _getContentOffsetLeft: function() {

       return this._node.cumulativeOffset().left -
                this._node.cumulativeScrollOffset().left;
    }

});

// vim:ts=4:sw=4:et:
