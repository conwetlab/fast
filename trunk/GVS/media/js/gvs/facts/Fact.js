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
var Fact = Class.create(
    /** @lends Fact.prototype */ {

    /**
     * Describes an individual fact.
     * @constructs
     */
    initialize: function (
        /** String */ uri,
        /** String */ shortcut,
        /** String */ description
    ) {
        /**
         * Fact identifier.
         * @type String
         */
        this._uri = uri;

        /**
         * Fact shortcut.
         * @type String
         */
        this._shortcut = shortcut;

        /**
         * Brief description.
         * @type String
         */
        this._description = description;
    },

    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the fact identifier.
     * @return String
     */
    getUri: function (){
        return this._uri;
    },


    /**
     * Gets the fact shortcut.
     * @return String
     */
    getShortcut: function (){
        return this._shortcut;
    },


    /**
     * Gets the fact brief description.
     * @return String
     */
    getDescription: function (){
        return this._description;
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
