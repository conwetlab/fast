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
var ExternalDocument = Class.create(AbstractDocument, /** @lends ExternalDocument.prototype */ {
    /**
     * Represents an external content
     * inner content.
     * @abstract
     * @extends AbstractDocument
     * @constructs
     */
    initialize: function ($super,
            /** String */ title,
            /** String */ url) {

        /**
         * Url of the external content
         * @type String
         * @private
         */
        this._url = url;

        $super(title);

        var iframe = new Element('iframe', {
            src: url,
            style:'border: 0px; width: 100%; height: 100%; margin: 0px; padding:0px;'
        });
        this._tabContent.appendChild(iframe);
        this._addToolbarElement('reload', new ToolbarButton(
            'Reload current tab',
            'refresh',
            function() { iframe.contentWindow.location.reload(); },
            true
        ));
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * @override
     */
    _closeDocument: function($super) {
        this._tabContent.update("");
        $super();
    }
});

// vim:ts=4:sw=4:et:
