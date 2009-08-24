var DeployGadgetDialog = Class.create(AbstractDialog /** @lends DeployGadgetDialog.prototype */, {
    /**
     * This class handles the dialog
     * to deploy a gadget
     * @constructs
     * @extends AbstractDialog
     */ 
    initialize: function($super, parent /** ScreenflowDocument */) {
        
        $super();
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
     * This function creates the dom structure and
     * @private
     * @overrides
     */
    _initDialogInterface: function (){
        this._form = new FormDialog({
                "title": "Deploy Gadget",
                "style": "display:none;"
        });
 
        var dialogDiv = new Element("div");
        var title = new Element("h2").update("Fulfill Gadget Information");
        dialogDiv.appendChild(title);
        
        var divWizardInfo = new Element('div');
        var divInfo = new Element("div", {
            "class": "line"
        }).update("Please fulfill the required information in order to" +
        " deploy a gadget.");
        
        divWizardInfo.insert(divInfo);

        var form = new Element('form', {
            method: "post"
        });
        var hGadgetInformation = new Element('h3').update("Gadget information");
        form.insert(hGadgetInformation);
        
        var divGadgetName = new Element("div", {
            "class": "line"
        });
        var labelGadgetName = new Element("label").update("Gadget Name:");
        divGadgetName.insert(labelGadgetName);
        var inputGadgetName = new Element("input", {
            type: "text",
            name: "name",
            value: this._parent.getTitle(),
            "class": "input_GadgetInfo"
        });
        divGadgetName.insert(inputGadgetName);
        form.insert(divGadgetName);
        
        var divVendor = new Element("div", {
            "class": "line"
        });
        var labelVendor = new Element("label").update("Vendor:");
        divVendor.insert(labelVendor);
        var inputVendor = new Element("input", {
            type: "text",
            name: "vendor",
            value: "Morfeo",
            "class": "input_GadgetInfo"
        });
        divVendor.insert(inputVendor);
        form.insert(divVendor);
        
        var divVersion = new Element("div", {
            "class": "line"
        });
        var labelVersion = new Element("label").update("Version:");
        divVersion.insert(labelVersion);
        var inputVersion = new Element("input", {
            type: "text",
            name: "version",
            value: "1.0",
            "class": "input_GadgetInfo"
        });
        divVersion.insert(inputVersion);
        form.insert(divVersion);
        
        var divGadgetDescription = new Element("div", {
            "class": "line"
        });
        var labelGadgetDescription = new Element("label").update("Gadget Description:");
        divGadgetDescription.insert(labelGadgetDescription);
        var inputGadgetDescription = new Element("input", {
            type: "text",
            name: "info",
            value: "Write your description here...",
            "class": "input_GadgetInfo"
        });
        divGadgetDescription.insert(inputGadgetDescription);
        form.insert(divGadgetDescription);
        
        
        var user = GVSSingleton.getInstance().getUser();
        
        var hAuthorInformation = new Element('h3').update("Author information");
        form.insert(hAuthorInformation);
        
        var divAuthorName = new Element("div", {
            "class": "line"
        });
        var labelAuthorName = new Element("label").update("Author Name:");
        divAuthorName.insert(labelAuthorName);
        var inputAuthorName = new Element("input", {
            type: "text",
            name: "author",
            value: user.getRealName(),
            "class": "input_GadgetInfo"
        });
        divAuthorName.insert(inputAuthorName);
        form.insert(divAuthorName);
        
        var divEmail = new Element("div", {
            "class": "line"
        });
        var labelEmail = new Element("label").update("E-Mail:");
        divEmail.insert(labelEmail);
        var inputEmail = new Element("input", {
            type: "text",
            name: "email",
            value: user.getEmail(),
            "class": "input_GadgetInfo"
        });
        divEmail.insert(inputEmail);
        form.insert(divEmail);
        
        var inputDeployScreens = new Element("input", {
            type: "hidden",
            name: "screens",
            "class": "input_GadgetInfo"
        });
        form.insert(inputDeployScreens);
        
        var inputDeploySlots = new Element("input", {
            type: "hidden",
            name: "slots"
        });
        form.insert(inputDeploySlots);
        
        var inputDeployEvents = new Element("input", {
            type: "hidden",
            name: "events"
        });
        form.insert(inputDeployEvents);
        
        divWizardInfo.insert(form);
        dialogDiv.appendChild(divWizardInfo);
        
        var divWizardButtons = new Element("div");
        var mine = this;
        var sendButton = new dijit.form.Button({
            'label': 'Send',
            onClick: function(){
                mine._parent.updateBuildingBlockDescription();
                mine._parent.deployGadget();
                mine.hide();
            }
        });
        divWizardButtons.insert(sendButton.domNode);
        var cancelButton = new dijit.form.Button({
            'label': 'Cancel',
            onClick: function(){
                mine.hide();
            }
        });
        divWizardButtons.appendChild(cancelButton.domNode);
        dialogDiv.appendChild(divWizardButtons);
        this._form.getDialog().setContent(dialogDiv);
    }  
});

// vim:ts=4:sw=4:et:
