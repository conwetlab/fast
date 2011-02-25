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
var PaletteController = Class.create(
    /** @lends PaletteController.prototype */ {

    /**
     * Manages a set of palettes.
     * @constructs
     * @param buildingBlocks
     *      Is an array of objects.
     *      Each objects contains the set for the building block
     *      and its associated drop zone
     */
    initialize: function(/** Array */ buildingBlockSets, /** Array */ dropZones,
        /** InferenceEngine */ inferenceEngine) {


        /**
         * List of available palettes
         * @type {Hash}
         * @private @member
         */
        this._palettes = new Hash();

        /**
         * AccordionContainer which contains the different palettes
         * @type AccordionContainer
         * @private @member
         */
        this._node = new dijit.layout.AccordionContainer({
                "class":"palettePane",
                "region":"left",
                "minSize":"170",
                "maxSize":"300",
                "splitter":"true",
                "livesplitters":"false",
                "style":"width:260px;"
                });

        //Create all the document necessary palettes
        $A(buildingBlockSets).each (function(set) {
            var validDropZones = new Array();
            dropZones.each(function(dropZone) {
                if (dropZone.accepts().include(set.getBuildingBlockType())) {
                    validDropZones.push(dropZone);
                }
            });
            var palette = new Palette (set, validDropZones, inferenceEngine);
            this._palettes.set(set.getBuildingBlockType(), palette);
            this._node.addChild(palette.getNode());
        }.bind(this));
    },

    // **************** PUBLIC METHODS **************** //
    getPalette: function (/** String */ type) {
        return this._palettes.get(type);
    },

    getNode: function() {
        return this._node;
    },

    /**
     * All uris of all the components (of all the palettes)
     */
    getComponentUris: function(/** String */ palette) {
        return this._palettes.get(palette).getComponentUris();
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:
