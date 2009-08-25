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
                             
        var dialogDiv = this._form.getContentNode();
                   
        var SCForm = new dijit.form.Form({
            "id" : "newScreenflow",
            method : "post"
        });

        var form = SCForm.domNode;

        var divSFName = new Element("div", {
            "class": "line"
        });
        var labelSFName = new Element("label").update("Screenflow Name:");
        divSFName.insert(labelSFName);
        
        var inputSFName = new Element("input",{
                type: "text",
                name : "SFName",
                "class": "input_SFDialog",
                value : "New Screenflow"
                /*regExp: "[A-Za-z0-9-_]+",
                trim : "true",
                invalidMessage : "Screenflow name cannot be blank"*/
        });
        divSFName.insert(inputSFName);
        form.insert(divSFName);
        
        var divSFDomainContext = new Element("div", {
            "class": "line"
        });
        var labelSFDomainContext = new Element("label").update("Domain Context:");
        divSFDomainContext.insert(labelSFDomainContext);
        var inputSFDomainContext = new Element("input", {
            type: "text",
            name: "SFDomainContext",
            "class": "input_SFDialog"
        });
        divSFDomainContext.insert(inputSFDomainContext);
        form.insert(divSFDomainContext);
        
        dialogDiv.insert(form);

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
