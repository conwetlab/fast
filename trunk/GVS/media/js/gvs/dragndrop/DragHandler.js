var DragHandler = Class.create(
    /** @lends DragHandler.prototype */ {

    /** 
     * Enables an object to be dragged.
     * 
     * @param dragSource
     *      An object implementing DragSource.
     * @param dropZone
     *      This object represents the valid area in 
     *      which the dragSource can be dropped. It must implement
     *       * DOMNode getNode()
     *       * void drop(Object element)
     * @constructs
     */
    initialize: function (/** DragSource */ dragSource, /** Object */ dropZone) {

        /**
         * A function returning objects to be dragged.
         * @type DragSource
         * @private
         */
        this._dragSource = dragSource;

        /**
         * Currently dragged object
         * @type Object
         * @private
         */
        this._draggedObject = null;

        /**
         * Zone to drop the dragged object
         * @type Object
         * @private
         */
        this._dropZone = dropZone;

        /**
         * Hash table with the initial area (container, 
         * x-position and y-position of the draggedObject)
         * @type Hash
         * @private
         */        
        this._initialArea = null;

        // Aux data for position calculation
        this._xStart = 0;
        this._yStart = 0;
        this._x;
        this._y;

        // Wrappers to the event handlers
        this._bindedStartDrag = this._startDrag.bind(this);
        this._bindedUpdate = this._update.bind(this);
        this._bindedEndDrag = this._endDrag.bind(this);
    },
    

    /**
     * Initializes the drag'n'drop handlers.
     * @public
     */
    initializeDragnDropHandlers: function () {

        // add mousedown event listener
        Event.observe (this._dragSource.getHandlerNode(), "mousedown",
                this._bindedStartDrag , true);
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * Drag intialization.
     * @private
     */
    _startDrag: function(e) {   
        e = e || window.event; // needed for IE

        // Only attend to left button events
        // (or right button for left-handed persons)
        if (!BrowserUtilsSingleton.getInstance().isLeftButton(e.button))
            return false;
        
        // An object is retrieved to be dragged
        this._draggedObject = this._dragSource.getDraggableObject();
        
        var draggableElement = this._draggedObject.getHandlerNode();
        
        var parentNode = draggableElement.parentNode;
        var x = this._draggedObject.getHandlerNode().offsetLeft;
        var y = this._draggedObject.getHandlerNode().offsetTop;
        this._initialArea = {
            'node': parentNode,
            'top': y,
            'left': x
        };

        // disable context menu and text selection
        document.oncontextmenu = function() { return false; }; 
        document.onmousedown = function() { return false; };
        document.onselectstart =  function() { return false; };

        Event.stopObserving (this._dragSource.getHandlerNode(), 'mousedown',
                this._bindedStartDrag, true);

        this._dragSource.onStart();
        
       
        this._xStart = parseInt(e.screenX);
        this._yStart = parseInt(e.screenY);
        this._y = this._draggedObject.getHandlerNode().offsetTop;
        this._x = this._draggedObject.getHandlerNode().offsetLeft;
        draggableElement.style.top  = this._y + 'px';
        draggableElement.style.left = this._x + 'px';
        Event.observe (document, 'mouseup',   this._bindedEndDrag, true);
        Event.observe (document, 'mousemove', this._bindedUpdate, true);

        var objects = document.getElementsByTagName('object');
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].contentDocument) {
                Event.observe(objects[i].contentDocument, 'mouseup' ,
                        this._bindedEndDrag, true);
                Event.observe(objects[i].contentDocument, 'mousemove', 
                        this._bindedUpdate, true);
            }
        }
        // Warning: magic number
        draggableElement.style.zIndex = '200'; 
        
        return false;
    },
    

    /**
     * Update position event handler
     * @private
     */
    _update: function (e) {
        e = e || window.event; // needed for IE

        var screenX = parseInt(e.screenX);
        var screenY = parseInt(e.screenY)
        var xDelta = this._xStart - screenX;
        var yDelta = this._yStart - screenY;
        this._xStart = screenX;
        this._yStart = screenY;
        this._y = this._y - yDelta;
        this._x = this._x - xDelta;

        var draggableElement = this._draggedObject.getHandlerNode();
        draggableElement.style.top = this._y + 'px';
        draggableElement.style.left = this._x + 'px';
        
        this._updateNodeStatus(this._isValidPosition());
        
        this._dragSource.onUpdate(this._x, this._y);
    },
    

    /**
     * Drop event handler
     * @private
     */
    _endDrag: function(e) {
        e = e || window.event; // needed for IE

        // Only attend to left button events
        // (or right button for left-handed persons)
        if (!BrowserUtilsSingleton.getInstance().isLeftButton(e.button))
            return false;

        Event.stopObserving (document, "mouseup",   this._bindedEndDrag, true);
        Event.stopObserving (document, "mousemove", this._bindedUpdate,  true);

        var objects = document.getElementsByTagName("object");
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].contentDocument) {
                Event.stopObserving(objects[i].contentDocument, "mouseup",
                        this._bindedEndDrag, true);
                Event.stopObserving(objects[i].contentDocument, "mousemove",
                        this._bindedUpdate,  true);
            }
        }

        var draggableElement = this._draggedObject.getHandlerNode();
        draggableElement.style.zIndex = "";
        


        //Remove element transparency        
        this._updateNodeStatus(true);
        
        var node = this._dropZone.getNode();
        var changingZone = (this._initialArea.node != node);
        
        this._dragSource.onFinish(changingZone, this._draggedObject);
        if(this._draggedObject != null){
            this._draggedObject.onDragFinish(changingZone);
        }
        
        if (changingZone) {
            if (this._isValidPosition() && this._dropZone.drop(this._draggedObject)) {
                // Valid position and the droppable has been accepted
                this._initialArea.node.removeChild(draggableElement);
                node.appendChild(draggableElement);
                var dropZonePosition = this._getDropZonePosition();
                draggableElement.setStyle({
                    'left': parseInt(draggableElement.offsetLeft - dropZonePosition.left) + "px",
                    'top': parseInt(draggableElement.offsetTop - dropZonePosition.top) + "px"
                });
            } else {
                // Destroy the element (we suppose it is a copy and 
                // it is invalid)
                this._initialArea.node.removeChild(draggableElement);
                this._draggedObject.destroy();
            } 
        } else { // Same zone
            if (!this._isValidPosition()) {
                // Another posibility would be to put the element in its initial position
                // left = this._initialArea.left
                // top = this._initialArea.top
                var left = (draggableElement.offsetLeft >= 0) ? draggableElement.offsetLeft : 1;
                var top = (draggableElement.offsetTop >= 0) ? draggableElement.offsetTop : 1;
                
                // Put the element in a correct position
                draggableElement.setStyle({
                    'left': left + "px",
                    'top': top + "px"
                });
            } 
        }
    
        // Reenable context menu and text selection
        document.onmousedown = null;
        document.oncontextmenu = null;
        document.onselectstart = null;
        
        Event.observe (this._dragSource.getHandlerNode(), "mousedown",
                this._bindedStartDrag, true);
       

        this._draggedObject = null;
        return false;
    },
  
    
     /**
     * This function calculates whether the element
     * is over the valid drop zone or not, and 
     * check the DropZone Restrictions
     * @private
     * @type Boolean
     */
    _isValidPosition: function(){
        var result = true;
        var node = this._dropZone.getNode();
        var draggableElement = this._draggedObject.getHandlerNode();
        // If we are moving an element from one zone to another...
        if (this._initialArea.node != node) {
            //Check if we are over the dropZone
            var dropZonePosition = this._getDropZonePosition();
            result = result && (draggableElement.offsetLeft >= dropZonePosition.left);
            result = result && (draggableElement.offsetTop >= dropZonePosition.top);
            result = result && (draggableElement.offsetLeft <= 
                    (dropZonePosition.left + node.offsetWidth));
            result = result && (draggableElement.offsetTop <= 
                    (dropZonePosition.top + node.offsetHeight));
        }
        else {
            //It is already inside the drop zone, so the
            //Position is relative to this zone
            result = result && (draggableElement.offsetLeft >= 0);
            result = result && (draggableElement.offsetTop >= 0);
            result = result && (draggableElement.offsetLeft <= node.offsetWidth);
            result = result && (draggableElement.offsetTop <= node.offsetWidth);
        }
        
        result = result && this._dragSource.isValidPosition(this._x,this._y);
        return result;
    },
 
     
     /**
     * This function updates node interface,
     * taking into account if it is in a valid
     * position or not
     * @private
     */
    _updateNodeStatus: function(/** Boolean */ isValid){
        if (isValid){
            this._draggedObject.getHandlerNode().removeClassName('disabled');
        }
        else {
            this._draggedObject.getHandlerNode().addClassName('disabled');
        }
    },
 
    
    /**
     * This function returns an object
     * containing the position of the drop zone
     * @private
     * @type Object
     */
    _getDropZonePosition: function (){
        var node = this._dropZone.getNode();
        var left = 0;
        var top  = 0;
    
        while (node.offsetParent){
            left += node.offsetLeft;
            top  += node.offsetTop;
            node  = node.offsetParent;
        }
    
        left += node.offsetLeft;
        top  += node.offsetTop;
    
        return {'left':left, 'top':top};
    }
});

// vim:ts=4:sw=4:et:
