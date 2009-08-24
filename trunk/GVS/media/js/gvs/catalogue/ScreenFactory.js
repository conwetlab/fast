var ScreenFactory = Class.create(BuildingBlockFactory,
    /** @lends ScreenFactory.prototype */ {

    /**
     * Factory of screen building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

        this._buildingBlockType = Constants.BuildingBlock.SCREEN;
        this._buildingBlockName = 'Screens';
  
    },

    // **************** PUBLIC METHODS **************** //


    updateBuildingBlockDescriptions: function (screenDescriptions) {

        for (var i=0; i< screenDescriptions.length ; i++) {
            this._buildingBlockDescriptions.set(screenDescriptions[i].uri,
                                        new ScreenDescription (screenDescriptions[i]));
        }
    },

    getBuildingBlocks: function (/** Array */ screenURIs) {
        var screenDescriptions = Array();

        for (var i=0; i<screenURIs.length ; i++) {
            screenDescriptions.push (this._buildingBlockDescriptions.get(screenURIs[i]));
        }
        return screenDescriptions;
    },
    /**
     * This function retrieves the pending elements from the serverside
     * catalogue
     */
    updateElements: function (/** Array */ domainContext, /** Array */ screens, /** Function */ callback){
        /**
         * Callback function
         */
        var getDataOnSuccess = function(/**XMLHttpRequest*/ transport){
            var screenMetadata = transport.responseText.evalJSON();
            //update the Screen Factory
            this.updateBuildingBlockDescriptions(screenMetadata.screens);
            //call the callback function passed as argument
            callback(screens);
        }
        
        var getDataOnError = function(transport, e){
            console.log("getMetadataError");
            //TODO error handling
        }
        
        //URIs not already retrieved
        var mine = this;
        var pendingURIs = new Array();
        $A(screens).each (function (screen){
           if (mine._buildingBlockDescriptions.get(screen.uri) == null){
             pendingURIs.push (screen.uri);  
           } 
        });
        if (pendingURIs.size() > 0) {
            var postData = pendingURIs;
            postData = Object.toJSON(postData);
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(URIs.catalogueGetMetadata, null, postData, this, getDataOnSuccess, getDataOnError);
        }
        else {
            callback(screens);
        }       
    }
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et: 
