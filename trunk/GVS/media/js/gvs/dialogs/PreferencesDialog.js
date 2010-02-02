var PreferencesDialog = Class.create(ConfirmDialog /** @lends PreferencesDialog.prototype */, {
    /**
     * This class handles the dialog
     * that shows the user preferences
     * @constructs
     * @extends ConfirmDialog
     */ 
    initialize: function($super) {
        
        $super("User Preferences");
    },
    
    
    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {
 
        this._setHeader("User preferences");
        
        var user = GVS.getUser();
             
        var formData = [
            {'type':'input', 'label': 'First Name:','name': 'firstName', 
                    'value': user.getFirstName()},
            {'type':'input', 'label': 'Last Name:','name': 'lastName', 
                    'value': user.getLastName()},
            {'type':'input', 'label': 'Email:','name': 'email', 'value': user.getEmail(),
                    'regExp': FormDialog.EMAIL_VALIDATION, 
                    'message': FormDialog.INVALID_EMAIL_MESSAGE,
                    'required': true},
            {'type':'input', 'label': 'EzWeb URL:','name': 'ezWebURL', 
                    'value': user.getEzWebURL(), 
                    'regExp': FormDialog.URL_VALIDATION, 
                    'message': FormDialog.INVALID_URL_MESSAGE}
        ];
        
        this._setContent(formData);

    },
    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){
        
        if (!this._getFormWidget().validate()) {
            return;
        }
        else {
            var user = GVS.getUser();
            user.update(this._getForm().serialize(true));
            $super();
        }
    },
    
    /**
     * Reset method to leave the form as initially
     * @override
     * @private
     */
    _reset: function ($super){
        var user = GVS.getUser();
        this._getForm().firstName.value = user.getFirstName();
        this._getForm().lastName.value = user.getLastName();
        this._getForm().email.value = user.getEmail();
        this._getForm().ezWebURL.value = user.getEzWebURL();
        $super();
    }
});

// vim:ts=4:sw=4:et:
