var DeployGadgetDialog = Class.create(AbstractDialog /** @lends DeployGadgetDialog.prototype */, {
    /**
     * This class handles the dialog
     * to deploy a gadget
     * @constructs
     * @extends AbstractDialog
     */ 
    initialize: function($super, parent /** ScreenflowDocument */) {
        
        $super("Deploy Gadget");
         /** 
         * Variable
         * @type ScreenflowDocument
         * @private @member
         */
        this._parent = parent;
    },
    
    
    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     * @overrides
     */
    show: function ($super) {
        $super();
        this._form.getForm().name.setValue(this._parent.getTitle());
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
 
        this._form.setHeader("Fulfill Gadget Information", 
                             "Please fulfill the required information in order to" +
                             " deploy a gadget.");
                             
        var formData = [
            {'type':'title', 'value': 'Gadget information'},
            {'type':'input', 'label': 'Gadget Name:','name': 'name', 'value': this._parent.getTitle()},
            {'type':'input', 'label': 'Vendor:','name': 'vendor', 'value': 'Morfeo'},
            {'type':'input', 'label': 'Version:','name': 'version', 'value': '1.0'},
            {'type':'input', 'label': 'Gadget Description:','name': 'info', 'value': 'Write your description here...'},
            {'type':'title', 'value': 'Author information'},
            {'type':'input', 'label': 'Author Name:','name': 'author', 'value': user.getRealName()},
            {'type':'input', 'label': 'E-Mail:','name': 'email', 'value': user.getEmail()},
            {'type':'hidden', 'name': 'screens'},
            {'type':'hidden', 'name': 'slots'},
            {'type':'hidden', 'name': 'events'},
        ];
        
        this._form.setContent(formData); 
    },
    /**
     * Overriding onOk handler
     * @private
     * @overrides
     */
    _onOk: function($super){
        this._parent.updateBuildingBlockDescription();
        this._parent.deployGadget();
        $super();
    },
    /**
     * Reset form
     * @private @overrides
     */
    _reset: function(){
        var user = GVSSingleton.getInstance().getUser();
        
        this._form.getForm().name.value = this._parent.getTitle();
        this._form.getForm().author.value = user.getRealName();
        this._form.getForm().email.value = user.getEmail();
    }
});

// vim:ts=4:sw=4:et:
