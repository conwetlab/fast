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
var ScreenflowPlayer = Class.create( /** @lends ScreenflowPlayer.prototype */ {
    /**
     * On charge of playing screenflows
     * @constructs
     */
    initialize: function() {

        /**
         * @type ScreenflowDescription
         * @private @member
         */
        this._description = null;

        /**
         * @type PreviewDialog
         * @private @member
         */
        this._dialog = null;

        /**
         * Is the logging (debugging) enabled?
         * @private
         * @type Boolean
         */
        this._logEnabled = false;

        /**
         * DOM node of the player
         * @private
         * @type DOMNode
         */
        this._object = null;

    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Shows the Screenflow execution
     * @public
     */
    playScreenflow: function (/** ScreenflowDescription */ description) {
        this._description = description;

        if (!this._dialog) {
            var title = this._description.name;

            this._dialog = new PreviewDialog(title, this._getPreview());
        } else {
            this._dialog.setContent(this._getPreview());
        }
        this._dialog.show();

    },

    /**
     * Debug screenflow in a new window
     */
    debugScreenflow: function(/** ScreenflowDescription*/ description) {
        this._description = description;
        GVS.getDocumentController().openExternalTool("Screenflow Debugger",
            this._getScreenflowURL("debug"));
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This method creates a DOM Node with the preview
     * of the Screenflow
     * @type DOMNode
     */
    _getPreview: function() {
        var node = new Element('div', {
            'class': 'player'
        });

        var errorField = new Element('div', {
            'class': 'error'
        });
        node.appendChild(errorField);

        this._object = new Element ('object', {
            'data': this._getScreenflowURL(),
            'class': 'embed'
        });

        node.appendChild(this._object);

        var bottomZone = new Element('div');
        var linkNode = new Element("a", {
            "href": this._getScreenflowURL("debug"),
            "target": "_blank"
        }).update("[Debug in new window]");
        bottomZone.appendChild(linkNode);
        bottomZone.appendChild(new Element("br"));

        var loggingCheckBox = new dijit.form.CheckBox({
            checked: this._logEnabled
        });
        bottomZone.appendChild(loggingCheckBox.domNode);
        loggingCheckBox.domNode.observe("change",
                this._toggleLogging.bind(this));

        var label = new Element('span')
                        .update("Logging enabled (better if you have Firebug)");
        bottomZone.appendChild(label);

        node.appendChild(bottomZone);
        return node;
    },
    /**
     * Toggle the logging
     * @private
     */
    _toggleLogging: function(/** Event*/ e) {
        var checkbox = Event.element(e);
        this._logEnabled = !this._logEnabled;
        checkbox.checked = this._logEnabled;
        this._object.contentDocument.location.href = this._getScreenflowURL();
    },

    /**
     * Gets the screenflow URL
     * @type String
     * @private
     */
    _getScreenflowURL: function(_debugLevel) {
        var debugLevel = _debugLevel || (this._logEnabled  ? "logging" : "");
        return URIs.storePlayScreenflow + "?screenflow=" +
            this._description.getId() + "&debugLevel=" + debugLevel;
    }
});
// vim:ts=4:sw=4:et:
