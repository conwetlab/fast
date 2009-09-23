var StoreGadgetDialog = Class.create(ConfirmDialog /** @lends StoreGadgetDialog.prototype */, {
    /**
     * This class handles the dialog
     * to store a gadget
     * @constructs
     * @extends ConfirmDialog
     */ 
    initialize: function($super, /** Function */ onDeployCallback) {
        
        $super("Store Gadget");
        
        /**
         * @type Function
         * @private @member
         */
        this._onDeployCallback = onDeployCallback;
    },
    
    
    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     * @overrides
     */
    show: function ($super, /** String */ title) {
        $super();
        this.getForm().name.setValue(title);
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @overrides
     */
    _initDialogInterface: function (){
 
        var user = GVSSingleton.getInstance().getUser();
 
        this.setHeader("Fulfill Gadget Information", 
                             "Please fulfill the required information in order to" +
                             " deploy a gadget.");
                             
        var formData = [
            {'type':'title', 'value': 'Gadget information'},
            {'type':'input', 'label': 'Gadget Name:','name': 'name', 'value': ''},
            {'type':'input', 'label': 'Vendor:','name': 'vendor', 'value': 'Morfeo'},
            {'type':'input', 'label': 'Version:','name': 'version', 'value': '1.0'},
            {'type':'input', 'label': 'Gadget Description:','name': 'desc', 'value': 'Write your description here...'},
            {'type':'title', 'value': 'Author information'},
            {'type':'input', 'label': 'Author Name:','name': 'creator', 'value': user.getRealName()},
            {'type':'input', 'label': 'E-Mail:','name': 'email', 'value': user.getEmail()}
        ];   
        //FIXME: private method?     
        this.setContent(formData); 
    },
    /**
     * Overriding onOk handler
     * @private
     * @overrides
     */
    _onOk: function($super){
        $super();
        this._onDeployCallback(this.getForm().serialize({'hash':true}));
    },
    /**
     * Reset form
     * @private @overrides
     */
    _reset: function($super){
        var user = GVSSingleton.getInstance().getUser();
        
        this.getForm().creator.value = user.getRealName();
        this.getForm().email.value = user.getEmail();
        $super();
    }
});

// vim:ts=4:sw=4:et:
