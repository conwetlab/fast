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
    show: function ($super, /** Object */ properties) {
        $super();
        $H(properties).each(function(pair) {
            this._getForm()[pair.key].setValue(pair.value);
        }.bind(this));
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){
 
        var user = GVS.getUser();
 
        this._setHeader("Fulfill Gadget Information", 
                             "Please fulfill the required information in order to" +
                             " deploy a gadget.");
                             
        var formData = [
            {'type':'title', 'value': 'Gadget information'},
            {'type':'input', 'label': 'Gadget Name:','name': 'name', 'value': '', 'required': true},
            {'type':'input', 'label': 'Gadget Short Name:', 'name': 'shortname', 'value': ''},
            {'type':'input', 'label': 'Owner:','name': 'owner', 'value': '', 'required': true},
            {'type':'input', 'label': 'Version:','name': 'version', 'value': '1.0', 'required': true},
            {'type':'input', 'label': 'Vendor:','name': 'vendor', 'value': 'Morfeo'},
            {'type':'input', 'label': 'Gadget Description:','name': 'desc', 'value': ''},
            {'type':'input', 'label': 'Image URL:','name': 'imageURI', 
                'value': '', 
                'regExp': FormDialog.URL_VALIDATION, 
                'message': FormDialog.INVALID_URL_MESSAGE},
            {'type':'input', 'label': 'Homepage:','name': 'gadgetHomepage',
                'value': '', 
                'regExp': FormDialog.URL_VALIDATION, 
                'message': FormDialog.INVALID_URL_MESSAGE},
            {'type':'input', 'label': 'Default Height:', 'name': 'height', 'value': '', 
                'regExp': FormDialog.POSITIVE_VALIDATION, 
                'message': FormDialog.INVALID_POSITIVE_MESSAGE},
            {'type':'input', 'label': 'Default Width:', 'name': 'width', 'value': '', 
            	'regExp': FormDialog.POSITIVE_VALIDATION, 
            	'message': FormDialog.INVALID_POSITIVE_MESSAGE},
            {'type':'title', 'value': 'Author information'},
            {'type':'input', 'label': 'Author Name:','name': 'authorName', 'value': user.getRealName()},
            {'type':'input', 'label': 'E-Mail:','name': 'email', 'value': user.getEmail(), 
                'regExp': FormDialog.EMAIL_VALIDATION, 
                'message': FormDialog.INVALID_EMAIL_MESSAGE},
            {'type':'input', 'label': 'Homepage:','name': 'authorHomepage',
                'value': '', 
                'regExp': FormDialog.URL_VALIDATION, 
                'message': FormDialog.INVALID_URL_MESSAGE}
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
        var user = GVS.getUser();
        
        this._getForm().authorName.value = user.getRealName();
        this._getForm().email.value = user.getEmail();
        $super();
    }
});

// vim:ts=4:sw=4:et:
