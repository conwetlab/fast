var PaletteComponent = Class.create(DragSource,
    /** @lends PaletteComponent.prototype */ {

    /**
     * GUI element that represents a palette element.
     * @constructs
     * @extends DragSource
     */ 
    initialize: function($super,/** ResourceDescription */ resourceDescription, /** String */ docId) {
        $super();
        /**
         * Handles the drag'n'drop stuff
         * @type DragHandler
         * @private
         */
        this._dragHandler = new DragHandler(this, GVSSingleton.getInstance().getDocumentController().getDocument(docId).getContentId());

        /**
         * Resource in which this component is based.
         * @type ResourceDescription
         * @private
         */
        this._resourceDescription = resourceDescription;

        /**
         * Screen component view
         * @type ScreenView
         * @private
         */
        this._view = this._resourceDescription.createView();
        
        /**
         * Node of the component.
         * @type DOMNode
         * @private
         */
        this._node = this._createSlot(this._resourceDescription.label['en-gb'],
                this._view.getNode());
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
        return this._view.getNode();
    },

    /**
     * Creates a new palette component to be dragged.
     * Returned object must have a getNode() method.
     * @type Object
     * @override
     */
    getDraggableObject: function() {
        var instance = this._createInstance();
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

    getResourceDescription: function() {
        return this._resourceDescription;
    },

    /**
     * Returns the root node
     * @type DOMNode
     * @public
     */
    getView: function() {
        return this._view;
    },
    // **************** PRIVATE METHODS **************** //
    /**
     * Creates an slot (GUI frame around a component) with a given title.
     *
     * @private
     */
    _createSlot: function (title, contentNode) {
        var node = new Element("div", {"class": "slot"});
        node.appendChild(contentNode);
        var titleNode = new Element("div", {"class": "slotTitle"}).update(title);
        node.appendChild(titleNode);
        this._dragHandler.initializeDragnDropHandlers();

        return node;
    },

    /**
     * Creates a new component to be dragged.
     * @type ComponentInstance
     * @abstract
     */
    _createInstance: function () {
        throw "Abstract Method invocation: PaletteComponent::_createInstance"
    },

    /**
     * Calculates the distance from the window top to the palette component.
     * @type Integer
     * @private
     */
    _getContentOffsetTop: function() {
        //FIXME: we suspect something is missing from the calculation
        
        // find the element which has the scrollOffset
        var paletteContent = this._node.parentNode;
        while (paletteContent.className != "paletteContent") {
                paletteContent = paletteContent.parentNode;
        }

        var scrollOffset = paletteContent.parentNode.scrollTop;
        var headerOffset = dijit.byId("header").domNode.offsetTop +
                dijit.byId("header").domNode.offsetHeight;
        return this.getView().getNode().offsetTop - scrollOffset + headerOffset;
    },

    /**
     * Calculates the distance from the window left border to the palette
     * component.
     * @type Integer
     * @private
     */
    _getContentOffsetLeft: function() {
        //FIXME: we suspect something is missing from the calculation

        return this.getView().getNode().offsetLeft;
    }

});

// vim:ts=4:sw=4:et:
