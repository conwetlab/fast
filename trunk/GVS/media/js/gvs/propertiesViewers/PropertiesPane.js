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
var PropertiesPane = Class.create( /** @lends PropertiesPane.prototype */ {
    /**
     * This class handles the properties pane
     * @constructs
     */
    initialize: function(/** DOMNode */ parentNode) {
        /**
         * Variable
         * @type Table
         * @private @member
         */
        this._propertiesTable = new Table(parentNode, 'Properties', 'left');

        this._propertiesTable.insertFieldTitles(['Property','Value']);

    },


    // **************** PUBLIC METHODS **************** //


    /**
     * This function updates the table with data coming from
     * the currently selected element
     * @param element
     *          Something implementing TableModel interface
     *              * String getTitle()
     *              * Array getInfo()
     *              * Array getTriggerMapping(): Optional method
     */
    fillTable: function (/** Object */ element) {
        this._clearElement();

        var title = element.getTitle();

        this._propertiesTable.insertDataValues(element.getInfo());
        this._propertiesTable.setTitle((title ? 'Properties of '  + title : 'Properties'));
    },

    /**
     * This function add a new section to the table, without removing the actual
     * data. A section is a title row, and values
     */
    addSection: function (/** Array */ title, /** Hash */ values) {
        this._propertiesTable.insertFieldTitles(title);
        this._propertiesTable.insertDataValues(values);
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This function empties the table
     * @private
     */
    _clearElement: function (){
        this._propertiesTable.emptyTable();
        this._propertiesTable.setTitle('Properties');
        this._propertiesTable.insertFieldTitles(['Property','Value']);
    }


});

// vim:ts=4:sw=4:et:
