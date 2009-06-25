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
            this._cachedFacts = new Hash();
            
            // This is the old hardcoded structure, kept because of the temporary nature of the solution
            /*
            this._cachedFacts = {
                    "http://TODO/amazon#filter": new Fact("http://TODO/amazon#filter", "F", "Filter Search Criteria"),
                    "http://TODO/amazon#item":   new Fact("http://TODO/amazon#item",   "I", "Amazon item fact. Normally, its identifier will be an ASIN number"),
                    "http://TODO/amazon#shoppingCart": new Fact("http://TODO/amazon#shoppingCart", "C", "Amazon shopping cart fact. It represents a non-purchased shopping cart at Amazon"),
                    "http://TODO/amazon#purchase": new Fact("http://TODO/amazon#purchase", "P", "Amazon purchase fact. It represents the URL that allows to purchase the Shopping Cart"),
                    "http://TODO/ebay#item":     new Fact("http://TODO/ebay#item", "EI", "eBay Item. It represents an Item selled by eBay")
            };
            */
        },
        
        // **************** PUBLIC METHODS **************** //
        
        /**
         * Gets a fact identified by uri.
         * @type BuildingBlockDescription
         * @public
         */
        getFact: function (/** String */ uri) {
            // If the fact does not exist in the cached ones, then a default one is created.
            if(this._cachedFacts.get(uri)==null){
                this.updateFactFromUri(uri);
                if(this._cachedFacts.get(uri)==null){
                    this._cachedFacts.set(uri, new Fact(uri, "DF", "Default Fact"));
                }
            }
            return this._cachedFacts.get(uri);
        },

        /**
         * Updates the facts from a JSON file.
         * @public
         */
        updateFacts: function () {
            CatalogueSingleton.getInstance().getFacts();
        },
        
        /**
         * Updates the facts from the fact uri.
         * @public
         */
        updateFactFromUri: function (/**String*/ stringUri) {
            if(stringUri.startsWith('?')){
                factUri = stringUri.split(' ');
                var shortcut = factUri[0].split('?')[1].truncate(2, '');
                
                var uri = factUri[2];
                var desc = factUri[2];
                this._cachedFacts.set(stringUri,new Fact(stringUri, shortcut, desc));
            }
        },
        
        /**
         * Sets a fact identified by uri.
         * @params String: Facts in JSON
         * @public
         */
        setFacts: function(factMetadata) {
            var fact_metadata = factMetadata.fact_metadata;
            for (var i=0; i<fact_metadata.length ; i++) {
                this._cachedFacts.set(fact_metadata[i].uri,new Fact(fact_metadata[i].uri, fact_metadata[i].shortcut, fact_metadata[i].description));
            }
        },

        /**
         * Gets the root node of a icon for a give fact identified by uri.
         * @param String uri   Fact Building Block identifier
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
