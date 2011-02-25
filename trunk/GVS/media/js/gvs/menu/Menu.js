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
var Menu = Class.create( /** @lends Menu.prototype */ {
    /**
     * The Menu itself
     *
     * @constructs
     */
    initialize: function(/** KeyPressRegistry */ registry) {
        /**
         * @type dijit.MenuBar
         * @private @member
         */
        this._menu = dijit.byId("menu");

        /**
         * List of menu models
         * @type Hash
         * @private @member
         */
        this._models = new Hash();

        /**
         * Key press registry
         * @type KeyPressRegistry
         * @private
         */
        this._registry = registry;

        /**
         * Array of current menuElements
         * @type Array
         * @private
         */
        this._menuElements = new Array();

    },

    /**
     * Sets the model for the menu.
     * The model can contains different menus and elements
     */
    setModel: function(/** String */ keyword, /** MenuModel */ model) {
        this._models.unset(keyword);

        if (model) {
            this._models.set(keyword, model);
        }
        var menuConfig = this._mergeAllModels(this._models.values());
        this._createMenu(menuConfig);
    },

    // ************************ PRIVATE METHODS ************************* //


    /**
     * Merge all different model objects in order to create
     * a single menu
     * @private
     * @type Array
     */
    _mergeAllModels: function(/** Array */ models) {
        var resultHash = new Hash();
        models.each(function(model){
            resultHash = this._mergeMenuElements(resultHash, $H(model.getMenuElements()));
        }.bind(this));

        var result = resultHash.values().clone();

        result.sort(function(a,b) {
                        var left = a.get('weight') ? a.get('weight') : MenuElement.MAXIMUM_WEIGHT;
                        var right = b.get('weight') ? b.get('weight') : MenuElement.MAXIMUM_WEIGHT;
                        return left - right;
                    });

        return result;
    },


    /**
     * Merge all menu subelements from two elements
     * @private
     * @type Hash
     */
    _mergeMenuElements: function(/** Hash */ left, /** Hash */ right) {
        var result = new Hash();
        // All the keys without duplicates
        var keys = left.keys().concat(right.keys()).uniq();
        keys.each(function(key) {
            if(left.get(key) && right.get(key)) {
                result.set(key, this._mergeMenuElement($H(left.get(key)),$H(right.get(key))));

            } else if (left.get(key)) {
                result.set(key,$H(left.get(key)));

            } else if (right.get(key)) {
                result.set(key,$H(right.get(key)));
            }
        }.bind(this));
        return result;
    },


    /**
     * Returns an element with Union of the attributes
     * of the two passed as parameters
     * @private
     * @type Hash
     */
    _mergeMenuElement: function(/** Hash */ left, /** Hash */ right) {
        var result = new Hash();

        // All the keys without duplicates
        var keys = left.keys().concat(right.keys()).uniq();
        keys.each(function(key) {
            if(left.get(key) && right.get(key)) {
                if (key == 'children') {
                    result.set(key, this._mergeMenuElements($H(left.get(key)), $H(right.get(key))));

                } else {
                    if (left.get(key) != right.get(key)) {
                        throw "Conflicting menu element property " + key;
                    }

                    result.set(key, left.get(key));
                }

            } else if (left.get(key)) {
                result.set(key,left.get(key));

            } else if (right.get(key)) {
                result.set(key,right.get(key));
            }
        }.bind(this));
        return result;
    },


    /**
     * Creates the menu widget structure from a menu configuration object
     * @private
     */
    _createMenu: function(/** Array */ menuConfiguration) {
        //Unregistering the old menu elements
        this._menuElements.each(function(element) {
            element.unregister(this._registry);
        }.bind(this));
        this._menuElements.clear();
        menuConfiguration.each(function(menuElement) {
            var menuElementObject = menuElement.toObject();
            switch(menuElementObject.type.toLowerCase()) {
                case "submenu":
                    var element = new SubMenu(menuElementObject, true);
                    break;
                case "action":
                    var element = menuElementObject.action;
                    break;
            }
            this._menuElements.push(element);
            this._menu.addChild(element.getWidget());
            element.register(this._registry);
        }.bind(this));
    }
});

// vim:ts=4:sw=4:et:
