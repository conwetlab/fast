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
var PrePostDescription = Class.create(BuildingBlockDescription,
    /** @lends PrePostDescription.prototype */ {

    /**
     * Pre/Post building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);
    },

    // ****************** PUBLIC METHODS ******************* //

    clone: function(){
        return new PrePostDescription(this.toJSON());
    },

    /*
     * @override
     */
    getOrder: function() {
        return FactFactory.getFactShortcut(this);
    },

    /**
     * Overriding getTitle.
     * @type String
     */
    getTitle: function() {
        if (!this.title) {
            this._updateTitle();
        }
        return this.title;
    },

    /**
     * Generates the PrePost uri if doesn't have it
     */
    generateUri: function() {
        if (this.uri == undefined) {
            if (this.pattern) {
                this.uri = this.pattern.split(" ")[2];
            }
        }
    },

    getUriShortcut: function() {
        var uri;
        if (this.uri) {
            uri = this.uri;
        } else {
            uri = Utils.extractURIfromPattern(this.pattern);
        }
        if (uri) {
            var pieces = uri.split("#");
            var identifier = "";
            if (pieces.length > 1){
                identifier = pieces[1];
            }
            else { //The uri has not identifier, try the last part of the url
                pieces = uri.split("/");
                identifier = pieces[pieces.length - 1];
            }
            return identifier;
        } else {
            return "Concept";
        }
    },

    // ******************** PRIVATE METHODS ************** //

    /**
     * Creates the title of the palette component
     * @type String
     * @private
     */
    _updateTitle: function() {

        if (this['http://www.w3.org/2000/01/rdf-schema#label']) {
            this.title =
                 this['http://www.w3.org/2000/01/rdf-schema#label'].
                 replace("@en","");

        } else if (this['label']) {
            var languages = $H(this['label']).keys();
            if (languages.size() == 1) {
                this.title = this['label'][languages[0]];
            } else if (this['label']['en']) {
                this.title = this['label']['en'];
            } else {
                this.title = "Concept";
            }
        } else { // Extract the title from the uri
            this.title = this._createTitle();
        }
    },


    /**
     * This function creates a title from the uri identifier
     * @private
     * @type String
     */
    _createTitle: function() {
        return this._sanitizeTitle(this.getUriShortcut());
    },

    /**
     * This function returns a human-readable title from an
     * identifier
     * @private
     * @type String
     */
    _sanitizeTitle: function (/** String */ title) {
        //FIXME: I18NString
        var result = title.replace("@en","");
        //separate identifier from its forming words
        var words = result.match(/[A-Z][a-z0-9]+|\s+[a-z][a-z0-9]*/g);
        if (words) {
            words.map(function(e) {
                return e.strip();
            });
            result = words.join(" ");
        }
        return result;
    }

});

// vim:ts=4:sw=4:et:
