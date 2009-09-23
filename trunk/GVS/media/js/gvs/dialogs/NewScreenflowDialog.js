var NewScreenflowDialog = Class.create(ConfirmDialog /** @lends NewScreenflowDialog.prototype */, {
    /**
     * This class handles the dialog
     * to create a new screenflow
     * @constructs
     * @extends ConfirmDialog
     */ 
    initialize: function($super) {  
        $super("New Screenflow");
    },
    
    
    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @overrides
     */
    _initDialogInterface: function (){
 
        this.setHeader("Fulfill Gadget Information", 
                             "Please fulfill the required information in order to " +
                             "create a new screenflow.");

        var formData = [
            {
                'type':'input', 
                'label': 'Screenflow Name:',
                'name': 'name', 
                'value': 'New Screenflow',
                'regExp': '.*\\w.*',
                'message': 'Screenflow name is mandatory'
            },
            {
                'type':'input', 
                'label': 'Domain Context:',
                'name': 'domaincontext',
                'value': ''
            },
            {
                'type':'input', 
                'label': 'Version:', 
                'name': 'version', 
                'value': '0.1',
                'regExp': '.*\\S.*',
                'message': 'Version is mandatory'
            }
        ];
        
        this.setContent(formData);               
        
    },
    /**
     * Overriding onOk handler
     * @overrides
     */
    _onOk: function($super){
        if (this.getFormWidget().validate()) {
            var name = $F(this.getForm().name);
            var domainContext = $F(this.getForm().domaincontext).split(/[\s,]+/);
            var version = $F(this.getForm().version);
            
            documentController = GVSSingleton.getInstance().getDocumentController();
            documentController.createScreenflow(name, $A(domainContext), version);
            
            this.hide();
        }       
    },
    
    /**
     * Reset method to leave the form as initially
     */
    _reset: function ($super) {
        this.getForm().name.value = "New Screenflow";
        this.getForm().domaincontext.value = "";
        this.getForm().version.value = "0.1";
        $super();
    }
});

// vim:ts=4:sw=4:et:
