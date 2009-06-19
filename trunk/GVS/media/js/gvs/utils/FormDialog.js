var FormDialog = Class.create( /** @lends FormDialog.prototype */ {

    /**
     * Dialog class.
     * @constructs
     * @param Hash params
     */
    initialize: function(properties) {
        this._dialog = new dijit.Dialog(properties);
    },

    
    // **************** PUBLIC METHODS **************** //

    getDialog: function() {
        return this._dialog;
    },
    
    /**
     * Gets the root node.
     * @type DOMNode
     * @public
     */
    getNode: function () {
        return this.getDialog().domNode;
    },
    
    /**
     * Gets the form node.
     * @type DOMNode
     * @public
     */
    getForm: function() {
        return this.getNode().getElementsByTagName("form")[0];
    },
    
    show: function() {
        return this.getDialog().show();
    },
        
    hide: function() {
        return this.getDialog().hide();
    }
    
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
