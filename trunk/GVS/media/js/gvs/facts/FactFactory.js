/**
 * <p>This class implements the Singleton Design Pattern to make sure there is 
 * only one instance of the class FactFactory.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var instance = FactFactorySingleton.getInstance();
 */ 
var FactFactorySingleton = function() {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;
    

    var FactFactory = Class.create(
        /** @lends FactFactorySingleton-FactFactory.prototype */ {

        /**
         * This class is used to retrieve facts.
         * @constructs
         */
        initialize: function() {
            /**
             * Cached facts.
             * TODO: get the facts from the catalogue.
             * @type Hash
             * @private @member
             */
            this._cachedFacts = {
                    "http://TODO/amazon#filter": new Fact("http://TODO/amazon#filter", "F", "Filter Search Criteria"),
                    "http://TODO/amazon#item":   new Fact("http://TODO/amazon#item",   "I", "Amazon item fact. Normally, its identifier will be an ASIN number"),
                    "http://TODO/amazon#shoppingCart": new Fact("http://TODO/amazon#shoppingCart", "C", "Amazon shopping cart fact. It represents a non-purchased shopping cart at Amazon"),
                    "http://TODO/amazon#purchase": new Fact("http://TODO/amazon#purchase", "P", "Amazon purchase fact. It represents the URL that allows to purchase the Shopping Cart"),
                    "http://TODO/ebay#item":     new Fact("http://TODO/ebay#item", "EI", "eBay Item. It represents an Item selled by eBay")
            };
        },
        

        // **************** PUBLIC METHODS **************** //
        

        /**
         * Gets a fact identified by uri.
         * @type ResourceDescription
         * @public
         */
        getFact: function (/** String */ uri) {
            return this._cachedFacts[uri];
        },

        
        /**
         * Gets the root node of a icon for a give fact identified by uri.
         * @param String uri   Fact Resource identifier
         * @param String size  Icon size ("small"|"medium"|"big")
         * @type FactIcon
         */
        getFactIcon: function (/** String */ uri, /** String */ size) {
            var fact = this.getFact(uri);
            return new FactIcon(fact, size);
        }

        
        // **************** PUBLIC METHODS **************** //
    });
    

    return new function(){
        /**
         * Returns the singleton instance
         * @public
         * @type FactFactory
         */
        this.getInstance = function(){
            if (_instance == null) {
                _instance = new FactFactory();
            }
            return _instance;
        }
    }
}();

// vim:ts=4:sw=4:et:
