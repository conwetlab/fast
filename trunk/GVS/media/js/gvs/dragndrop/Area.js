var Area = Class.create( /** @lends Area.prototype */ {
    /**
     * This class represents an area to drop elements of some kind
     * It implements the DropZone interface
     * @param Function onDropHandler(DropZone zone, ComponentInstance droppedInstance)
     * @constructs
     */ 
    initialize: function(/** String */ areaClass, /** Array */ acceptedElements, /** Function */ onDropHandler) {
        
        /**
         * List of valid elements to be dropped in the area
         * @type Array
         * @private
         */
        this._acceptedElements = acceptedElements;
        
        /**
         * List of scroll listeners
         * @type Array
         * @private
         */
        this._scrollListeners = new Array();
        
        /**
         * Function to be called whenever an element
         * is dropped into the area
         * The handler must return if the element is accepted
         * @type Function
         * @private
         */
        this._onDropHandler = onDropHandler;
        
        /**
         * DOM Node of the area
         * @type DOMNode
         * @private
         */
        this._node = new Element('div', {
            'class': 'dropArea ' + areaClass
        });
        
        this._node.observe('scroll', this._onscroll.bind(this));
    },
    

    // **************** PUBLIC METHODS **************** //

    /**
     * Implementing DropZone Interface: getNode
     * @type DOMNode
     */
    getNode: function() {
        return this._node;    
    },
    
    
    /**
     * Implementing DropZone Interface: drop
     * @type DOMNode
     */
    drop: function(/** ComponentInstance */ element) {
        
        var accepted =  this._onDropHandler(this, element);
        if (accepted) {
            element.setArea(this);     
        }
        return accepted;
    },

   
    /**
     * Implementing DropZone Interface: accepts
     * @type DOMNode
     */
    accepts: function() {
        return this._acceptedElements;    
    },
    
    
    setLayout: function() {
        //TODO: Think about Layouts    
    },
   
    /**
     * Add scroll listener
     */
    addScrollListener: function(/** ComponentInstance */ listener) {
        this._scrollListeners.push(listener);
    },
    
    /**
     * Add scroll listener
     */
    removeScrollListener: function(/** ComponentInstance */ listener) {
        this._scrollListeners = this._listeners.without(listener);
    },
    // **************** PRIVATE METHODS **************** //
    /**
     * On scroll handler
     * @private
     */
    _onscroll: function() {
        this._scrollListeners.each(function(listener) {
            listener.scroll();   
        });  
    }

    
    
});

// vim:ts=4:sw=4:et:
