var DomainConceptComponent = Class.create(PaletteComponent, 
    /** @lends DomainConceptComponent.prototype */ {
        
    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription domainConceptBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZone, inferenceEngine) {
        $super(description, dropZone, inferenceEngine);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new DomainConceptView(this._buildingBlockDescription);
    },
    
    /**
     * Creates a new domain concept to be dragged.
     * @type DomainConceptInstance
     * @override
     */
    _createInstance: function () {     
        return new DomainConceptInstance(this._buildingBlockDescription, this._dropZone, this._inferenceEngine);
    },
    
    /**
     * Gets the title of the palette component
     * @type String
     * @private
     */
    _getTitle: function() {
        
        if (this._buildingBlockDescription['http://www.w3.org/2000/01/rdf-schema#label']) {
            var title = this._buildingBlockDescription['http://www.w3.org/2000/01/rdf-schema#label'];
            //FIXME: 
            return title.replace("@en","");           

        } else { //Extract the title from the uri
            var uri;
            if (this._buildingBlockDescription['uri']) {
                uri = this._buildingBlockDescription['uri'];
            } else {
                uri = this._extractURI(this._buildingBlockDescription['pattern']);
            }
            return this._createTitle(uri);
        }
    },
    /**
     * This function extracts an uri from a rdf pattern
     * TODO: this is the same function as FactFactory one. Extract to a common library
     * @private
     * @type String
     */
    _extractURI: function(/** String */ triplePattern) {
        if (triplePattern) {
            var pieces = triplePattern.split(" ");
            return pieces[2];
        }
        else {
            return "";
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
        //FIXME
        var result = title.replace("@en","");
        //separate identifier from its forming words
        var words = result.match(/[A-Z][a-z0-9]+|\s+[a-z][a-z0-9]*/g);
        if (words) {
            //TODO: compatibility with IE 
            //https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map#Compatibility
            words.map(function(e) {
                return e.strip();
            });
            result = words.join(" ");
        }
        return result;       
    }
});

// vim:ts=4:sw=4:et:
