var NewScreenflowDialog = Class.create(AbstractDialog /** @lends NewScreenflowDialog.prototype */, {
    /**
     * This class handles the dialog
     * to create a new screenflow
     * @constructs
     * @extends AbstractDialog
     */ 
    initialize: function($super) {
        
        $super("New Screenflow");
    },
    
    
    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     * @overrides
     */
    show: function ($super) {
        $super();
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @overrides
     */
    _initDialogInterface: function (){
 
        this._form.setHeader("Fulfill Gadget Information", 
                             "Please fulfill the required information in order to" +
                             " create a new screenflow.");

        var formData = [
            {'type':'input', 'label': 'Screenflow Name:','name': 'SFName', 'value': 'New Screenflow'},
            {'type':'input', 'label': 'Domain Context:','name': 'SFDomainContext', 'value': ''}
        ];
        
        this._form.setContent(formData);               
        
    },
    /**
     * Overriding onOk handler
     * @overrides
     */
    _onOk: function($super){
        var name = $F(this._form.getForm().SFName);
        if (name && name != "") {
            var domainContext = $F(this._form.getForm().SFDomainContext);
            documentController = GVSSingleton.getInstance().getDocumentController();
            documentController.createScreenflow (name, domainContext);
            $super();
        }
        else {
            alert("A Screenflow name must be provided");
        }
    },
    
    /**
     * Reset method to leave the form as initially
     */
    _reset: function (){
        this._form.getForm().SFName.value = "New Screenflow";
        this._form.getForm().SFDomainContext.value = "";
    }
});

// vim:ts=4:sw=4:et:
