/**
 * <p>This class implements the Singleton Design Pattern to make sure there is 
 * only one instance of the class UIDGenerator.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var instance = UIDGeneratorSingleton.getInstance();
 */ 
var UIDGeneratorSingleton = function () {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;

    var UIDGenerator = Class.create(
        /** @lends UIDGeneratorSingleton-UIDGenerator.prototype */ {

        /**
         * Unique ID generator.
         * @constructs
         */
        initialize: function () {
            /**
             * Next available ids
             * @type Hash
             * @private
             */
            this._nextIds = {};
        },
        
        
        // **************** PUBLIC METHODS **************** //


        /**
         * Returns a valid new DOM Id
         * @param String element  Type of element that needs the identifier
         * @type String
         */
        generate: function (/** String */ element) {
            var sanitized = element.replace(new RegExp('\\s', 'g'), "")
                                    .replace("_","");
            var nextId = this._nextIds[sanitized];
            
            if (!nextId){
                nextId = 1;
            }   
            
            this._nextIds[sanitized] = nextId + 1;
            
            return sanitized + "_" + nextId;
        },

        /**
         * Sets the initial id for a given name
         */
        setStartId: function(/** String */ id) {
            var pieces = id.split("_");
            var name = pieces[0];
            var lastId = parseInt(pieces[1]);
            if (!this._nextIds[name] || this._nextIds[name] <= lastId) {
                this._nextIds[name] = lastId + 1;
            }
        }
    });
        

    return new function() {
        /**
         * Returns the singleton instance
         * @type UIDGenerator
         */
        this.getInstance = function() {
            if (_instance == null) {
                _instance = new UIDGenerator();
            }
            return _instance;
        }
    }   
}()

// vim:ts=4:sw=4:et: 
