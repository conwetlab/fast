var MenuAction = Class.create(MenuElement, /** @lends MenuAction.prototype */ {
    /**
     * Element for a menu
     * @constructs
     * @extends MenuElement
     * @param Hash extraParams (optional)
     *           Hash containing some of these extra params
     *           * (String)iconName Name of the icon if present
     *           * (Boolean)enabled state of the element
     *           * (String)accelKey key shortcut to access to the element   
     */ 
    initialize: function($super, /** Object */ data, /** Boolean */ mainMenu) {
        $super(data.weight);
        if (mainMenu) {
            this._widget = new dijit.MenuBarItem ({
                'label': data.label,
                'onClick': data.handler,
                'showLabel': true
            });
        } else {
            this._widget = new dijit.MenuItem ({
                'label': data.label,
                'onClick': data.handler,
                'showLabel': true
            });    
        }
        
        /**
         * Handler function
         * @type Function
         * @private
         */
        this._handler = data.handler;

        /**
         * Accel key shortcut to use the menu item,
         * if any
         * @type String
         * @private
         */
        this._shortcut = (data.shortcut ? data.shortcut : null);
        
        if (this._shortcut) {
            this._widget.attr('accelKey', this._shortcut);
        }

        /**
         * Item state
         * @type Boolean
         * @private
         */
        this._enabled = null;
        this.setEnabled(data.enabled !== undefined ? data.enabled : true);  
        
        if (data.iconName) {
            this._widget.attr('iconClass', 'dijitMenuItemIcon menuIcon ' + data.iconName + 'Icon');
        }
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * Sets the element enabled
     * It must be called to set it disabled
     * when the menuitem is going to be left
     * outside of the menu 
     */
    setEnabled: function(/** Boolean */ enabled) {
        this._enabled = enabled;
        this._widget.attr('disabled',!enabled);
    },
    
    /**
     * Register key handlers
     * @override
     */
    register: function(/** KeyPressRegistry */ registry) {
        if (this._shortcut) {
            registry.addHandler(this._shortcut, this._keyPressHandler.bind(this));
        }    
    },
    
    /**
     * Unregister key handlers
     * @override
     */
    unregister: function(/** KeyPressRegistry */ registry) {
        if (this._shortcut) {
            registry.removeHandler(this._shortcut);
        }
    },
    
    // ************** PRIVATE METHODS **************** //
    
    /**
     * function to capture key strokes and decide if 
     * calling the handler depending on the status of the
     * action (enabled or disabled)
     */
    _keyPressHandler: function() {
        if (this._enabled) {
           this._handler(); 
        }
    }
});

// vim:ts=4:sw=4:et:
