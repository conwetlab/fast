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
var PreferencesDialog = Class.create(ConfirmDialog /** @lends PreferencesDialog.prototype */, {
    /**
     * This class handles the dialog
     * that shows the user preferences
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super) {

        $super("User Preferences");
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {

        this._setHeader("User preferences");

        var user = GVS.getUser();

        var formData = [
            {'type':'input', 'label': 'First Name:','name': 'firstName',
                    'value': user.getFirstName()},
            {'type':'input', 'label': 'Last Name:','name': 'lastName',
                    'value': user.getLastName()},
            {'type':'input', 'label': 'Email:','name': 'email', 'value': user.getEmail(),
                    'regExp': FormDialog.EMAIL_VALIDATION,
                    'message': FormDialog.INVALID_EMAIL_MESSAGE,
                    'required': true},
            {'type':'checkbox', 'label': 'Smart Palette:',
                    'name': 'catalogueMagic',
                    'checked': user.getCatalogueMagic()},
            {'type':'checkbox', 'label': 'Search iServe services: <br /> (It may be slow)',
                    'name': 'iServe',
                    'checked': user.getiServe()}
        ];

        this._setContent(formData);

    },
    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){

        if (!this._getFormWidget().validate()) {
            return;
        }
        else {
            var user = GVS.getUser();
            user.update(this._getForm().serialize(true));
            $super();
        }
    },

    /**
     * Reset method to leave the form as initially
     * @override
     * @private
     */
    _reset: function ($super){
        var user = GVS.getUser();
        this._getForm().firstName.value = user.getFirstName();
        this._getForm().lastName.value = user.getLastName();
        this._getForm().email.value = user.getEmail();
        this._getForm().catalogueMagic.checked = user.getCatalogueMagic() ? 'checked' : 'unchecked';
        this._getForm().iServe.checked = user.getiServe() ? 'checked' : 'unchecked';
        $super();
    }
});

// vim:ts=4:sw=4:et:
