var DeployGadgetDialog = Class.create(ConfirmDialog /** @lends DeployGadgetDialog.prototype */, {
    /**
     * This class handles the dialog
     * to deploy a gadget
     * @constructs
     * @extends ConfirmDialog
     */ 
    initialize: function($super) {
        $super("Deploy Gadget", "ok");        
    },
    
    
    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     * @override
     */
    show: function ($super, /** DOMNode */ content) {
        $super();
        this._setContent(content);
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
    }
});

// vim:ts=4:sw=4:et:
