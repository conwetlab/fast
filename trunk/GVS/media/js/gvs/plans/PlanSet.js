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
var PlanSet = Class.create(BuildingBlockSet, /** @lends PlanSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     * @extends BuildingBlockSet
     */
    initialize: function($super) {
        $super([]);

        /**
         * List of Plans
         * @type Array
         * @private @member
         */
        this._plans = new Array();


        this._factory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.SCREEN);
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Returns all the building blocks ordered by plan from the set
     * @type Array
     * @override
     */
    getBuildingBlocks: function () {
        var result = new Array();
        this._plans.each(function(plan) {
            result.push(this._factory.getBuildingBlocks(plan));
        }.bind(this));
        return result;
    },

    /**
     * Add new building blocks to the set by uri
     */
    setPlans: function (/** Array */ plans) {
        this._plans = plans.splice(0,10); //Just in case
        var uris = this._plans.flatten().uniq();
        this._factory.cacheBuildingBlocks(uris, this._cachedElements.bind(this));
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This is the callback called when returning from the
     * building block factory
     */
    _cachedElements: function () {
        this._listener.setChanged();
    }

});

// vim:ts=4:sw=4:et:
