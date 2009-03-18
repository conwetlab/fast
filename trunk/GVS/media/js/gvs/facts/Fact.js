var Fact = Class.create(
    /** @lends Fact.prototype */ {

    /**
     * Describes an individual fact.
     * @constructs
     */
    initialize: function(
        /** String */ uri,
        /** String */ shortcut,
        /** String */ description
    ) {
        /**
         * Fact identifier.
         * @type String
         */
        this._uri = uri;

        /**
         * Fact shortcut.
         * @type String
         */
        this._shortcut = shortcut;

        /**
         * Brief description.
         * @type String
         */
        this._description = description;
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the fact identifier.
     * @return String
     */
    getUri: function (){
        return this._uri;
    },


    /**
     * Gets the fact shortcut.
     * @return String
     */
    getShortcut: function (){
        return this._shortcut;
    },


    /**
     * Gets the fact brief description.
     * @return String
     */
    getDescription: function (){
        return this._description;
    }
    
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
