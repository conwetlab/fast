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
var BuildingBlockSet = Class.create( /** @lends BuildingBlockSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     */
    initialize: function(/** Array */ tags, /** BuildingBlockFactory */ factory) {
        /**
         * Associated tags
         * @type Array
         * @private @member
         */
        this._tags = tags;

        /**
         * Building block factory
         * @type BuildingBlockFactory
         * @private @member
         */
        this._factory = factory;


        /**
         * Set listener
         * @type SetListener
         * @private @member
         */
        this._listener = null;

        /**
         * List of BuildingBlock URIs
         * @type Array
         * @private @member
         */
        this._uris = new Array();
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Returns all the building block descriptions from the set
     * @type Array
     * @override
     */
    getBuildingBlocks: function () {
        return this._factory.getBuildingBlocks(this._uris, false);
    },

    /**
     * Gets the type of building block this factory mades.
     * @type String
     */
    getBuildingBlockType: function (){
        return this._factory.getBuildingBlockType();
    },

    /**
     * Gets the human-readable name of the building block type.
     * @type String
     */
    getBuildingBlockName: function (){
        return this._factory.getBuildingBlockName();
    },

    setListener: function (/** SetListener */ listener) {
        this._listener = listener;
    },

     /**
     * Add new building blocks to the set by uri
     */
    setURIs: function (/** Array */ uris) {
        this._requestedUris = uris;
        this._factory.cacheBuildingBlocks(uris, this._cachedElements.bind(this));
    },

    /**
     * This is the callback called when returning from the
     * building block factory
     * @private
     */
    _cachedElements: function () {
        if (GVS.getUser().getCatalogueMagic()) {
            this._uris = this._requestedUris;
        } else {
            this._uris = this._uris.concat(this._requestedUris).uniq();
        }
        this._listener.setChanged();
    }
});

// vim:ts=4:sw=4:et:
