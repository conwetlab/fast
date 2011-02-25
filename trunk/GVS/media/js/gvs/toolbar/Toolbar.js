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
var Toolbar = Class.create( /** @class @lends Toolbar.prototype */ {
    /**
     * The toolbar itself
     *
     * @constructs
     * @constructor
     */
    initialize: function() {
        /**
         * @type dijit.dialog.Toolbar
         * @private @member
         */
        this._toolbar = dijit.byId("toolbar");

        /**
         * List of toolbar models
         * @type Array
         * @private @member
         */
        this._models = new Array();

        /**
         * List of section elements.
         * Each section have another array with the Widget of the buttons plus a
         * separator on the first position (index 0).
         *
         * @type Array
         * @private @member
         */
        this._sections = new Array();
        this._sections[0] = new Array();
    },

    /**
     * Sets the model for the toolbar section on the given position.
     * ToolbarModel must provide objects implementing the following interface:
     *
     *   interface ToolbarElement
     *      Widget getWidget()  // dojo widget
     * @
     */
    setModel: function(/** Number */position, /** ToolbarModel */ model) {
        this._removeModel(position);

        if (model) {
            var toolbarElements = model.getToolbarElements();

            if (toolbarElements.size() > 0) {
                this._models[position] = model;

                this._initSection(position);

                toolbarElements.each(function (element) {
                    this._sections[position].push(element.getWidget());
                }.bind(this));
            }
        }

        this._refreshToolbar();
    },

    // ************************ PRIVATE METHODS ************************* //

    /**
     * Removes the model from the given position
     * @private
     */
    _removeModel: function(/** Number */ position) {
        if (this._models[position]) {
            this._models[position] = null;
            this._sections[position].clear();
        }
    },

    /**
     * Initializes a section
     * @private
     */
    _initSection: function(/** Number */ position) {
        if (!this._sections[position]) {
            this._sections[position] = new Array();
        }
        if (position != 0 && !this._sections[position][0]) {
            this._sections[position][0] = new dijit.ToolbarSeparator();
        }
    },

    /**
     * Refresh the toolbar interface
     * Called when something happens (a model has been added or removed)
     * @private
     */
    _refreshToolbar: function() {
        this._toolbar.getDescendants().each(function(descendant) {
            this._toolbar.removeChild(descendant);
        }.bind(this));

        this._sections.each(function (section) {
            section.each(function (element) {
                this._toolbar.addChild(element);
            }.bind(this));
        }.bind(this));
    }

});

// vim:ts=4:sw=4:et:
