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
                    'screen': new ScreenFactory()
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
