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
var DomainConceptSet = Class.create(BuildingBlockSet, /** @lends DomainConceptSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     * @extends BuildingBlockSet
     */
    initialize: function($super, /** Array */ tags, /** DomainConceptFactory */ factory) {
        $super(tags, factory);

        /**
         * Domain concepts
         * @type Array
         * @private
         */
        this._domainConcepts = new Array();

    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Starts the data retrieval of the domain concepts
     */
    startRetrievingData: function() {
        this._factory.getBuildingBlocks(this._tags, this._onSuccess.bind(this));
    },


    /**
     * Returns all the building block descriptions from the set
     * @type Array
     * @override
     */
    getBuildingBlocks: function () {
        return this._domainConcepts;
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * @private
     */
    _onSuccess: function(/** Array */ domainConcepts) {
        this._domainConcepts = domainConcepts;
        this._listener.setChanged();
    }
});

// vim:ts=4:sw=4:et:
