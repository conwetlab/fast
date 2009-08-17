var User = Class.create( /** @lends User.prototype */ {
    /**
     * TODO: describe this class
     * @constructs
     */ 
    initialize: function(userName /** String */, realName /** String */, email /** String */) {
        /** 
         * @type String
         * @private @member
         */
        this._userName = userName;
        
        /** 
         * @type String
         * @private @member
         */
        this._realName = realName;
       
        /** 
         * @type String
         * @private @member
         */
        this._email = email;
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * getRealName
     */
    getRealName: function () {
        return this._realName;
    },
    
    /**
     * getUserName
     */
    getUserName: function () {
        return this._userName;
    },
    
    /**
     * getEmail
     */
    getEmail: function () {
        return this._email;
    }

    // **************** PRIVATE METHODS **************** //


    
});

// vim:ts=4:sw=4:et:
