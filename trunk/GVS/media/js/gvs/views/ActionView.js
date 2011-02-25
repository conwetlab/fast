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
var ActionView = Class.create(
    /** @lends ActionView.prototype */ {

    /**
     * Actions graphical representation
     * @constructs
     */
    initialize: function(/** Object */ description) {

        /**
         * @type DOMNode
         * @private
         */
        this._node = null;

        /**
         * Condition Icons
         * @type Hash
         * @private
         */
        this._preIcons = new Hash();

        this._node = new Element("div", {
            "class": "action"
        });

        var title = new Element("div", {
            "class": "title"
        }).update(description.name);
        this._node.appendChild(title);

        var preArea = new Element("div",{
            "class": "preArea"
        });
        description.preconditions.each(function(pre) {
            var fact = FactFactory.getFactIcon(pre, "embedded");
            this._preIcons.set(pre.id, fact);
            preArea.appendChild(fact.getNode());
        }.bind(this));
        this._node.appendChild(preArea);

    },

    // **************** PUBLIC METHODS **************** //

    getNode: function() {
        return this._node;
    },

    /**
     * This function returns the domNode of the condition that has
     * the id passed as parameter
     * @type DOMNode
     */
    getConditionNode: function(/** String */ id) {
        return this._preIcons.get(id).getNode();
    },

    /**
     * Destroys the action node
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._preIcons = null;
        this._node.remove();
        this._node = null;
    },


    setReachability: function(/** Object */ actionData) {
        var satisfeable = actionData.satisfied;
        Utils.setSatisfeabilityClass(this._node, satisfeable);
        actionData.preconditions.each(function(preData){
            Utils.setSatisfeabilityClass(this._preIcons.get(preData.id).getNode(),
                                        preData.satisfied);
        }.bind(this));
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
