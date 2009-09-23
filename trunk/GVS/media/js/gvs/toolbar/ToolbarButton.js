var ToolbarButton = Class.create( /** @lends ToolbarButton.prototype */ {
    /**
     * Button as a toolbar element.
     * Implementing ToolbarElement interface
     * @constructs
     * @param Boolean enabled (optional)
     */ 
    initialize: function(/** String */ label, /** String */ iconName,
            /** Function */ onClick, /** Boolean*/ enabled) {
        /** 
         * The button Widget
         * @type dijit.form.Button 
         * @private @member
         */
        this._widget = new dijit.form.Button ({
            'label': label,
            'iconClass': 'toolbarIcon ' + iconName + 'Icon',
            'onClick': onClick,
            'showLabel': false,
            'disabled': (enabled !== undefined)? (!enabled) : false
        });
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * Returns the button widget
     * @type dijit.form.Button
     */
    getWidget: function () {
        return this._widget;
    },
    
    setEnabled: function(/** Boolean */ enabled) {
        this._widget.attr('disabled',!enabled);
    }
    
});

// vim:ts=4:sw=4:et:
