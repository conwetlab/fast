var Toolbar = Class.create( /** @lends Toolbar.prototype */ {
    /**
     * TODO: describe this class
     * @constructs
     */ 
    initialize: function() {
        /** 
         * Variable
         * @type dijit.dialog.Toolbar
         * @private @member
         */
        this._toolbar = dijit.byId("menu");
    },
    
    /**
     * This functions adds a button 
     */
    addButton: function (/** Hash */ buttonData, /** Function */ handler){
        
        buttonData.onClick = handler;
        buttonData.showLabel = false;
        var button = new dijit.form.Button (buttonData);
        
        this._toolbar.addChild(button);
    },
    /**
     * Todo
     */
    removeButton: function ( /***/ button){
        
    }
});

// vim:ts=4:sw=4:et:
