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
var GalleryDialog = Class.create(FormDialog, /** @lends GalleryDialog.prototype */ {
    /**
     * This class handles dialogs with a gallery (a table) of elements
     * Any descendant must use this class as follows:
     *      It must call to _setFields, _setButtons and _addRows, before calling
     *      _render, which will be the method that builds the interface, using
     *      the information that has been stated in the previous methods.
     * TODO: Add pagination
     * @abstract
     * @extends FormDialog
     * @constructs
     */
    initialize: function($super, /** String */ title,
                        /** Object (Optional) */ _properties) {
        $super({
            'title': title,
            'style': 'display:none;'
        }, {
            'buttonPosition': FormDialog.POSITION_TOP
        });

        var properties = Utils.variableOrDefault(_properties, {});

        /**
         * Hash of properties of the gallery
         * @type Hash
         * @private
         */
        this._properties = new Hash();


        // Assigning the passed parameters, or defaults
        this._properties.set('showTitleRow', (properties.showTitleRow || false));
        this._properties.set('elementsPerPage', (properties.elementsPerPage || 10));
        this._properties.set('onDblClick', (properties.onDblClick || function(){}));
        // Disable all the events if the selected row is not valid
        this._properties.set('disableIfNotValid', (properties.disableIfNotValid || false));
        this._properties.set('showAll', (properties.showAll !== undefined ?
        properties.showAll : true));

        /**
         * Table fields
         * @type Array
         * @private
         */
        this._fields = null;

        /**
         * Buttons that will be shown when an element is clicked
         * @type Array
         * @private
         */
        this._buttons = null;

        /**
         * List of buttons that will be disabled if the selected row
         * is not valid
         * @type Array
         * @private
         */
        this._disabledButtons = new Array();

        /**
         * List of rows
         * @type Array
         * @private
         */
        this._rows = new Array();

        /**
         * Currently selected row
         * @type Object
         * @private
         */
        this._selectedRow = null;

        /**
         * Show all elements
         * @type Boolean
         * @private
         */
        this._showAll = false;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function() {
        // Do nothing. To be overriden
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Set the field list
     * Each of the fields is an object with the following structure:
     *  * String title. Field human readable title
     *  * Boolean hidden. The field won't be shown in the interface
     *  * String className. CSS class that will be applied to the whole
     *                  column
     * @private
     */
    _setFields: function (/** Array */ fields) {
        this._fields = fields;
    },

    /**
     * Set the button list.
     * Each element is an object with the following structure:
     *  * String value: Text of the button
     *  * Function handler: function which will be called when the button
     *              is clicked. The function will receive the key value of
     *              the selected element
     * @private
     */
    _setButtons: function(/** Array */ buttons) {
        this._buttons = buttons;
    },

    /**
     * Adds a new row to the gallery.
     * It has to be an Object with this structure:
     *    * String key: key of the row
     *    * Array values: List with all the fields. Each of them must be
     *                    a String or a DOM node
     * @private
     */
    _addRow: function(/** Object */ row) {
        this._rows.push(row);
    },

    /**
     * Builds the user interface, using the gathered information
     * @private
     */
    _render: function(/** Boolean(Optional) */ _loadAll) {
        var loadAll = Utils.variableOrDefault(_loadAll, true);

        var content = new Element('div', {
            'class': 'gallery'
        });

        if (this._properties.get("showTitleRow")) {
            // TODO
        }

        var lastSelectedRowKey = this._selectedRow && this._selectedRow['key'];
        this._selectedRow = null;

        if (loadAll && this._rows.size() > 0) {
            this._removeButtons();
            this._buttons.each(function(button){
                var buttonWidget = this._addButton(button.value, function() {
                    button.handler(this._selectedRow.key);
                }.bind(this));
                if (!button.enableWhenAll && this._showAll) {
                    this._disabledButtons.push({"widget": buttonWidget,
                    "disabled": true});
                } else if (button.disableIfNotValid) {
                    this._disabledButtons.push({"widget": buttonWidget});
                }
            }.bind(this));
        }

        this._rows.each(function(row) {
            var rowNode = new Element('div', {
                'class': 'row'
            });

            for (var i=0, rValues = row.values; i < rValues.size(); i++) {
                if (!this._fields[i].hidden) {
                    var field = new Element('div',{
                        'class': "field " + this._fields[i].className
                    }).update(rValues[i]);
                    rowNode.appendChild(field);
                }
            }

            var selectRow = function() {
                this._unselectElements();
                this._selectedRow = row;
                rowNode.addClassName("selected");
                for (var i = 0; i < this._disabledButtons.length; i++) {
                    this._disabledButtons[i].widget.attr('disabled', ! row.isValid);
                    if (this._disabledButtons[i].disabled) {
                        this._disabledButtons[i].widget.attr('disabled', true);
                    }
                }
            }.bind(this);

            rowNode.observe('click', selectRow);

            if (this._properties.get('onDblClick') &&
               (! this._properties.get('disableIfNotValid') || row.isValid))
            {
                rowNode.observe('dblclick', function() {
                    if (!this._showAll) {
                        this._properties.get('onDblClick')(row.key);
                    }
                }.bind(this));
            }

            if (lastSelectedRowKey == row.key) {
                selectRow();
            }

            content.appendChild(rowNode);
        }.bind(this));



        if (this._rows.size() == 0) {
            var info = new Element("div", {
                'class': 'info'
            }).update("Uppss....Nothing here");
            content.appendChild(info);
            this._removeButtons();
            this._addButton("Close", this._dialog.hide.bind(this._dialog));
        } else if (! this._selectedRow &&
                   ! this._properties.get("showTitleRow") &&
                   content.firstChild)
        {
            content.firstChild.addClassName("selected");
            var row = this._selectedRow = this._rows[0];
            for (var i = 0; i < this._disabledButtons.length; i++) {
                this._disabledButtons[i].widget.attr('disabled', ! row.isValid);
                if (this._disabledButtons[i].disabled) {
                    this._disabledButtons[i].widget.attr('disabled', true);
                }
            };
        }

        this._setContent(content);
        this._contentNode.appendChild(this._createSearchBar());
        if (this._properties.get("showAll")) {
            this._contentNode.appendChild(this._createLoadAll());
        }
    },

    /**
     * Unselect all elements
     * @private
     */
    _unselectElements: function() {
            $$('.gallery .row.selected').each(function(node) {
                node.removeClassName("selected");
            });
            this._disabledButtons.each(function(button) {
                button.widget.attr('disabled', true);
            });
            this._selectedRow = null;
    },

    /**
     * Create the search bar
     * @private
     * @type HTMLNode
     */
    _createSearchBar: function() {
        var unselectElements = this._unselectElements.bind(this);
        var searchBar = new Element('div', {'class':'searchBar'});
        searchBar.style.marginTop = '3px';
        var searchBox = new PaletteSearchBox();
        searchBox.addEventListener(function(obj, value) {
            var searchValue = value.toLowerCase();
            var elements = $$('.gallery .row .field.name');
            elements.each(function(elem){
                var text = elem.textContent.toLowerCase();
                if (searchValue.blank() || text.match(searchValue)) {
                    elem.parentNode.show();
                } else {
                    var row =elem.parentNode;
                    row.hide();
                    if (row.hasClassName('selected')) {
                        unselectElements();
                    }
                }
            });
        });

        searchBar.appendChild(searchBox.getDOMNode());
        return searchBar;
    },

    /**
     * Create loadAll section
     * @private
     */
    _createLoadAll: function() {
        var node = new Element("div", {
            "class": "loadAll"
        });
        var text = new Element("span").update("Show others' building blocks ");
        node.appendChild(text);

        var checkBox = new dijit.form.CheckBox({
            name: 'all',
            checked: this._showAll,
            onChange: function(b) {
                this._showAll = !this._showAll;
                this._reload();
            }.bind(this)
        });
        node.appendChild(checkBox.domNode);

        return node;
    },

    /**
     * Empty the list of rows
     * @private
     */
    _emptyRows: function() {
        this._rows = new Array();
    },

    /**
     * Function called when the content is loaded
     * @private
     */
    _show: function() {
        this._initDialogInterface();
        GVS.setEnabled(false);
        this._dialog.show();
    }
});

// vim:ts=4:sw=4:et:
