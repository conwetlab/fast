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
var ParamsDialog = Class.create(ConfirmDialog /** @lends ParamsDialog.prototype */, {
    /**
     * This class handles the dialog
     * to assign triggers to actions
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ buildingblockName,
                            /** String */ initialParameter,
                            /** String */ templateParameter,
                            /** Function */ onChangeCallback) {

        $super(buildingblockName + " Parameters");

        /**
         * Building block name
         * @type String
         * @private
         */
        this._buildingblockName = buildingblockName;

        /**
         * Params initially assigned to the buildingblock
         * @type String
         * @private
         */
        this._initialParameter = initialParameter;

        /**
         * Template parameters
         * @type String
         * @private
         */
        this._templateParameter = templateParameter;

        /**
         * Textarea to edit the buildingblock params
         * @type Array
         * @private
         */
        this._textarea = new dijit.form.SimpleTextarea();
        this._textarea.domNode.addClassName('parameterArea');
        this._textarea.setValue(this._initialParameter);

        this._tooltipButton = new Element('div', {
            'class': 'initialParameterButton'
        }).update("&nbsp;");

        this._tooltipButton.observe('click', function() {
            var dialog = new ExternalContentDialog("Example parameter configuration");
            dialog.show(new Element('pre').update(this._templateParameter));
        }.bind(this));

        /**
         * Example parameter configuration, in a tooltip
         * @type dijit.Tooltip
         * @private
         */
        this._templateParameterTooltip = new dijit.Tooltip({
            'connectId': [this._tooltipButton],
            'label': "<h4> Example parameter configuration </h4>" +
                "<pre>" + this._templateParameter + "</pre>"
        });

        /**
         * @type Function
         * @private
         */
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

        var content = new Element('div', {
            'class': 'paramsDialog'
        });
        var title = new Element('h2').update("Edit " +
        		this._buildingblockName + " parameters:");
        content.appendChild(title);

        content.appendChild(this._textarea.domNode);

        if (this._templateParameter) {
            content.appendChild(this._tooltipButton);
        }
        this._setContent(content);
    },

    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super) {
    	$super();
        this._onChangeCallback(this._textarea.getValue());
    }
});

// vim:ts=4:sw=4:et:
