var DomainConceptDialog = Class.create(AbstractDialog /** @lends DomainConceptDialog.prototype */, {
    /**
     * This class handles the dialog
     * to update the domain concept properties
     * @constructs
     * @extends AbstractDialog
     */ 
    initialize: function($super) {
        
        $super("Domain concept");
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
 
        this._form.setHeader("Check connector details", 
                             "Please fulfill the required information in order to" +
                             " set up the connector.");

        var formData = [
            /*{'type':'input', 'label': 'Screenflow Name:','name': 'SFName', 'value': 'New Screenflow'},
            {'type':'input', 'label': 'Domain Context:','name': 'SFDomainContext', 'value': ''}*/
        ];
        
        this._form.setContent(formData);               
        
    },
    /**
     * Overriding onOk handler
     * @overrides
     */
    _onOk: function($super){
        
    },
    
    /**
     * Reset method to leave the form as initially
     */
    _reset: function (){
    }
});

// vim:ts=4:sw=4:et:
