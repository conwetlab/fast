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
var MenuElement = Class.create( /** @lends MenuElement.prototype */ {
    /**
     * Element for a menu
     * @constructs
     * @abstract
     */
    initialize: function(/** Number */ weight) {
        /**
         * The button Widget
         * @type dijit.*
         * @private
         */
        this._widget = null;

        /**
         * Ordering weight, the lower, the sooner the menu element
         * appears within a menu group
         * @type Number
         * @private
         */
        this._weight = weight;
        if (!this._weight) {
            this._weight = MenuElement.MAXIMUM_WEIGHT;
        }
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Returns the  widget
     * @type dijit.*
     */
    getWidget: function () {
        return this._widget;
    },

    /**
     * Returns the weight
     * @type Number
     */
    getWeight: function() {
        return this._weight;
    },

    /**
     * Register key handlers
     * @abstract
     */
    register: function(/** KeyPressRegistry */ registry) {
        throw "Abstract method invocation. MenuElement::register";
    },

    /**
     * Unregister key handlers and destroy the
     * widgets when necessary
     * @abstract
     */
    unregister: function(/** KeyPressRegistry */ registry) {
        throw "Abstract method invocation. MenuElement::unregister";
    }
});
// *************** CONSTANTS **************//
MenuElement.MAXIMUM_WEIGHT = 10000;
// vim:ts=4:sw=4:et:
