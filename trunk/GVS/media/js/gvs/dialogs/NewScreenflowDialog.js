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
     * @override
     */
    _initDialogInterface: function (){
 
        this._setHeader("Fulfill Gadget Information", 
                             "Please fulfill the required information in order to " +
                             "create a new screenflow.");

        var formData = [
            {
                'type':'input', 
                'label': 'Screenflow Name:',
                'name': 'name', 
                'value': 'New Screenflow',
                'message': 'Screenflow cannot be blank',
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
                'name': 'tags',
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
            var tags = $F(this._getForm().tags).split(/[\s,]+/).without("");
            var version = $F(this._getForm().version);

            var processedTags = Utils.getCatalogueTags($A(tags), null);
            
            var documentController = GVSSingleton.getInstance().getDocumentController();
            documentController.createScreenflow(name, processedTags, version);
            
            $super();
        }       
    },
    
    /**
     * Reset method to leave the form as initially
     * @private
     */
    _reset: function ($super) {
        this._getForm().name.value = "New Screenflow";
        this._getForm().tags.value = "";
        this._getForm().version.value = "0.1";
        $super();
    }
});

// vim:ts=4:sw=4:et:
