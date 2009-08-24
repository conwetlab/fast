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
             * BuildingBlock factories
             * @type Hash
             * @private
             */
            this._factories = {
                'screen': new ScreenFactory(),
                'connector': new ConnectorFactory(),
                'domainConcept': new DomainConceptFactory()
            };
            
            /**
             * Dialog to add a new screen
             * @type FormDialog
             * @private
             */
            this._addScDialog = null;
        },
        
        // **************** PUBLIC METHODS **************** //
        
        /**
         * Gets a building block factory for a given type of building blocks
         * @type BuildingBlockFactory
         * @public
         */
        getBuildingBlockFactory: function(/** String */buildingBlockType){
            return this._factories[buildingBlockType];
        },
        
        getFacts: function(){
            var onSuccess = function(response){
                var factMetadata = response.responseText.evalJSON();
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
                var domainConceptMetadata = response.responseText.evalJSON();
                this.getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT).updateBuildingBlockDescriptions(domainConceptMetadata.domainConcepts);
                var paletteController = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController();
                var domainConceptPalette = paletteController.getPalette(Constants.BuildingBlock.DOMAIN_CONCEPT);
                domainConceptPalette.paintComponents();
            }
            var onDConceptsError = function(response, e){
                console.error(e);
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.catalogueGetDomainConcepts, this, onDConceptsSuccess, onDConceptsError);
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
        },
        
        showAddScDialog: function(){
            if (this._addScDialog == null) {
                this._addScDialog = new AddScreenDialog();
            }
            this._addScDialog.show();
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
