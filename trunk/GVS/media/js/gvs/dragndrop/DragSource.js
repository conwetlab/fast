/*...............................licence...........................................
 *
 *    (C) Copyright 2011 FAST Consortium
 *
 *     This file is part of FAST Platform.
 *
 *     FAST Platform is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     FAST Platform is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with FAST Platform.  If not, see <http://www.gnu.org/licenses/>.
 *
 *     Info about members and contributors of the FAST Consortium
 *     is available at
 *
 *     http://fast.morfeo-project.eu
 *
 *...............................licence...........................................*/
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
