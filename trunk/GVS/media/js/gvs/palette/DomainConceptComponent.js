var DomainConceptComponent = Class.create(PaletteComponent, 
    /** @lends DomainConceptComponent.prototype */ {
        
    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription domainConceptBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
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
        return new PrePostInstance(this._buildingBlockDescription, this._inferenceEngine);
    },
    
    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        if (!this._buildingBlockDescription.title) {
            this._updateTitle();
        }
        return this._buildingBlockDescription.title;
    },
    
    /**
     * Creates the title of the palette component
     * @type String
     * @private
     */
    _updateTitle: function() {
        
        if (this._buildingBlockDescription['http://www.w3.org/2000/01/rdf-schema#label']) {
            this._buildingBlockDescription.title = 
                        this._buildingBlockDescription['http://www.w3.org/2000/01/rdf-schema#label'].
                        replace("@en","");      

        } else { //Extract the title from the uri
            var uri;
            if (this._buildingBlockDescription['uri']) {
                uri = this._buildingBlockDescription['uri'];
            } else {
                uri = Utils.extractURIfromPattern(this._buildingBlockDescription['pattern']);
            }
            this._buildingBlockDescription.title = this._createTitle(uri);
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
