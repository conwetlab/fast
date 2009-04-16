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
var CatalogueSingleton = function() {
    /**
     * Singleton instance
     * @private @member
     */
    var instance = null;

    var Catalogue = Class.create( /** @lends CatalogueSingleton-Catalogue.prototype */ {
        /** @constructs */
        initialize: function() {
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
        getResourceFactory: function (/** String */ resourceType) {
            return this._factories[resourceType];
        },

        getFacts: function () {
            var onSuccess = function(response) {
                var responseJSON = response.responseText;
                var factMetadata = eval ('(' + responseJSON + ')');
                FactFactorySingleton.getInstance().setFacts(factMetadata);
            }
            var onError = function(response, e) {
                console.error(e);
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.catalogueGetFacts,this, onSuccess, onError);
        },
        
        getScreens: function (/**Array*/ canvas, /** Hash*/ domainContext, /** Array*/ elements,/** String*/ criteria) {

            //construct the data to be sent
            var body = {'canvas': canvas, 'domainContext': domainContext, 'elements': elements, 'criterion':criteria};
            body= Object.toJSON(body);
            //find_and_check
            this.findAndCheck(body);
        },

        findAndCheck: function (/** json*/ postData) {

            var findOnSuccess = function (transport) {
                var responseJSON = transport.responseText;
                var screenList = eval ('(' + responseJSON + ')');
                this.getMetadata(screenList.list_uris);
            }

            var findOnError = function (transport, e) {
                //TODO error handling
            }
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.catalogueFindAndCheck,this, findOnSuccess, findOnError);
        },

        getMetadata: function (/** Array*/ screenList) {

            var getDataOnSuccess = function (response) {
                var responseJSON = response.responseText;
                var screenMetadata = eval ('(' + responseJSON + ')');
                //update the Screen Factory
                this.getResourceFactory('screen').updateResourceDescriptions(screenMetadata);
                //repaint the Screen Palette
                var paletteController = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController();
                var screenPalette = paletteController.getPalette("screen");
                screenPalette.paintComponents();

                UIUtils.updateSFDocAndScreenPalette(screenList);
            }

            var getDataOnError = function (transport, e) {
                //TODO error handling
            }

            var screenUris = screenList.clone();
            // get the uris list and call get_metadata
            var screenDescriptions = this.getResourceFactory('screen').getResourceDescriptions();
            screenUris.each(function(uri, index){
                screenDescriptions.each(function(screen){
                    if (uri.uri==screen.uri) {
                        screenUris[index]=null;
                        throw $break;
                    }
                });
            });
            screenUris=screenUris.compact();

            if (screenUris.size()>0){
                //TODO get the uris from the screenList argument in order to do the get_metadata request to the catalogue
                var persistenceEngine = PersistenceEngineFactory.getInstance();
                persistenceEngine.sendGet(URIs.catalogueGetMetadata,this, getDataOnSuccess, getDataOnError);
            } else {
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().getPalette("screen").paintComponents();
                UIUtils.updateSFDocAndScreenPalette(screenList);
            }
        },

        check: function (/**Array*/ canvas, /** Hash*/ domainContext, /** Array*/ elements,/** String*/ criteria) {

            var checkOnSuccess = function (response) {
                var responseJSON = response.responseText;
                var screenList = eval ('(' + responseJSON + ')');
                UIUtils.updateSFDocAndScreenPalette(screenList.list_uris);

            }

            var checkOnError = function (transport, e) {
                //TODO error handling
            }
            //construct the data to be sent
            var body = {'canvas': canvas, 'domainContext': domainContext, 'elements': elements, 'criterion':criteria};
            body= Object.toJSON(body);
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.catalogueCheck,this, checkOnSuccess, checkOnError);

        },

        find: function (/** String*/ criteria) {
            //TODO: Remove this

            var screensOnSuccess = function (response) {
                var responseJSON = '{screen_metadata:'+response.responseText+'}';
                var screenDescriptions = eval ('(' + responseJSON + ')');
                //update the Screen Factory
                //this.getResourceFactory('screen').updateScreenDescriptions(screenDescriptions);
                //repaint the Screen Palette
                //var screenPalette = GVSSingleton.getInstance().getPaletteController().getPalette("screen");
                //screenPalette._components = screenPalette._createComponents(this.getResourceFactory("screen"));
                //screenPalette._content = screenPalette._renderContent();
                //screenPalette._node.setContent(screenPalette._content);
                //UIUtils.updateScreenPaletteReachability({screens:[{id:'http://TODO/amazonSearch', value:true}]});
            }

            var screensOnError = function (transport, e) {
                //TODO error handling
            }
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            var body = {
            'domainContext': {
                'tags': [],
                'user': null
            },
            'elements': [],
            'canvas': [{
                'uri': 'http://www.morfeoproject.eu/fast/fco#Screen1234372733636'
                }
            ]
            };
            body= Object.toJSON(body);

            persistenceEngine.sendPost(URIs.catalogueScreens, null, body, this, screensOnSuccess, screensOnError);

        }


        // **************** PRIVATE METHODS **************** //
    });
    
  
    return new function() {
        /**
         * Returns the singleton instance
         * @public
         * @type Catalogue
         */
        this.getInstance = function() {
            if (instance == null) {
                instance = new Catalogue();
            }
            return instance;
        }
    }
}();

// vim:ts=4:sw=4:et: 
