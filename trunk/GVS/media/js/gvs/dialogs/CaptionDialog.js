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
var CaptionDialog = Class.create(ConfirmDialog /** @lends CaptionDialog.prototype */, {
    /**
     * This class handles the dialog
     * to set a caption for a screen
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ caption,
                            /** Function */ onChangeCallback) {

        $super("Add Screen caption");

        this._caption = caption;


        this._onChangeCallback = onChangeCallback;

    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function returns the DOMNode of the button that shows the
     * dialog
     * @type DOMNode
     */
    getButtonNode: function() {

    	var button = new dijit.form.Button({
            'label': '...',
            'onClick': this.show.bind(this)
        });

        return new Element('div', {
            'class': 'triggerButton'
        }).update(button.domNode);
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
        this._setHeader(
                "Add Screen caption",
                "The caption will be shown in screen bottom when executing the"
                + " gadget.<br />You can use HTML tags to add formatting"
        );

        var formData = [
            {
                'type':'textarea',
                'label': 'Screen Caption:',
                'name': 'caption',
                'value': this._caption
            }
        ];

        this._setContent(formData);
    },

    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super) {
    	$super();
        this._onChangeCallback(this._getForm().caption.value);
    }
});

// vim:ts=4:sw=4:et:
