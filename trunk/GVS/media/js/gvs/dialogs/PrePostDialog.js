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
var PrePostDialog = Class.create(ConfirmDialog /** @lends PrePostDialog.prototype */, {
    /**
     * This class handles the dialog
     * to update the *-condition properties
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super,
            /** Function */ onChangeCallback,
            /** PrePostDescription */ description) {
        $super("Pre/Post Condition");


        this._description = description;


        this._onChangeCallback = onChangeCallback;
    },


    // **************** PUBLIC METHODS **************** //

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @overrides
     */
    _initDialogInterface: function (){

        this._setHeader("Check domain concept details",
                             "Please fulfill the required information in order to" +
                             " set up the Domain Concept");

        var formData = [
            {
                'type':'input',
                'label': 'Type:',
                'name': 'type',
                'value': this._description.type.toUpperCase(),
                'disabled': true
            },
            {
                'type': 'input',
                'label': 'Label:',
                'name': 'label',
                'value': this._description.getTitle(),
                'required': true
            },
            {
                'type': 'title',
                'value': 'EzWeb properties'
            },
            {
                'type': 'comboBox',
                'label': 'Binding:',
                'name': 'binding',
                'value': 'undefined',
                'options': []
            },
            {
                'type': 'input',
                'label': 'Variable name:',
                'name': 'variableName',
                'value': this._description.properties.ezweb.variableName,
                'required': true
            },
            {
                'type': 'input',
                'label': 'Friendcode:',
                'name': 'friendcode',
                'value': this._description.properties.ezweb.friendcode,
                'required': true
            }
        ];

        this._setContent(formData);
        this._onTypeChange();
    },
    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){
        this._onChangeCallback(this._getForm().serialize({'hash':true}));
        $super();
    },

    /**
     * Function called when the type of domain concept changes
     * @private
     */
    _onTypeChange: function() {

        var bindings = new Array();
        switch ($F(this._getForm().type).toUpperCase()) {
            case 'PRE':
                bindings.push({'value':'slot','label':'Slot'});
                bindings.push({'value':'pref','label':'User Preference'});
                bindings.push({'value':'context','label':'Platform Context'});
                break;
            case 'POST':
                bindings.push({'value':'event','label':'Event'});
                break;
            default:
                break;
        }
        var bindingNode = $(this._getForm().binding);
        bindingNode.update("");
        bindings.each(function(binding) {
           var optionNode = new Element('option', {
                             'value': binding.value
                        }).update(binding.label);
           bindingNode.appendChild(optionNode);
        });
    }
});

// vim:ts=4:sw=4:et:
