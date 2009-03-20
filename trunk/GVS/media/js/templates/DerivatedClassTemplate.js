var %%CLASSNAME%% = Class.create( %%BASECLASSNAME%%,
    /** @lends %%CLASSNAME%%.prototype */ {
    
    /**
     * TODO: describe this class
     * @constructs
     * @extends %%BASECLASSNAME%%
     */ 
    initialize: function() {
        /** 
         * Variable
         * @type String
         * @private @member
         */
        this._privateVar = null;
    },
    

    // **************** PUBLIC METHODS **************** //
    
    /**
     * foo
     * @public
     */
    foo: function () {
    },

    // **************** PRIVATE METHODS **************** //

    /** 
     * bar
     * @private
     */
    _bar: function (){
    }
    
});

// vim:ts=4:sw=4:et:
