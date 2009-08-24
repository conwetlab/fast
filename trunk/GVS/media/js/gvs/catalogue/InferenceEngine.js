var InferenceEngine = Class.create( /** @lends InferenceEngine.prototype */ {
    /**
     * This class handles the reachability and recommendation of building blocks
     * It communicates with the serverside catalogue to retrieve this information
     * @constructs
     */ 
    initialize: function(/** ScreenflowDocument */parent) {
        
        /**
         * Parent document
         * @type ScreenflowDocument
         * @private @member
         */
        this._parent = parent;
    },
    

    // **************** PUBLIC METHODS **************** //

    /**
     * 
     * This function fills the initial palette based on a domain context
     * 
     */
    retrieveScreens: function (/** Array */ domainContext) {
        this.findAndCheck ([],domainContext,[],"reachability");
    },
    
    /**
     * findAndCheck
     * This function calls findAndCheck in the catalogue
     */
    findAndCheck: function (/**Array*/ canvas, /** Array */ domainContext, 
                            /** Array*/ elements,/** String*/ criteria) {
        
        /** 
         * onSuccess callback
         */
        var findAndCheckOnSuccess = function(/**XMLHttpRequest*/ transport){
            
            var result = JSON.parse(transport.responseText);
            
            var paletteElements = result.elements;         
            var canvasElements = result.canvas;          
            
            // There are elements in the canvas
            // Update the screenflow
            if (canvasElements != null && canvasElements != []){
                this._parent.updateReachability(canvasElements);
            }
            
            var screenFactory = CatalogueSingleton.getInstance().getBuildingBlockFactory (Constants.BuildingBlock.SCREEN);
            screenFactory.updateElements (domainContext,paletteElements,updateElementsCallback);
        }
        /**
         * Error handler
         */
        var findAndCheckOnError = function(transport, e){
            console.log ("Error retrieving catalogue information");
        }
        /**
         * This function is called when the metadata is stored in the BBFactory
         */
        var mine = this;
        var updateElementsCallback = function (/** Array */ screens) {
            //Paint the palette and updateReachability
            var paletteController = mine._parent.getPaletteController();
            paletteController.paintPalettes();
            paletteController.updateReachability(screens);
        }
        
        //construct the data to be sent
        var domain = {
            'tags': domainContext,
            'user':null /* TODO: add user here */
        };
        var body = {
            'canvas': canvas,
            'domainContext': domain,
            'elements': elements,
            'criterion': criteria
        };
        body = Object.toJSON(body);

        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendPost(URIs.catalogueFindAndCheck, null, body, this, findAndCheckOnSuccess, findAndCheckOnError);
    },
    /**
     * This function calls the check operation in the catalogue
     */
    check: function (/**Array*/ canvas, /** Array */ domainContext, 
                    /** Array*/ elements,/** String*/ criteria) {
        
        /**
         * onSuccess callbcak
         */
        var checkOnSuccess = function(response){
                var screenList = JSON.parse(response.responseText);
                this._parent.getPaletteController().updateReachability(screenList.elements);
                this._parent.updateReachability(screenList.canvas);
            }
            
        var checkOnError = function(transport, e){
            console.log ("Error performing check operation");
        }
        //construct the data to be sent
        var domain = {
            'tags': domainContext,
            'user':null /* TODO: add user here */
        }
        var body = {
            'canvas': canvas,
            'domainContext': domain,
            'elements': elements,
            'criterion': criteria
        };
        body = Object.toJSON(body);
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendPost(URIs.catalogueCheck, null, body, this, checkOnSuccess, checkOnError);                   
    }
    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:
