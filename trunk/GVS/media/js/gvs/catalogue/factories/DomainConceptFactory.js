var DomainConceptFactory = Class.create(BuildingBlockFactory,
    /** @lends DomainConceptFactory.prototype */ {

    /**
     * Factory of domain concept building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();
        
    },

    /**
     * Gets the type of building block this factory mades.
     * @type String
     * @override
     */
    getBuildingBlockType: function (){
        return Constants.BuildingBlock.DOMAIN_CONCEPT;
    },

    // **************** PUBLIC METHODS **************** //
    /**
     * @override
     */
    getBuildingBlocks: function(/** Array */ tags, /** Function */ callback){
        var url = this._createUrl(tags);
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendGet(url,
                {
                    'callback': callback
                },
                this._onSuccess, this._onError);
    },
   
    // **************** PUBLIC METHODS **************** //
    
    _createUrl: function(/** Array */ tags){
        if (tags.size() > 0) {
            var processedTags = tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join("+");
            return URIs.catalogueTagConcepts.replace('<tags>', processedTags);
        } else {
            return URIs.catalogueAllConcepts;
        }
    },
    
    _onSuccess: function (/** XMLHttpRequest */ transport) {
        var metadata = transport.responseText.evalJSON();
        var result = new Array();
        
        $A(metadata).each(function(conceptProperties) {
            result.push(new BuildingBlockDescription(conceptProperties));
        });
        this.callback(result);
    },
    
    _onError: function (/**XMLHttpRequest*/ transport, /** Exception */ e) {
        Logger.serverError(transport, e);
    }
    
});

// vim:ts=4:sw=4:et: 
