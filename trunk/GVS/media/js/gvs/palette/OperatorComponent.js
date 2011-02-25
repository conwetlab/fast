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
var OperatorComponent = Class.create(PaletteComponent,
    /** @lends OperatorComponent.prototype */ {

    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription OperatorBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
        this._inferenceEngine.addReachabilityListener(this._buildingBlockDescription.uri,this);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Colorize the component depending on the reachability
     * @public
     */
    setReachability: function( /** Boolean */ highlight) {
        if (highlight) {
            this._hover.setStyle({"opacity": "1"});
            dojo.fadeOut({
                "duration": 2500,
                "node": this._hover
            }).play(2500);
        }
    },


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        var view = new OperatorView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new Operator to be dragged.
     * @type OperatorInstance
     * @override
     */
    _createInstance: function () {
        return new OperatorInstance(this._buildingBlockDescription, this._inferenceEngine);
    },

    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        return this._buildingBlockDescription.label['en-gb'];
    },

    /**
     * This function returns a list with all the
     * preconditions of the component.
     * @type Array
     * @override
     */
    _getPreConditions: function() {
        var result = [];
        var actions = this._buildingBlockDescription.actions;
        for (var i=0; actions && i < actions.length; i++) {
            var preconditions = actions[i].preconditions;
            for (var j=0; preconditions && j < preconditions.length; j++) {
                result.push(preconditions[j]);
            }
        }
        return result;
    }

});

// vim:ts=4:sw=4:et:
