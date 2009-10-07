var ToolbarDropDown = Class.create( /** @lends ToolbarDropDown.prototype */ {
    /**
     * DropDown as a toolbar element.
     * Implementing ToolbarElement interface
     * @constructs
     * @param Boolean enabled (optional)
     */ 
    initialize: function(/** String */ label, /** String */ iconName, /** Boolean*/ enabled) {
        
        /**
         * The Menu inside the DropDown
         * @type dijit.Menu
         * @private
         */
        this._menu = new dijit.Menu();
        
        /** 
         * The DropDown Widget
         * @type dijit.form.DropDown 
         * @private @member
         */
        this._widget = new dijit.form.DropDownButton ({
            'label': label,
            'showLabel': true,
            'iconClass': 'toolbarIcon ' + iconName + 'Icon',
            'dropDown': this._menu,
            'disabled': (enabled !== undefined)? (!enabled) : false
        });
    },
    

    // **************** PUBLIC METHODS **************** //
    /**
     * This function adds a new menu item into the DropDown
     */
    addMenuItem: function(/** String */ label, /** Function */ onClick, /** String */ iconName) {
        var item = new dijit.MenuItem({
            'label': label,
            'showLabel': true,
            'onClick': onClick  
        });
        if (iconName) {
            item.attr('iconClass', 'dropDownIcon ' + iconName + 'Icon');
        }
        this._menu.addChild(item);
    },
    
    /**
     * Returns the DropDown widget
     * @type dijit.form.DropDown
     */
    getWidget: function () {
        return this._widget;
    },
    
    /**
     * Set the status of the widget
     */
    setEnabled: function(/** Boolean */ enabled) {
        this._widget.attr('disabled',!enabled);
    }


});

// vim:ts=4:sw=4:et:
