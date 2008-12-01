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
            var nextId = this._nextIds[element];
            
            if (!nextId){
                nextId = 1;
            }   
            
            this._nextIds[element] = nextId + 1;
            
            return element + "_" + nextId;
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
