var BuildGadgetDialog = Class.create(ConfirmDialog /** @lends BuildGadgetDialog.prototype */, {
    /**
     * This class handles the dialog
     * to store a gadget
     * @constructs
     * @extends ConfirmDialog
     */ 
    initialize: function($super, /** Function */ onDeployCallback) {
        
        $super("Build Gadget");
        
        /**
         * @type Function
         * @private @member
         */
        this._onDeployCallback = onDeployCallback;
    },
    
    
    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     * @override
     */
    show: function ($super, /** String */ title) {
        $super();
        this._getForm().name.setValue(title);
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){
 
        var user = GVSSingleton.getInstance().getUser();
 
        this._setHeader("Fulfill Gadget Information", 
                             "Please fulfill the required information in order to" +
                             " deploy a gadget.");
                             
        var formData = [
            {'type':'title', 'value': 'Gadget information'},
            {'type':'input', 'label': 'Gadget Name:','name': 'name', 'value': '', 'required': true},
            {'type':'input', 'label': 'Vendor:','name': 'vendor', 'value': 'Morfeo', 'required': true},
            {'type':'input', 'label': 'Version:','name': 'version', 'value': '1.0', 'required': true},
            {'type':'input', 'label': 'Gadget Description:','name': 'desc', 'value': 'Write your description here...'},
            {'type':'title', 'value': 'Author information'},
            {'type':'input', 'label': 'Author Name:','name': 'creator', 'value': user.getRealName()},
            {'type':'input', 'label': 'E-Mail:','name': 'email', 'value': user.getEmail()}
        ];     
        this._setContent(formData); 
    },
    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super){
    	if (this._getFormWidget().validate()) {
    		$super();
    		this._onDeployCallback(this._getForm().serialize({'hash':true}));
    	}
    },
    /**
     * Reset form
     * @private 
     * @override
     */
    _reset: function($super){
        var user = GVSSingleton.getInstance().getUser();
        
        this._getForm().creator.value = user.getRealName();
        this._getForm().email.value = user.getEmail();
        $super();
    }
});

// vim:ts=4:sw=4:et:
