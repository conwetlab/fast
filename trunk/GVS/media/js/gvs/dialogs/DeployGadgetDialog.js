var DeployGadgetDialog = Class.create(ConfirmDialog /** @lends DeployGadgetDialog.prototype */, {
    /**
     * This class handles the dialog
     * to deploy a gadget
     * @constructs
     * @extends AbstractDialog
     */ 
    initialize: function($super) {
        $super("Deploy Gadget", "ok");        
    },
    
    
    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     * @overrides
     */
    show: function ($super, /** DOMNode */ content) {
        $super();
        this.setContent(content);
        //Adding the hiding of the dialog
        /*$(content).getElementsBySelector('.deploymentButton').each(function(button) {
            button.observe('click',this.hide.bind(this));    
        }.bind(this));*/
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @overrides
     */
    _initDialogInterface: function () {
    }
});

// vim:ts=4:sw=4:et:
