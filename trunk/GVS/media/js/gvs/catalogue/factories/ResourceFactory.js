var ResourceFactory = Class.create(BuildingBlockFactory,
    /** @lends ResourceFactory.prototype */ {

    /**
     * Factory of resource & service building blocks.
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
        return Constants.BuildingBlock.RESOURCE;
    },

    // **************** PUBLIC METHODS **************** //
    /**
     * @override
     */
    getBuildingBlocks: function(/** Array */ domainContext, /** Function */ callback){
        var url = this._createUrl(domainContext);
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendGet(url,
                {
                    'callback': callback
                },
                this._onSuccess, this._onError);
    },
   
    // **************** PUBLIC METHODS **************** //
    
    _createUrl: function(/** Array */ domainContext){
        if (domainContext.size() > 0) {
            var tags = domainContext.join('+');
            return URIs.catalogueTagConcepts.replace('<tags>', tags);
        } else {
            return URIs.catalogueAllConcepts;
        }
    },
    
    _onSuccess: function (/** XMLHttpRequest */ transport) {
        var metadata = transport.responseText.evalJSON();
        var result = new Array();
        
        $A(metadata).each(function(operatorProperties) {
            result.push(new ResourceDescription(operatorProperties));
        });
        this.callback(result);
    },
    
    _onError: function (/**XMLHttpRequest*/ transport, /** Exception */ e) {
        Logger.serverError(transport, e);
    }
    
});

// vim:ts=4:sw=4:et: 
