var DragHandler = Class.create(
    /** @lends DragHandler.prototype */ {

    /**
     * Enables an object to be dragged.
     *
     * @param dragSource
     *      An object implementing DragSource
     * @constructs
     */
    initialize: function (/** DragSource */ dragSource) {

        /**
         * An object returning objects to be dragged.
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
         * Zone from which the dragsource is dragged.
         * It can be null.
         * @type DropZone
         * @private
         */
        this._initialDropZone = null;

        /**
         * Valid Zones to drop the dragged object, plus their position
         * @type Array
         * @private
         */
        this._dropZonesInfo = new Array();


        // Wrappers to the event handlers
        this._boundedStartDrag = this._startDrag.bind(this);
        this._boundedUpdate = this._update.bind(this);
        this._boundedEndDrag = this._endDrag.bind(this);
    },


    /**
     * Initializes the drag'n'drop handlers and sets the drop zones
     */
    enableDragNDrop: function (/** DropZone */ currentZone, /** Array */ validDropZones) {

        this._initialDropZone = currentZone;
        this._initialDropZonePosition = null;

        validDropZones.each(function(dropZone) {
            this._dropZonesInfo.push({
                'dropZone': dropZone,
                'position': null
            });
        }.bind(this));

        // add mousedown event listener
        Event.observe (this._dragSource.getHandlerNode(), "mousedown",
                this._boundedStartDrag , true);
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * Drag intialization.
     * @private
     */
    _startDrag: function(e) {
        e = e || window.event; // needed for IE

        // Aux data for position calculation
        this._mouseXStart = 0;
        this._mouseYStart = 0;
        this._x = 0;
        this._y = 0;
        this._offLimitX = 0;
        this._offLimitY = 0;

        // Only attend to left button events
        // (or right button for left-handed persons)
        if (!BrowserUtils.isLeftButton(e.button)) {
            return false;
        }

        // An object is retrieved to be dragged
        this._draggedObject = this._dragSource.getDraggableObject();
        var draggableNode = this._draggedObject.getHandlerNode();

        this._initialArea = draggableNode.parentNode;

        // Set the dropZones areas in coordinates
        this._dropZonesInfo.each (function(dropZoneInfo) {
            var dropZoneNode = dropZoneInfo.dropZone.getNode();
            dropZoneInfo.position = Geometry.getClientRectangle(dropZoneNode);
        }.bind(this));
        if (this._initialDropZone) {
            var initialDropZoneNode = this._initialDropZone.getNode();
            this._initialDropZonePosition = Geometry.getRectangle(initialDropZoneNode);
        }

        this._toggleEventHandlers(true);

        this._draggedObject.onStart();


        this._mouseXStart = parseInt(e.screenX);
        this._mouseYStart = parseInt(e.screenY);
        this._y = draggableNode.offsetTop;
        this._x = draggableNode.offsetLeft;

        if (this._isChangingZone()) {
            draggableNode.addClassName("dragOnChangeLayer");
        } else {
            draggableNode.addClassName("dragLayer");
        }

        return false;
    },


    /**
     * Update position event handler
     * @private
     */
    _update: function (e) {
        e = e || window.event; // needed for IE

        var mouseX = parseInt(e.screenX);
        var mouseY = parseInt(e.screenY);

        this._updateNodePosition(mouseX, mouseY);
        this._updateNodeStatus(this._isValidPosition());

        this._draggedObject.onUpdate(this._x, this._y);

        var draggableNode = this._draggedObject.getHandlerNode();
    },


    /**
     * Drop event handler
     * @private
     */
    _endDrag: function(e) {
        e = e || window.event; // needed for IE

        // Only attend to left button events
        // (or right button for left-handed persons)
        if (!BrowserUtils.isLeftButton(e.button))
            return false;

        this._toggleEventHandlers(false);

        var draggableNode = this._draggedObject.getHandlerNode();
        draggableNode.removeClassName("dragLayer");
        draggableNode.removeClassName("dragOnChangeLayer");

        //Remove element transparency
        this._updateNodeStatus(true);

        var accepted;
        var dropPosition;
        // When changing zone, try to get the draggable accepted by the dropZone
        if (this._isChangingZone()) {
            var dropZone = this._inWhichDropZone();
            if (dropZone) {
                dropPosition = Geometry.adaptDropPosition(dropZone.getNode(), draggableNode);
                this._initialArea.removeChild(draggableNode);
                accepted = dropZone.drop(this._draggedObject, dropPosition);
            } else {
                this._initialArea.removeChild(draggableNode);
                accepted = false;
            }

            if (!accepted) {
                // Destroy the element (it is an invalid copy)
                this._draggedObject.destroy();
            }
        } else {
            accepted = true;
            dropPosition = {
                'top': draggableNode.offsetTop,
                'left': draggableNode.offsetLeft
            };
        }

        if (accepted) {
            this._draggedObject.onFinish(this._isChangingZone(), dropPosition);
        }
        this._draggedObject = null;

        return false;
    },

    /**
     * Enable and disable the different event handlers
     * @private
     */
    _toggleEventHandlers: function (/** Boolean */ startDrag) {
        if (startDrag) {
            // disable context menu and text selection
            document.oncontextmenu = function() { return false; };
            document.onmousedown = function() { return false; };
            document.onselectstart =  function() { return false; };

            Event.stopObserving (this._draggedObject.getHandlerNode(), 'mousedown',
                    this._boundedStartDrag, true);
            Event.observe (document, 'mouseup',   this._boundedEndDrag, true);
            Event.observe (document, 'mousemove', this._boundedUpdate, true);
        } else {
            // Reenable context menu and text selection
            document.onmousedown = null;
            document.oncontextmenu = null;
            document.onselectstart = null;
            Event.observe (this._dragSource.getHandlerNode(), "mousedown",
                    this._boundedStartDrag, true);
            Event.stopObserving (document, "mouseup",   this._boundedEndDrag, true);
            Event.stopObserving (document, "mousemove", this._boundedUpdate,  true);
        }
    },

    /**
     * This function detects if the node is going to change from one zone to
     * another
     * @private
     * @type Boolean
     */
    _isChangingZone: function() {
       return (this._initialDropZone == null);
    },


     /**
     * This function calculates whether the element
     * is over a valid drop zone or not, and
     * check the DropZone Restrictions
     * @private
     * @type Boolean
     */
    _isValidPosition: function(){
        if (this._isChangingZone()) {
            return (this._inWhichDropZone() != null);
        } else {
            return true;
        }
    },

     /**
     * This function calculates the exact dropZone the element
     * is
     * @private
     * @type DropZone
     */
    _inWhichDropZone: function(){
        for (var i=0; i < this._dropZonesInfo.length; i++) {
            if (Geometry.intersects(this._dropZonesInfo[i].position,
                        this._getDraggableNodeRectangle())) {
                return this._dropZonesInfo[i].dropZone;
            }
        }
        return null;
    },
    /**
     * @private
     * @type Object
     */
    _getDraggableNodeRectangle: function () {
        var draggableNode = this._draggedObject.getHandlerNode();
        return {
            'top': draggableNode.offsetTop,
            'left': draggableNode.offsetLeft,
            'bottom': draggableNode.offsetTop + draggableNode.offsetHeight,
            'right': draggableNode.offsetLeft + draggableNode.offsetWidth
        };
    },

    /**
     * This function updates the position of a node
     * regarding the absolute position of the mouse
     * @private
     */
    _updateNodePosition: function(/** Number */ x, /** Number */ y) {
        var xDelta = x - this._mouseXStart;
        var yDelta = y - this._mouseYStart;
        this._mouseXStart = x;
        this._mouseYStart = y;

        var node = this._draggedObject.getHandlerNode();
        if (!this._isChangingZone()) {
            var ranges = Geometry.dragRanges(this._initialDropZonePosition,
                    this._getDraggableNodeRectangle());

            var effectiveUpdateX = Geometry.updateAxis(ranges.x, xDelta, this._offLimitX);
            xDelta = effectiveUpdateX.delta;
            this._offLimitX = effectiveUpdateX.offLimit;

            var effectiveUpdateY = Geometry.updateAxis(ranges.y, yDelta, this._offLimitY);
            yDelta = effectiveUpdateY.delta;
            this._offLimitY = effectiveUpdateY.offLimit;
        }

        this._y = this._y + yDelta;
        this._x = this._x + xDelta;

        node.style.top = this._y + 'px';
        node.style.left = this._x + 'px';
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
    }



});

// vim:ts=4:sw=4:et:
