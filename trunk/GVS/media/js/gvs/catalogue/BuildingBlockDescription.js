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
var BuildingBlockDescription = Class.create(
    /** @lends BuildingBlockDescription.prototype */ {

    /**
     * Generic building block description. All the building block classes extends
     * this one.
     * @constructs
     */
    initialize: function(/** Hash */ properties) {
        Utils.addProperties(this, properties);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Adds properties to the ScreenflowDescription
     */
    addProperties: function(properties) {
        Utils.addProperties(this, properties);
    },

    /**
     * Clones the building block
     * @type BuildingBlockDescription
     */
    clone: function() {

        function _cloneElement(element) {
            var result;
            if ((element instanceof Array)) {
                result = [];
                element.each(function(subelement) {
                    result.push(_cloneElement(subelement));
                });
            } else if (element instanceof Object) {
                result = {};
                $H(element).each(function(pair) {
                    result[pair.key] = _cloneElement(pair.value);
                });
            } else {
                result = element;
            }
            return result;
        }

        var elements = [
            "code",
            "creationDate",
            "creator",
            "description",
            "homepage",
            "icon",
            "label",
            "parameterTemplate",
            "postconditions",
            "preconditions",
            "rights",
            "screenshot",
            "tags",
            "template",
            "type",
            "uri",
            "version",
            "actions",
            "libraries",
            "triggers"
        ];
        var resultObject = {};
        elements.each(function(element) {
            if (this[element] !== undefined) {
                resultObject[element] = _cloneElement(this[element]);
            }
        }, this);
        return new BuildingBlockDescription(resultObject);
    },

    /**
     * This function translate the stored properties into
     * a JSON-like object
     * @type Object
     */
    toJSON: function() {
        var result = {};
        $H(this).each(function(pair) {
            if (!(pair.value instanceof Function)) {
                result[pair.key] = pair.value;
            }
        });

        return result;

    },

    /**
     * Return the field to order the building block in the catalogue
     * @type String
     */
    getOrder: function() {
        return this.getTitle();
    },

    /**
     * Implementing the TableModel interface
     * @type String
     */
    getTitle: function() {
        return this.label ? this.label['en-gb'] : this.name;
    },

    /**
     * Returns the id of the building block
     * @type String
     */
    getId: function() {
        return this.id;
    },

    /**
     * This function returns if the data inside the description is valid
     * @type Boolean
     */
    isValid: function() {
        return true;
    },

    /**
     * For document descriptions, return the existing canvas instancies
     */
    getCanvasInstances:function() {
        return [];
    },

    /**
     * For document descriptions, return the existing canvas instancies
     */
    getConditionInstances:function() {
        return [];
    },

    getPreconditionsList: function() {
        if (! this.actions) {
            return this._getConditionsList("preconditions");
        }
        var result = [];
        $A(this.actions).each(function(action) {
            $A(action.preconditions).each(function(p){ result.push(p); });
        });
        return result;
    },

    getPostconditionsList: function() {
        return this._getConditionsList("postconditions");
    },

    // **************** PRIVATE METHODS **************** //

    _getConditionsList: function(type){
        return this[type];
    }

});

// vim:ts=4:sw=4:et:
