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
   
   
    // **************** PRIVATE METHODS **************** //

    
    
});

// vim:ts=4:sw=4:et:
