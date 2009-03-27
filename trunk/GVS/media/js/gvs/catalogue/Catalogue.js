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

        get_screens: function (/**Array*/ canvas, /** Hash*/ domainContext, /** Array*/ elements,/** String*/ criteria) {

            //construct the data to be sent
            var body = {'canvas': canvas, 'domainContext': domainContext, 'elements': elements, 'criterion':criteria};
            body= Object.toJSON(body);
            //find_and_check
            this.find_and_check(body);
        },

        find_and_check: function (/** json*/ postData) {

            var screensOnSuccess = function (response) {
                var responseJSON = response.responseText;
                var screenList = eval ('(' + responseJSON + ')');
                // get the uris list and call get_metadata
                this.get_metadata(screenList.list_uris);
            }

            var screensOnError = function (transport, e) {
                //TODO tratar errores
                UIUtils.prueba=e;
            }
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.send_get(URIs.CATALOGUE_FIND_AND_CHECK,this, screensOnSuccess, screensOnError);
        },

        get_metadata: function (/** Array*/ screenList) {

            var screensOnSuccess = function (response) {
                var responseJSON = response.responseText;
                var screenMetadata = eval ('(' + responseJSON + ')');
                //update the Screen Factory
                this.getResourceFactory('screen').updateScreenDescriptions(screenMetadata);
                //repaint the Screen Palette
                var paletteController = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController();
                var screenPalette = paletteController.getPalette("screen");
                screenPalette.paintComponents();

                UIUtils.updateSFDocAndScreenPalette(screenList);
            }

            var screensOnError = function (transport, e) {
                //TODO tratar errores
                UIUtils.prueba=e;
            }

            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.send_get(URIs.CATALOGUE_GETMETADATA,this, screensOnSuccess, screensOnError);

        },

        check: function (/**Array*/ canvas, /** Hash*/ domainContext, /** Array*/ elements,/** String*/ criteria) {

            var screensOnSuccess = function (response) {
                var responseJSON = response.responseText;
                var screenList = eval ('(' + responseJSON + ')');
                UIUtils.updateSFDocAndScreenPalette(screenList.list_uris);

            }

            var screensOnError = function (transport, e) {
                //TODO tratar errores
                UIUtils.prueba=e;
            }
            //construct the data to be sent
            var body = {'canvas': canvas, 'domainContext': domainContext, 'elements': elements, 'criterion':criteria};
            body= Object.toJSON(body);
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.send_get(URIs.CATALOGUE_CHECK,this, screensOnSuccess, screensOnError);

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
                //UIUtils.prueba=e;
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

            persistenceEngine.send_post(URIs.CATALOGUE_SCREENS, null, body, this, screensOnSuccess, screensOnError);

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
