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
var ToolbarButton = Class.create( /** @lends ToolbarButton.prototype */ {
    /**
     * Button as a toolbar element.
     * Implementing ToolbarElement interface
     * @constructs
     * @param Boolean enabled (optional)
     */
    initialize: function(/** String */ label, /** String */ iconName,
            /** Function */ onClick, /** Boolean*/ enabled) {
        /**
         * The button Widget
         * @type dijit.form.Button
         * @private @member
         */
        this._widget = new dijit.form.Button ({
            'label': label,
            'iconClass': 'toolbarIcon ' + iconName + 'Icon',
            'onClick': onClick,
            'showLabel': false,
            'disabled': (enabled !== undefined)? (!enabled) : false
        });
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Sets the text of the button visible or not
     */
    setTextVisible: function( /** Boolean */ visible) {
        this._widget.attr('showLabel', visible);
    },

    /**
     * Returns the button widget
     * @type dijit.form.Button
     */
    getWidget: function () {
        return this._widget;
    },

    setEnabled: function(/** Boolean */ enabled) {
        this._widget.attr('disabled',!enabled);
    }

});

// vim:ts=4:sw=4:et:
