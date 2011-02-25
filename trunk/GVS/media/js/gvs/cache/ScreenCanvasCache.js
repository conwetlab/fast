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
var ScreenCanvasCache = Class.create( /** @lends ScreenCanvasCache.prototype */ {
    /**
     *
     * @constructs
     */
    initialize: function (/** Object */ properties) {
        /**
         * Buildingblocks of the screen
         * @type Array
         * @private
         */
        this._buildingblocks = properties.definition.buildingblocks;

        /**
         * Pipes of the screen
         * @type Array
         * @private
         */
        this._pipes = properties.definition.pipes;

        /**
         * Triggers of the screen
         * @type Array
         * @private
         */
        this._triggers = properties.definition.triggers;

        /**
         * Preconditions of the screen
         * @type Array
         * @private
         */
        this._preconditions = properties.preconditions || new Array();

        /**
         * Postconditions of the screen
         * @type Array
         * @private
         */
        this._postconditions = properties.postconditions || new Array();

        /**
         * Array of already loaded building block types
         * @type Array
         * @private
         */
        this._elementsLoaded = new Array();
    },


    // **************** PRIVATE METHODS **************** //
    /**
     * Gets the uri of the form (if any) in form of Array, to
     * get compatibility with factory method
     * @type Array
     */
    getFormURI: function () {
        var form = this._buildingblocks.detect(function(element) {
            return (element.uri.search(/forms/i) != -1);
        });
        if (form) {
            return [form.uri];
        } else {
            return [];
        }

    },

    /**
     * Returns the list of operator URIs
     * @type Array
     */
    getOperatorURIs: function() {
        var elements = this._buildingblocks.findAll(function(element) {
            return (element.uri.search(/operators/i) != -1);
        });
        var result = new Array();
        elements.each(function(element) {
            if (result.indexOf(element.uri) == -1) {
                result.push(element.uri);
            }
        });
        return result;
    },

    /**
     * Returns the list of resource URIs
     * @type Array
     */
    getResourceURIs: function() {
        var elements = this._buildingblocks.findAll(function(element) {
            return (element.uri.search(/services/i) != -1);
        });
        var result = new Array();
        elements.each(function(element) {
            if (result.indexOf(element.uri) == -1) {
                result.push(element.uri);
            }
        });
        return result;
    },

    /**
     * Returns the list of preconditions
     * @type Array
     */
    getPreconditions: function() {
        return this._preconditions;
    },

    /**
     * Returns the list of postconditions
     * @type Array
     */
    getPostconditions: function() {
        return this._postconditions;
    },

    /**
     * Returns the list of pipes
     * @type Array
     */
    getPipes: function() {
        return this._pipes;
    },

    /**
     * Returns the list of triggers
     * @type Array
     */
    getTriggers: function() {
        return this._triggers;
    },

    /**
     * Returns the id of an element by its URI
     * @type Array
     */
    getIds: function(/** String */ uri) {
        var elements = this._buildingblocks.findAll(function(element) {
            return element.uri == uri;
        });
        if (elements) {
            return elements.collect(function(element){return element.id});
        } else {
            return null;
        }
    },

    /**
     * Returns the parameters of an element by its URI
     * @type Object
     */
    getParams: function (/** String */ id) {
        var element = this._buildingblocks.detect(function(element) {
            return element.id == id;
        });
        if (element) {
            return element.parameter;
        } else {
            return null;
        }
    },

    /**
     * Returns the title of an element by its URI
     * @type Object
     */
    getTitle: function (/** String */ id) {
        var element = this._buildingblocks.detect(function(element) {
            return element.id == id;
        });
        if (element) {
            return element.title;
        } else {
            return null;
        }
    },

    getCaption: function() {
        return null;
    },


    /**
     * Returns the position of an element by its URI
     * @type Object
     */
    getPosition: function (/** String */ id) {
        var element = this._buildingblocks.detect(function(element) {
            return element.id == id;
        });
        if (element) {
            return element.position;
        } else {
            return null;
        }
    },

    /**
     * Returns the original uri of an element by its URI
     * @type Object
     */
    getOriginalUri: function (/** String */ id) {
        var element = this._buildingblocks.detect(function(element) {
            return element.id == id;
        });
        if (element) {
            return element.originalUri;
        } else {
            return null;
        }
    },

    /**
     * Returns the orientation of an element by its URI
     * @type Object
     */
    getOrientation: function (/** String */ id) {
        var element = this._buildingblocks.detect(function(element) {
            return element.id == id;
        });
        if (element) {
            return element.orientation;
        } else {
            return null;
        }
    },

    /**
     * Sets a buildingblock type as already loaded
     */
    setLoaded: function (/** String */ buildingblocktype) {
        this._elementsLoaded.push(buildingblocktype);
    },

    /**
     * Returns true if all the buildingblocks (operators, services and
     * resources), have been loaded
     * @type Boolean
     */
    areInstancesLoaded: function() {
        var result = (this._elementsLoaded.indexOf(Constants.BuildingBlock.RESOURCE) != -1);
        result = result && (this._elementsLoaded.indexOf(Constants.BuildingBlock.OPERATOR) != -1);
        result = result && (this._elementsLoaded.indexOf(Constants.BuildingBlock.FORM) != -1);
        return result;
    }

});

// vim:ts=4:sw=4:et:
