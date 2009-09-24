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
        
        var user = GVSSingleton.getInstance().getUser();
             
        var formData = [
            {'type':'input', 'label': 'First Name:','name': 'firstName', 
                    'value': user.getFirstName()},
            {'type':'input', 'label': 'Last Name:','name': 'lastName', 
                    'value': user.getLastName()},
            {'type':'input', 'label': 'Email:','name': 'email', 'value': user.getEmail(),
                    'regExp': '[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}', 
                    'message': 'Invalid email address',
                    'required': true},
            {'type':'input', 'label': 'EzWeb URL:','name': 'ezWebURL', 
                    'value': user.getEzWebURL(), 
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*', 
                    'message': 'Invalid URL'}
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
            var user = GVSSingleton.getInstance().getUser();
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
        var user = GVSSingleton.getInstance().getUser();
        this._getForm().firstName.value = user.getFirstName();
        this._getForm().lastName.value = user.getLastName();
        this._getForm().email.value = user.getEmail();
        this._getForm().ezWebURL.value = user.getEzWebURL();
        $super();
    }
});

// vim:ts=4:sw=4:et:
