/**
 * <p>This class implements the Singleton Design Pattern to make sure there is
 * only one instance of the class Catalogue.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var instance = CatalogueSingleton.getInstance();
 */
var CatalogueSingleton = function(){
    /**
     * Singleton instance
     * @private @member
     */
    var instance = null;
    
    var Catalogue = Class.create( /** @lends CatalogueSingleton-Catalogue.prototype */{
        /** @constructs */
        initialize: function(){
            /**
             * Resource factories
             * @type Hash
             * @private
             */
            this._factories = {
                'screen': new ScreenFactory(),
                'connector': new ConnectorFactory(),
                'domainConcept': new DomainConceptFactory()
            };
        },
        
        // **************** PUBLIC METHODS **************** //
        
        /**
         * Gets a resource factory for a given type of resources
         * @type ResourceFactory
         * @public
         */
        getResourceFactory: function(/** String */resourceType){
            return this._factories[resourceType];
        },
        
        getFacts: function(){
            var onSuccess = function(response){
                var responseJSON = response.responseText;
                var factMetadata = eval('(' + responseJSON + ')');
                FactFactorySingleton.getInstance().setFacts(factMetadata);
            }
            var onError = function(response, e){
                console.error(e);
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.catalogueGetFacts, this, onSuccess, onError);
        },
        
        getDomainConcepts: function(){
            var onDConceptsSuccess = function(response){
                var responseJSON = response.responseText;
                var domainConceptMetadata = eval('(' + responseJSON + ')');
                this.getResourceFactory('domainConcept').updateResourceDescriptions(domainConceptMetadata.domainConcepts);
                var paletteController = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController();
                var domainConceptPalette = paletteController.getPalette("domainConcept");
                domainConceptPalette.paintComponents();
            }
            var onDConceptsError = function(response, e){
                console.error(e);
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.catalogueGetDomainConcepts, this, onDConceptsSuccess, onDConceptsError);
        },
        
        getScreens: function(/**Array*/canvas, /** Hash*/ domainContext, /** Array*/ elements,/** String*/ criteria){
        
            //construct the data to be sent
            var body = {
                'canvas': canvas,
                'domainContext': domainContext,
                'elements': elements,
                'criterion': criteria
            };
            body = Object.toJSON(body);
            
            //find_and_check
            this.findAndCheck(body);
        },
        
        findAndCheck: function(/** json*/postData){
            var findAndCheckOnSuccess = function(transport){
                var responseJSON = transport.responseText;
                var screenList = eval('(' + responseJSON + ')');
                
                var listElements = screenList.elements;
                this.getMetadataAndCheckPalette(listElements);
                
                var listCanvas = screenList.canvas;
                //TODO: interchange next lines?
                //this.getMetadataAndCheckCanvas(listCanvas);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(listCanvas);
            }
            
            var findAndCheckOnError = function(transport, e){
                //TODO error handling
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(URIs.catalogueFindAndCheck, null, postData, this, findAndCheckOnSuccess, findAndCheckOnError);
        },
        
        getMetadataAndCheckPalette: function(/**Array*/listElements){
            var getDataOnSuccess = function(response){
                var responseJSON = response.responseText;
                var screenMetadata = eval('(' + responseJSON + ')');
                //update the Screen Factory
                this.getResourceFactory('screen').updateResourceDescriptions(screenMetadata.screens);
                //repaint the Screen Palette
                var paletteController = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController();
                var screenPalette = paletteController.getPalette("screen");
                screenPalette.paintComponents();
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(listElements);
            }
            
            var getDataOnError = function(transport, e){
                console.log("getMetadataError");
                //TODO error handling
            }
            
            var listElementUris = new Array();
            for (var i = 0; i < listElements.length; i++) {
                listElementUris.push(listElements[i].uri);
            }
            
            var newListElements = listElementUris.clone();
            // get the uris list and call get_metadata
            var screenDescriptions = this.getResourceFactory('screen').getResourceDescriptions();
            newListElements.each(function(uri, index){
                screenDescriptions.each(function(screen){
                    if (uri == screen.uri) {
                        newListElements[index] = null;
                        throw $break;
                    }
                });
            });
            
            newListElements = newListElements.compact();
            if (newListElements.size() > 0) {
                //TODO get the uris from the screenList argument in order to do the get_metadata request to the catalogue
                var postData = newListElements;
                postData = Object.toJSON(postData);
                var persistenceEngine = PersistenceEngineFactory.getInstance();
                persistenceEngine.sendPost(URIs.catalogueGetMetadata, null, postData, this, getDataOnSuccess, getDataOnError);
            }
            else {
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().getPalette("screen").paintComponents();
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(listElements);
            }
        },
        
        getMetadataAndCheckCanvas: function(/**Array*/listCanvas){
            var getDataOnSuccess = function(response){
                console.log("getMetadataSuccess");
                var responseJSON = response.responseText;
                var screenMetadata = eval('(' + responseJSON + ')');
                console.log(screenMetadata);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(listCanvas);
            }
            
            var getDataOnError = function(transport, e){
                console.log("getMetadataError");
                //TODO error handling
            }
            var listElementUris = new Array();
            for (var i = 0; i < listCanvas.length; i++) {
                listElementUris.push(listCanvas[i].uri);
            }
            
            var newListElements = listElementUris.clone();
            // get the uris list and call get_metadata
            var screenDescriptions = this.getResourceFactory('screen').getResourceDescriptions();
            newListElements.each(function(uri, index){
                screenDescriptions.each(function(screen){
                    if (uri.uri == screen.uri) {
                        newListElements[index] = null;
                        throw $break;
                    }
                });
            });
            newListElements = newListElements.compact();
            if (newListElements.size() > 0) {
                //TODO get the uris from the screenList argument in order to do the get_metadata request to the catalogue
                var postData = newListElements;
                postData = Object.toJSON(postData);
                var persistenceEngine = PersistenceEngineFactory.getInstance();
                persistenceEngine.sendPost(URIs.catalogueGetMetadata, null, postData, this, getDataOnSuccess, getDataOnError);
            }
            else {
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(listCanvas);
            }
        },
        
        // FIXME: Adequate this method for Find requests
        getMetadata: function(/** Array*/screenUris){
            var getDataOnSuccess = function(response){
                console.log("getMetadataSuccess");
                var responseJSON = response.responseText;
                var screenMetadata = eval('(' + responseJSON + ')');
                console.log(screenMetadata);
                //update the Screen Factory
                this.getResourceFactory('screen').updateResourceDescriptions(screenMetadata.screens);
                //repaint the Screen Palette
                var paletteController = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController();
                var screenPalette = paletteController.getPalette("screen");
                screenPalette.paintComponents();
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(screenUris);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(screenUris);
            }
            
            var getDataOnError = function(transport, e){
                console.log("getMetadataError");
                //TODO error handling
            }
            
            var newScreenUris = screenUris.clone();
            // get the uris list and call get_metadata
            var screenDescriptions = this.getResourceFactory('screen').getResourceDescriptions();
            newScreenUris.each(function(uri, index){
                screenDescriptions.each(function(screen){
                    if (uri.uri == screen.uri) {
                        newScreenUris[index] = null;
                        throw $break;
                    }
                });
            });
            newScreenUris = newScreenUris.compact();
            if (newScreenUris.size() > 0) {
                //TODO get the uris from the screenList argument in order to do the get_metadata request to the catalogue
                var postData = newScreenUris;
                postData = Object.toJSON(postData);
                var persistenceEngine = PersistenceEngineFactory.getInstance();
                persistenceEngine.sendPost(URIs.catalogueGetMetadata, null, postData, this, getDataOnSuccess, getDataOnError);
            }
            else {
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().getPalette("screen").paintComponents();
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(screenUris);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(screenUris);
            }
        },
        
        check: function(/**Array*/canvas, /** Hash*/ domainContext, /** Array*/ elements,/** String*/ criteria){
        
            var checkOnSuccess = function(response){
                var responseJSON = response.responseText;
                var screenList = eval('(' + responseJSON + ')');
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(screenList.elements);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(screenList.canvas);
            }
            
            var checkOnError = function(transport, e){
                //TODO error handling
            }
            //construct the data to be sent
            var body = {
                'canvas': canvas,
                'domainContext': domainContext,
                'elements': elements,
                'criterion': criteria
            };
            body = Object.toJSON(body);
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(URIs.catalogueCheck, null, body, this, checkOnSuccess, checkOnError);
        },
        
        // TODO: When is this method useful?
        find: function(/** json*/postData){
        
            var findOnSuccess = function(response){
                var responseJSON = response.responseText;
                var listUris = eval('(' + responseJSON + ')');
                console.log("FindSuccess");
                console.log(listUris);
                this.getMetadata(listUris);
            }
            
            var findOnError = function(transport, e){
                //TODO error handling
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(URIs.catalogueFind, null, postData, this, findOnSuccess, findOnError);
            
        },
        
        createScreen: function(/**String*/screenJson){
            var createScreenOnSuccess = function(response){
                var responseJSON = response.responseText;
                var screen = eval('(' + responseJSON + ')');
                //FIXME the catalogue should response with an http error
                if (screen.uri == undefined || screen.uri == null) {
                    console.log("createScreenOnError");
                    alert("Server error in the Screen creation");
                }
                else {
                    var alertMsg = "Screen correctly created!\nLabel: " + screen.label['en-GB'] + "\nURI: " + screen.uri;
                    alert(alertMsg);
                }
            }
            
            var createScreenOnError = function(transport, e){
                alert(e.message);
                //TODO error handling
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(URIs.catalogueCreateScreen, null, screenJson, this, createScreenOnSuccess, createScreenOnError);
        }
        
        
        // **************** PRIVATE METHODS **************** //
    });
    
    
    return new function(){
        /**
         * Returns the singleton instance
         * @public
         * @type Catalogue
         */
        this.getInstance = function(){
            if (instance == null) {
                instance = new Catalogue();
            }
            return instance;
        }
    }
}();

// vim:ts=4:sw=4:et: 
