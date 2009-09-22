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
     * @overrides
     */
    _initDialogInterface: function () {
 
        this.setHeader("User preferences");
        
        var user = GVSSingleton.getInstance().getUser();
             
        var formData = [
            {'type':'input', 'label': 'First Name:','name': 'firstName', 'value': user.getFirstName()},
            {'type':'input', 'label': 'Last Name:','name': 'lastName', 'value': user.getLastName()},
            {'type':'validation', 'label': 'Email:','name': 'email', 'value': user.getEmail(), 
                    'regExp': '[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}', 
                    'message': 'Invalid email address'},
            {'type':'validation', 'label': 'EzWeb URL:','name': 'ezWebURL', 
                    'value': user.getEzWebURL(), 
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*', 
                    'message': 'Invalid URL'}
        ];
        
        this.setContent(formData, {'id' : 'PreferencesForm', 'method' : 'post'});

    },
    /**
     * Overriding onOk handler
     * @overrides
     */
    _onOk: function($super){
        var form = dijit.byId("PreferencesForm");
        
        if (!form.validate()) {
            return;
        }
        else {
            var user = GVSSingleton.getInstance().getUser();
            user.update(this.getForm().serialize(true));
            $super();
        }
    },
    
    /**
     * Reset method to leave the form as initially
     */
    _reset: function (){
        var user = GVSSingleton.getInstance().getUser();
        this.getForm().firstName.value = user.getFirstName();
        this.getForm().lastName.value = user.getLastName();
        this.getForm().email.value = user.getEmail();
        this.getForm().ezWebURL.value = user.getEzWebURL();
        var form = dijit.byId("PreferencesForm");
        form.validate();
    }
});

// vim:ts=4:sw=4:et:
