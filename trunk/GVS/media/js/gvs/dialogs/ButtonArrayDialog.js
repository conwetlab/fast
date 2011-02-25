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
var ButtonArrayDialog = Class.create(FormDialog, /** @lends ButtonArrayDialog.prototype */ {
    /**
     * This class handles dialogs with sets of buttons
     * @extends FormDialog
     * @constructs
     */
    initialize: function($super, /** Array */ handlers, /** Object  */ _options) {
        $super({
            'title': "Choose Building Block",
            'style': 'display:none;'
        }, _options);

        /**
         * Object that stores the handler (i.e. functions that will be called
         * when the associated button is clicked)
         * @private
         * @type Array
         */
        this._handlers = handlers;

    },


    // **************** PUBLIC METHODS **************** //



    // **************** PRIVATE METHODS **************** //

    /**
     * Inits the user interface
     * @private
     * @override
     */
    _initDialogInterface: function() {
        var content = new Element('div', {
            'class': 'buttonArray'
        });
        this._handlers.each(function(pair) {
            var button = new dijit.form.Button({
                'label': pair.label,
                'onClick': function(){
                    this._dialog.hide();
                    pair.handler();
                }.bind(this)
            });
            content.appendChild(button.domNode);
            content.appendChild(new Element('br'));
        }.bind(this));
        this._setContent(content);
    }
});


// vim:ts=4:sw=4:et:
