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
var Area = Class.create( /** @lends Area.prototype */ {
    /**
     * This class represents an area to drop elements of some kind
     * It implements the DropZone interface
     * @param Function onDropHandler(DropZone zone, ComponentInstance droppedInstance)
     * @constructs
     */
    initialize: function(/** String */ areaClass, /** Array */ acceptedElements, /** Function */ onDropHandler, /** Object */ _options) {
        var options = Utils.variableOrDefault(_options, {});
        options = Object.extend ({
            style : ""
        }, options);

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

        if (options.region != 'center') {
            if (options['minHeight'] != null) {
                options.style += "height: " + options['minHeight'] + 'px;';
            }
            if (options['minWidth'] != null) {
                options.style += "width: " + options['minWidth'] + 'px;';
            }
        }

        /**
         * ContentPane of the area
         * @type dijit.layout.ContentPane
         * @private
         */
        this._contentPane = new dijit.layout.ContentPane(options);

        /**
         * DOM Node of the area
         * @type DOMNode
         * @private
         */
        this._node = new Element('div', {
            'class': 'dropArea ' + areaClass
        });
        this._contentPane.setContent(this._node);

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
     * Returns the  widget
     * @type dijit.*
     */
    getWidget: function () {
        return this._contentPane;
    },

    /**
     * Implementing DropZone Interface: drop
     * @type DOMNode
     */
    drop: function(/** ComponentInstance */ element, /** Object */ position) {

        var accepted =  this._onDropHandler(this, element, position);
        return accepted;
    },


    /**
     * Implementing DropZone Interface: accepts
     * @type DOMNode
     */
    accepts: function() {
        return this._acceptedElements;
    },

    /**
     * Observe node
     */
    observe: function(/** String */ eventName, /** Function */ observer) {
        this.getNode().observe(eventName, observer);
    },

    stopObserving: function(/** String */ eventName) {
        this.getNode().stopObserving(eventName);
    },

    setLayout: function() {
        //TODO: Think about Layouts
    },

    /**
     * Insert a Element
     */
    insert: function(/* Element */ element, /* Object */ position) {
        $("main").insert(element);
        position = Geometry.adaptInitialPosition(
            this._node,
            element.toElement(),
            Object.extend({top: 33, left: 33}, position)
        );
        element.setPosition(position);
        this._node.insert(element);
    }

    // **************** PRIVATE METHODS **************** //



});

// vim:ts=4:sw=4:et:
