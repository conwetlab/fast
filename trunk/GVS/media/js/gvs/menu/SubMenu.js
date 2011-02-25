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
var SubMenu = Class.create(MenuElement, /** @lends SubMenu.prototype */ {
    /**
     * Element for a menu
     * @constructs
     * @extends MenuElement
     */
    initialize: function($super, /** Object */ data, /** Boolean */ mainMenu) {
        $super(data.weight);

        var menu = new dijit.Menu({});

        if (mainMenu) {
            this._widget = new dijit.PopupMenuBarItem({
                    'label': data.label,
                    'popup': menu
                });
        } else {
            this._widget = new dijit.PopupMenuItem({
                    'label': data.label,
                    'popup': menu
                });
        }


        /**
         * Array for storing the different groups
         * that contains the Submenu children
         * @type Array
         * @private
         */
        this._groups = new Array();

        var child;
        $H(data.children).each(function(pair) {
            var childData = $H(pair.value).toObject();
            switch (childData.type.toLowerCase()) {
                case 'action':
                    child = childData.action;
                    break;
                case 'submenu':
                    child = new SubMenu(childData);
                    break;
            }
            this._addChild(childData.group, child);
        }.bind(this));
        this._createSubMenu(menu);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Register key handlers
     * @override
     */
    register: function(/** KeyPressRegistry */ registry) {
        this._groups.each(function(group) {
            group.each(function(child){
                child.register(registry);
            });
        });
    },

    /**
     * Unregister key handlers and destroy the widget
     * @override
     */
    unregister: function(/** KeyPressRegistry */ registry) {
        this._groups.each(function(group) {
            group.each(function(child){
                child.unregister(registry);
            });
        });
        this._widget.destroy(false);
    },

    // ***************** PRIVATE METHODS *************** //

     /**
     * Adds a new child to the submenu
     * @private
     */
    _addChild: function(/** Number */ group, /** MenuElement */ child) {
        if (!this._groups[group]) {
            this._groups[group] = new Array();
        }
        this._groups[group].push(child);
        this._groups[group].sort(function(a, b){
            return a.getWeight() - b.getWeight();
        });
    },


    /**
     * creates the submenu widget with the information
     * stored in the children's list
     * @private
     */
    _createSubMenu: function(/** Menu */ parent) {

        for(var i=0; i < this._groups.size(); i++) {
            if (this._groups[i]) {
                this._groups[i].each(function(element){
                    parent.addChild(element.getWidget());
                });
                if (i != this._groups.size() - 1) {
                    // Not last group
                    parent.addChild(new dijit.MenuSeparator());
                }
            }
        }
        parent.startup();
    }
});

// vim:ts=4:sw=4:et:
