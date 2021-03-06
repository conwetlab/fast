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
var BuildGadgetDialog = Class.create(ConfirmDialog /** @lends BuildGadgetDialog.prototype */, {
    /**
     * This class handles the dialog
     * to store a gadget
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** Function */ onDeployCallback) {

        $super("Build Gadget");

        /**
         * @type Function
         * @private @member
         */
        this._onDeployCallback = onDeployCallback;
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * show
     * @override
     */
    show: function ($super, /** Object */ properties) {
        $super();
        $H(properties).each(function(pair) {
            this._getForm()[pair.key].setValue(pair.value);
        }.bind(this));
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        var user = GVS.getUser();

        this._setHeader("Fulfill Gadget Information",
                             "Please fulfill the required information in order to" +
                             " deploy a gadget.");

        var formData = [
            {'type':'title', 'value': 'Gadget information'},
            {'type':'input', 'label': 'Gadget Name:','name': 'name', 'value': '', 'required': true},
            {'type':'input', 'label': 'Gadget Short Name:', 'name': 'shortname', 'value': ''},
            {'type':'input', 'label': 'Version:','name': 'version', 'value': '1.0', 'required': true},
            {'type':'input', 'label': 'Vendor:','name': 'vendor', 'value': 'Morfeo', 'required': true},
            {'type':'input', 'label': 'Owner:','name': 'owner', 'value': 'Morfeo', 'required': true},
            {'type':'input', 'label': 'Gadget Description:','name': 'desc', 'value': ''},
            {'type':'input', 'label': 'Image URL:','name': 'imageURI',
                'value': '',
                'regExp': FormDialog.URL_VALIDATION,
                'message': FormDialog.INVALID_URL_MESSAGE},
            {'type':'input', 'label': 'Homepage:','name': 'gadgetHomepage',
                'value': '',
                'regExp': FormDialog.URL_VALIDATION,
                'message': FormDialog.INVALID_URL_MESSAGE},
            {'type':'input', 'label': 'Default Height:', 'name': 'height', 'value': '',
                'regExp': FormDialog.POSITIVE_VALIDATION,
                'message': FormDialog.INVALID_POSITIVE_MESSAGE},
            {'type':'input', 'label': 'Default Width:', 'name': 'width', 'value': '',
                'regExp': FormDialog.POSITIVE_VALIDATION,
                'message': FormDialog.INVALID_POSITIVE_MESSAGE},
            {'type':'checkbox', 'label': 'Persistent Data', 'name': 'persistent',
                'value': 'true',
                'checked': false},
            {'type':'title', 'value': 'Author information'},
            {'type':'input', 'label': 'Author Name:','name': 'authorName', 'value': user.getRealName()},
            {'type':'input', 'label': 'E-Mail:','name': 'email', 'value': user.getEmail(),
                'regExp': FormDialog.EMAIL_VALIDATION,
                'message': FormDialog.INVALID_EMAIL_MESSAGE},
            {'type':'input', 'label': 'Homepage:','name': 'authorHomepage',
                'value': '',
                'regExp': FormDialog.URL_VALIDATION,
                'message': FormDialog.INVALID_URL_MESSAGE},
            {'type':'title', 'value': 'Destination Gadgets'},
            {'type':'checkbox', 'label': 'EzWeb:','name': 'platforms',
                'value': 'ezweb',
                'checked': true},
            {'type':'checkbox', 'label': 'Google:','name': 'platforms',
                'value': 'google',
                'checked': true}
            ];
            if (GlobalOptions.isLocalStorage == false) {
                formData.push(
                {
                    'type':'checkbox', 'label': 'BeemBoard:','name': 'platforms',
                    'value': 'beemboard',
                    'checked': true
                });
            }
            formData.push({'type':'checkbox', 'label': 'Standalone:','name': 'platforms',
                'value': 'player',
                'checked': true});
        this._setContent(formData);
    },
    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super){
        if (this._getFormWidget().validate()) {
            var form = this._getForm().serialize({'hash':true});
            if (form.platforms){
                $super();
                this._onDeployCallback(form);
            }
        }
    },
    /**
     * Reset form
     * @private
     * @override
     */
    _reset: function($super){
        var user = GVS.getUser();

        this._getForm().authorName.value = user.getRealName();
        this._getForm().email.value = user.getEmail();
        $super();
    }
});

// vim:ts=4:sw=4:et:
