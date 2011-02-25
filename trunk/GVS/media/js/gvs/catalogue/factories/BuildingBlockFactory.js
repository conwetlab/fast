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
var BuildingBlockFactory = Class.create(
    /** @lends BuildingBlockFactory.prototype */ {

    /**
     * Abstract building block factory
     * @constructs
     * @abstract
     */
    initialize: function() {


    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the type of building block this factory mades.
     * @type String
     */
    getBuildingBlockType: function (){
        throw "Abstract method invocation. BuildingBlockFactory::getBuildingBlockType";
    },


    /**
     * Gets the human-readable name of the building block type.
     * @type String
     */
    getBuildingBlockName: function (){
        return Constants.BuildingBlockNames[this.getBuildingBlockType()];
    },


    /**
     * Gets building block descriptions by URI
     * @type {BuildingBlockDescription[]}
     * @abstract
     */
    getBuildingBlocks: function (/*...*/) {
        throw "Abstract method invocation. BuildingBlockFactory::getBuildingBlockDescriptions";
    },

    /**
     * Gets a new instance of the type of the factory
     * @abstract
     * @type ComponentInstance
     */
    getInstance: function(/** BuildingBlockDescription */description, /** InferenceEngine */ engine) {
        throw "Abstract method invocation. BuildingBlockFactory::getInstance";
    }

});

// vim:ts=4:sw=4:et:
