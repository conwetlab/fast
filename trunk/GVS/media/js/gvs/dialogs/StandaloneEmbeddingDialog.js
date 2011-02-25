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
var StandaloneEmbeddingDialog = Class.create(ConfirmDialog /** @lends PreviewDialog.prototype */, {
    /**
     * This class handles the dialog
     * to preview a component
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** Object */ publication, /** String */ url) {

        /**
         * URL to embed
         * @private
         * @type String
         */
        this._url = url;

        /**
         * Publication info
         * @private
         * @type Object
         */
        this._publication = publication;

        $super(this._getDialogTitle(this._publication.name), ConfirmDialog.OK);
        this._setContent(content);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * updateDialog
     * Updates dialog header and content
     * @public
     */
    updateDialog: function (/** Object */ publication, /** String */ url) {
        this._url = url;
        this._publication = publication;
        this._initDialogInterface();
        this._setTitle(this._getDialogTitle(this._publication.name), null);
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {

        var formData = [
            {'type':'title', 'value': 'Please, embed this HTML code into your web page:'},
            {'type':'pre', 'value': this._getEmbedding()}
        ];

        this._setContent(formData);

    },

    /**
     * getEmbedding
     * This function creates the dom structure and
     * @private
     * @override
     */
    _getEmbedding: function () {
        var height = this._publication.height;
        if (!height || height == ''){
            height = '600';
        }
        var width = this._publication.width;
        if (!width || width == ''){
            width = '400';
        }
        return ('<object data="' + this._url + '" height="'+ height
                + '" width="' + width + '" class="embed"></object>').escapeHTML();
    },

    /**
     * getDialogTitle
     * This function returns the dialog title
     * @private
     * @override
     */
    _getDialogTitle: function (/** String */ name) {
        return 'Embedding of ' + name + ' Standalone Gadget';
    }

});

// vim:ts=4:sw=4:et:
