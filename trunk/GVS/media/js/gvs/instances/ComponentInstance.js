var ComponentInstance = Class.create(DragSource,
    /** @lends ComponentInstance.prototype */ {

    /**
     * This class is an instance of a palette component
     * in the Document area
     * @constructs
     * @extends DragSource
     */ 
    initialize: function($super, /**BuildingBlockDescription*/ buildingBlockDescription, 
            /** DropZone */ dropZone, /** InferenceEngine */ inferenceEngine) {
        $super();

        /**
         * Handles the drag'n'drop stuff
         * @type DragHandler
         * @private
         */
        this._dragHandler = new DragHandler(this, dropZone);
        
        /** 
         * BuildingBlock description this class is instance of
         * @type BuildingBlockDescription
         * @private @member
         */
        this._buildingBlockDescription = buildingBlockDescription;

        /**
         * BuildingBlock description graphical representation
         * @type BuildingBlockView
         * @private
         */
        this._view = this._createView();
        /**
         * Inference engine to receive reachability updates
         * @type InferenceEngine
         * @private
         */
        this._inferenceEngine = inferenceEngine;
        
        if (this.getUri()) {
            this._inferenceEngine.addReachabilityListener(this.getUri(), this._view);           
        }
    },
    

    // **************** PUBLIC METHODS **************** //
    /**
     * Somehow something the user can comprehend
     * @abstract
     */
    getTitle: function() {
        throw "Abstract method invokation. ComponentInstance::getTitle";    
    },
    
    getUri: function() {
        return this._buildingBlockDescription.uri;    
    },
    
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
     * Returns the building block description
     * @public
     */
    getBuildingBlockDescription: function() {
        return this._buildingBlockDescription;
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
        this._inferenceEngine.removeReachabilityListener(this._buildingBlockDescription.uri, this._view);
        this._view.destroy();
        this._view = null;
    },
    
    /**
     * Drop event handler for the DragSource
     * @param changingZone
     *      True if a new Instance has
     *      been added to the new zone.
     * @override
     */
    onDragFinish: function(changingZone){
        if (changingZone){
            this._view.addEventListener (function(event){
                event.stop();
                this._onClick(event);
            }.bind(this),'click');
            this._view.addEventListener (function(event){
                event.stop();
                this._onDoubleClick(event);
            }.bind(this),'dblclick');
        }
    },

    // **************** PRIVATE METHODS **************** //
    
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @abstract
     */
    _createView: function () {
        throw "Abstract Method invocation: ComponentInstance::_createView"
    },
    
    /**
     * This function is called when the attached view is clicked
     * must be overriden by descendants
     * @private
     */
    _onClick: function (/** Event */ event){
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        currentDocument.setSelectedElement(this);
    },
    /**
     * This function is called when the attached view is dbl-clicked
     * must be overriden by descendants
     * @private
     */
    _onDoubleClick: function (/** Event */ event){
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        currentDocument.setSelectedElement(this);
    }
});

// vim:ts=4:sw=4:et:

