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
/**
 * Unique ID Generator
 * @constructs
 */
var UIDGenerator = Class.create();

// **************** STATIC ATTRIBUTES **************** //

Object.extend(UIDGenerator, {
    /**
     * Next available ids
     * @type Object
     * @private
     */
    _nextIds: new Object()
});

// **************** STATIC METHODS ******************* //

Object.extend(UIDGenerator, {

    /**
     * Returns a valid new DOM Id
     * @param String element  Type of element that needs the identifier
     * @type String
     */
    generate: function (/** String */ element) {
        var sanitized = element.replace(new RegExp('\\s', 'g'), "")
                                .replace("_","");
        var nextId = this._nextIds[sanitized];

        if (!nextId){
            nextId = 1;
        }

        this._nextIds[sanitized] = nextId + 1;

        return sanitized + "_" + nextId;
    },

    /**
     * Sets the initial id for a given name
     */
    setStartId: function(/** String */ id) {
        var pieces = id.split("_");
        var name = pieces[0];
        var lastId = parseInt(pieces[1]);
        if (!this._nextIds[name] || this._nextIds[name] <= lastId) {
            this._nextIds[name] = lastId + 1;
        }
    }
});


// vim:ts=4:sw=4:et:
