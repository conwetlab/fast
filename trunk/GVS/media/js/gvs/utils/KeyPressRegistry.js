var KeyPressRegistry = Class.create( /** @lends KeyPressRegistry.prototype */ {
    /**
     * This class handles the different
     * onKeyPressed listeners, and the enabling and disabling of these events
     * @constructs
     */ 
    initialize: function() {
        /**
         * Hash of registered handlers
         * @type Hash
         * @private
         */
        this._handlers = new Hash();
        
        /**
         * The Keypress events are enabled
         */
        this._enabled = true;
        
        this.setEnabled(this._enabled);
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * This function adds a listener to a specific key 
     * or key combination.
     */
    addHandler: function (/** String  */ accelKey, /** Function */ handler) {
        var key = accelKey.toLowerCase();
        if (this._handlers.get(key)) {
            shortcut.remove(key);
        }
        this._handlers.set(key, handler);
        shortcut.add(key, this._executeHandler.bind(this), {'disable_in_input': true});
    },
    
    /**
     * Asks if a key stroke is being used
     * @type Boolean
     */
    isRegistered: function(/** String */ key) {
        return (this._handler.get(key) ? true : false);    
    },
    
    /**
     * This function removes the handler for a key combination
     */
    removeHandler: function(/** String */ accelKey) {
        var key = accelKey.toLowerCase();
        this._handlers.unset(key);
        //shortcut.remove(key);
    },
    
    /**
     * This function enables or disables the onkeypress events
     */
    setEnabled: function(/** Boolean */ enabled) {
        this._enabled = enabled;       
    },
    
    // ********************** PRIVATE METHODS ********************* //
    
    /**
     * This function actually receives the keypress events and calls 
     * the handlers when necessary
     * @private
     */
    _executeHandler: function(/** Event */ e, /** String */ key) {
        if (this._enabled && this._handlers.get(key)) {
            this._handlers.get(key)(key);
        } 
    }
});

// vim:ts=4:sw=4:et:
