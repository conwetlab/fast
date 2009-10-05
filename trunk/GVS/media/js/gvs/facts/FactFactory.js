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
         * This class is used to create facts representations.
         * @constructs
         */
        initialize: function() {
            /**
             * Cached facts.
             * @type Hash
             * @private @member
             */
            this._cachedFacts = new Hash();
            
            /**
             * This array stores the shortcuts
             * being used in the execution 
             */
            this._cachedShortcuts = new Array();
        },
        
        // **************** PUBLIC METHODS **************** //

        /**
         * Gets the root node of a icon for a give fact identified by uri.
         * @param String size  Icon size ("inline"|"embedded"|"standalone")
         * @type FactIcon
         */
        getFactIcon: function (/** Object */ factData, size) {
            var fact = this._getFact(factData);
            return new FactIcon(fact, size);
        },
        
        /**
         * Gets the fact uri
         * @type String
         */
        getFactUri: function (/** Object */ factData) {
            var uri;
            if (factData.uri) {
                uri = factData.uri;
            } else if (factData.pattern) {
                uri = Utils.extractURIfromPattern(factData.pattern);
            }
            else { //We don't know the uri
                uri = "http://unknown.uri#?";
            }
            return uri;
        },

        // **************** PRIVATE METHODS **************** //
        
        /**
         * Gets a fact
         * @type Fact
         * @private
         */
        _getFact: function (/** Object */ factData) {
            
            var uri = this.getFactUri(factData);
            
            //The fact didn't exist, create a new one
            if(this._cachedFacts.get(uri)==null){
                    this._cachedFacts.set(uri, new Fact(uri, 
                        this._extractShortcut(uri), this._extractDescription(factData)));
            }
            return this._cachedFacts.get(uri);
        },

        
        /**
         * This function returns a shortcut coming from the URI
         * TODO: Add more criteria to determine the shortcut
         * @type String
         * @private
         */
        _extractShortcut: function(/** String */ uri) {
            var pieces = uri.split("#");
            var identifier = "";
            if (pieces.length > 1){
                identifier = pieces[1];               
            } else { //The uri has not identifier, try the last part of the url
                pieces = uri.split("/");
                identifier = pieces[pieces.length - 1];
            }

            
            //Let's try with capital letters...
            var letters = identifier.match(/[A-Z]/g);
            if (letters && letters.length > 1) { //More than one capital letter
                //try only with 2 letters
                //Put the second letter in lower case
                //letters[1]= letters[1].toLowerCase();
                shortcut = letters.slice(0, 2).join("");
                
                if (this._cachedShortcuts.indexOf(shortcut) == -1) {
                    this._cachedShortcuts.push(shortcut);
                    return shortcut;
                }
            }
    
            //Let's try with the first two letters
            identifier[1]= identifier[1].toLowerCase();
            var shortcut = identifier.slice(0,2);
            if (this._cachedShortcuts.indexOf(shortcut) == -1){
                this._cachedShortcuts.push(shortcut);
                return shortcut;
                
            }
            //If none of the above have worked out, show the first letter
            //Despite they have been used before
            shortcut = identifier.slice(0, 1);
            return shortcut;
        },
        
        /**
         * This function extract the description from fact or concept metadata
         * @private
         * @type String
         */
        _extractDescription: function(/** Object */ factData) {
            if(factData.label && factData.label['en-gb']) {
                return factData.label['en-gb'];
            }
            var comment = factData["http://www.w3.org/2000/01/rdf-schema#comment"];
            if(comment) {
                return comment.replace("@en","");
            }
            var label = factData["http://www.w3.org/2000/01/rdf-schema#label"];
            if(label) {
                return label.replace("@en","");
            }
        }
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
