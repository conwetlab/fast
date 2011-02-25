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
 * This class is used to create facts representations.
 * @constructs
 */
var FactFactory = Class.create();

// **************** STATIC ATTRIBUTES **************** //

Object.extend(FactFactory, {
    /**
     * Cached facts.
     * @type Hash
     * @private
     */
    _cachedFacts: new Hash(),

    /**
     * This array stores the shortcuts
     * being used in the execution
     * @type Array
     * @private
     */
    _cachedShortcuts: new Array()
});

// **************** STATIC METHODS ******************* //

Object.extend(FactFactory, {

    /**
     * Gets the root node of a icon for a give fact identified by uri.
     * @param String size  Icon size ("inline"|"embedded"|"standalone")
     * @type FactIcon
     */
    getFactIcon: function (/** Object */ factData, size) {
        var fact = this._getFact(factData);
        return new FactIcon(fact, size);
    },

    /**
     * Gets the fact uri
     * @type String
     */
    getFactUri: function (/** Object */ factData) {
        var uri;
        if (factData.uri) {
            uri = factData.uri;
        } else if (factData.pattern) {
            uri = Utils.extractURIfromPattern(factData.pattern);
        }
        else { //We don't know the uri
            uri = "http://unknown.uri#?";
        }
        return uri;
    },

    /**
     * Returns the fact Shortcut
     * @type String
     */
    getFactShortcut: function (/** Object */ factData) {
        var fact = this._getFact(factData);
        return fact.getShortcut();
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Gets a fact
     * @type Fact
     * @private
     */
    _getFact: function (/** Object */ factData) {

        var uri = this.getFactUri(factData);

        //The fact didn't exist, create a new one
        if(this._cachedFacts.get(uri)==null){
                this._cachedFacts.set(uri, new Fact(uri,
                    this._extractShortcut(uri), this._extractDescription(factData)));
        }
        return this._cachedFacts.get(uri);
    },


    /**
     * This function returns a shortcut coming from the URI
     * TODO: Add more criteria to determine the shortcut
     * @type String
     * @private
     */
    _extractShortcut: function(/** String */ uri) {
        var pieces = uri.split("#");
        var identifier = "";
        if (pieces.length > 1){
            identifier = pieces[1];
        } else { //The uri has not identifier, try the last part of the url
            pieces = uri.split("/");
            identifier = pieces[pieces.length - 1];
        }

        identifier = identifier.substr(0, 1).toUpperCase() + identifier.substr(1);

        //Let's try with capital letters...
        var letters = identifier.match(/[A-Z]/g);
        if (letters && letters.length > 1) { //More than one capital letter
            //try only with 2 letters
            //Put the second letter in lower case
            //letters[1]= letters[1].toLowerCase();
            shortcut = letters.slice(0, 2).join("");

            if (this._cachedShortcuts.indexOf(shortcut) == -1) {
                this._cachedShortcuts.push(shortcut);
                return shortcut;
            }
        }

        //Let's try with the first two letters
        identifier[1]= identifier[1].toLowerCase();
        var shortcut = identifier.slice(0,2);
        if (this._cachedShortcuts.indexOf(shortcut) == -1){
            this._cachedShortcuts.push(shortcut);
            return shortcut;

        }
        //If none of the above have worked out, show the first letter
        //Despite they have been used before
        shortcut = identifier.slice(0, 1);
        return shortcut;
    },

    /**
     * This function extract the description from fact or concept metadata
     * @private
     * @type String
     */
    _extractDescription: function(/** Object */ factData) {
        if(factData.label && factData.label['en-gb']) {
            return factData.label['en-gb'];
        }
        var comment = factData["http://www.w3.org/2000/01/rdf-schema#comment"];
        if(comment) {
            return comment.replace("@en","");
        }
        var label = factData["http://www.w3.org/2000/01/rdf-schema#label"];
        if(label) {
            return label.replace("@en","");
        }
    }
});

// vim:ts=4:sw=4:et:
