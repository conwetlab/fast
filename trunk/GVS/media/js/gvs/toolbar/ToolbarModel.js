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
var ToolbarModel = Class.create( /** @lends ToolbarModel.prototype */ {
    /**
     * Provides toolbar elements for a toolbar section.
     * @abstract
     * @constructs
     */
    initialize: function() {

        /**
         * All the toolbar elements
         * @type Hash
         * @private @member
         */
        this._toolbarElements = new Hash();

        /**
         * Order of the elements in the toolbar interface
         * @type Array
         * @private @member
         */
        this._toolbarElementOrder = new Array();

    },


    // **************** PUBLIC METHODS **************** //


    /**
     *
     * @type Array   Array of ToolbarElement
     */
    getToolbarElements: function() {
        var elements = new Array();
        this._toolbarElementOrder.each(function(name) {
            elements.push(this._toolbarElements.get(name));
        }.bind(this));
        return elements;
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * Adds a new element to the list
     * @private
     */
    _addToolbarElement: function(/** String */ elementName, /** ToolbarElement */ element) {
        this._toolbarElementOrder.push(elementName);
        this._toolbarElements.set(elementName, element);
    }
});

// vim:ts=4:sw=4:et:
