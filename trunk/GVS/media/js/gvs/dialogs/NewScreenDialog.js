var NewScreenDialog = Class.create(ConfirmDialog /** @lends NewScreenDialog.prototype */, {
    /**
     * This class handles the dialog
     * to create a new Screen
     * @constructs
     * @extends ConfirmDialog
     */ 
    initialize: function($super) {  
        $super("New Screen");
    },
    
    
    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function (){
 
        this._setHeader("Fulfill Gadget Information", 
                             "Please fulfill the required information in order to " +
                             "create a new screen.");

        var formData = [
            {
                'type':'input', 
                'label': 'Screen Name:',
                'name': 'name', 
                'value': 'New Screen',
                'message': 'Screen cannot be blank',
                'required': true
            },
            {
                'type':'input', 
                'label': 'Version:', 
                'name': 'version', 
                'value': '0.1',
                'message': 'Version cannot be blank',
                'required': true
            },
            {
                'type':'input', 
                'label': 'Tags:',
                'name': 'domaincontext',
                'value': ''
            }
        ];
        
        this._setContent(formData);               
        
    },
    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){
        if (this._getFormWidget().validate()) {
            var name = $F(this._getForm().name);
            var domainContext = $F(this._getForm().domaincontext).split(/[\s,]+/).without("");
            var version = $F(this._getForm().version);
            
            documentController = GVSSingleton.getInstance().getDocumentController();
            documentController.createScreen(name, $A(domainContext), version);
            
            $super();
        }       
    },
    
    /**
     * Reset method to leave the form as initially
     * @private
     */
    _reset: function ($super) {
        this._getForm().name.value = "New Screen";
        this._getForm().domaincontext.value = "";
        this._getForm().version.value = "0.1";
        $super();
    }
});

// vim:ts=4:sw=4:et:
