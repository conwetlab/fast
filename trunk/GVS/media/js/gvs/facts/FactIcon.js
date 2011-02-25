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
var FactIcon = Class.create( /** @lends FactIcon.prototype */ {

    /**
     * Graphical representation of a fact.
     * @constructs
     * @param Fact fact
     * @param String size  Icon size ("inline"|"embedded"|"standalone")
     */
    initialize: function(fact, size) {
        /**
         * Fact
         * @type Fact
         * @private
         */
        this._fact = fact;

        /**
         * Icon size
         * @type String
         * @private
         */
        this._size = size;

        /**
         * Fact icon root node
         * @type DOMNode
         * @private
         */
        this._node = new Element ("div", {
                "class": this._size + "_fact fact"
                });

        var contentLayer = new Element("div", {
                "class": "contentLayer"
                });
        this._node.appendChild(contentLayer);
        contentLayer.update(this._fact.getShortcut());

        var recommendationLayer = new Element("div", {
            "class": "recommendationLayer"
            });
        this._node.appendChild(recommendationLayer);
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the root node.
     * @type DOMNode
     * @public
     */
    getNode: function () {
        return this._node;
    },
     /**
     * Gets the fact object
     * @type Fact
     * @public
     */
    getFact: function () {
        return this._fact;
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
