/**
 * <p>This class implements the Singleton Design Pattern to make sure there is 
 * only one instance of the class %%CLASSNAME%%.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var instance = %%CLASNAME%%Singleton.getInstance();
 */ 
var %%CLASSNAME%%Singleton = function() {
    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;
    

    var %%CLASSNAME%% = Class.create( /** @lends %%CLASSNAME%%Singleton-%%CLASSNAME%%.prototype */ {
        /** @constructs */
        initialize: function() {

            /** 
             * Private variable
             * @type String
             * @private @member
             */
            this._privateVar = null;
        },
        

        // **************** PUBLIC METHODS **************** //
        

        /**
         * foo
         */
        foo: function () {
        },


        // **************** PRIVATE METHODS **************** //


        /** 
         * bar
         * @private
         */
        _bar: function () {
        }
        
    });
    
  
    return new function() {
        /**
         * Returns the singleton instance
         * @type %%CLASSNAME%%
         */
        this.getInstance = function() {
            if (_instance == null) {
                _instance = new %%CLASSNAME%%();
            }
            return _instance;
        }
    }
}();

// vim:ts=4:sw=4:et: 
