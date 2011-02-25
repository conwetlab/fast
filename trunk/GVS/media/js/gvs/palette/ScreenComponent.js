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
var ScreenComponent = Class.create(PaletteComponent,
    /** @lends ScreenComponent.prototype */ {

    /**
     * Palette component of a screen building block.
     * @param BuildingBlockDescription screenBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
        this._inferenceEngine.addReachabilityListener(this._buildingBlockDescription.uri, this._view);
    },

    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @private
     * @override
     */
    _createView: function () {
        var view = new ScreenView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new screen to be dragged.
     * @type ScreenInstance
     * @private
     * @override
     */
    _createInstance: function () {
        return new ScreenInstance(this._buildingBlockDescription, this._inferenceEngine);
    },

    /**
     * Gets the title of the palette component
     * @type String
     * @private
     */
    _getTitle: function() {
        return this._buildingBlockDescription.label['en-gb'];
    }
});

// vim:ts=4:sw=4:et:
