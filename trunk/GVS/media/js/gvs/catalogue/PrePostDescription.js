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

    // ******************** PRIVATE METHODS ************** //

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
            } else {
                // TODO: What to do here?
            }
        } else { // Extract the title from the uri
            var uri;
            if (this.uri) {
                uri = this.uri;
            } else {
                uri = Utils.extractURIfromPattern(this.pattern);
            }
            this.title = this._createTitle(uri);
        }
    },


    /**
     * This function creates a title from the uri identifier
     * @private
     * @type String
     */
    _createTitle: function(/** String */ uri) {
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
            return this._sanitizeTitle(identifier);
        } else {
            return "Unknown Domain Concept";
        }
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
