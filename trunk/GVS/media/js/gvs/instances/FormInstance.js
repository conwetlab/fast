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
var FormInstance = Class.create(ScreenComponentInstance,
    /** @lends FormInstance.prototype */ {

    _preOffsetPosition:  {top:12, left:4},
    _postOffsetPosition: {top:12, left:5},

    initialize:function($super, buildingBlockDescription, inferenceEngine) {
        $super(buildingBlockDescription, inferenceEngine);
        this._menu.addOption('Preview', this.showPreviewDialog.bind(this));
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function shows the dialog to change
     * the instance properties
     */
    showPreviewDialog: function () {
        if (! this._dialog) {
            var title = this.getTitle();
            var preview = this._buildingBlockDescription.getPreview();
            this._dialog = new PreviewDialog(title, preview);
        }
        this._dialog.show();
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new FormView(this._buildingBlockDescription);
    },

    /**
     * This function is called when the attached view is dbl-clicked
     * @private
     * @override
     */
    _onDoubleClick: function (/** Event */ event){
        this.showPreviewDialog();
    }

});

// vim:ts=4:sw=4:et:
