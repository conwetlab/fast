var PreferencesDialog = Class.create(AbstractDialog /** @lends PreferencesDialog.prototype */, {
    /**
     * This class handles the dialog
     * that shows the user preferences
     * @constructs
     * @extends AbstractDialog
     */ 
    initialize: function($super) {
        
        $super("User Preferences");
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
 
        this._form.setHeader("User preferences");
        
        var user = GVSSingleton.getInstance().getUser();
                             
        var container = this._form.getContentNode();
                   
        var form = new dijit.form.Form({
            "id" : "PreferencesForm",
            method : "post"
        });
        var dialogDiv = new Element("div", {
                                "id" : "preferencesDialogDiv"
                            });
        form.domNode.appendChild(dialogDiv);

        var divFirstName = new Element("div", {
                                "class" : "line"
                            });
        var labelFirstName = new Element("label").update("First Name:");
        divFirstName.appendChild(labelFirstName);
        var inputFirstName = new dijit.form.TextBox({
            name : "firstName",
            value : user.getFirstName()
        });
        divFirstName.appendChild(inputFirstName.domNode);
        dialogDiv.appendChild(divFirstName);
        var divLastName = new Element("div", {
            "class" : "line"
        });
        var labelLastName = new Element("label").update("Last Name:");
        divLastName.appendChild(labelLastName);
        var inputLastName = new dijit.form.TextBox({
            name : "lastName",
            value : user.getLastName()
        });
        divLastName.appendChild(inputLastName.domNode);
        dialogDiv.appendChild(divLastName);
        var divEmail = new Element("div", {
            "class" : "line"
        });
        var labelEmail = new Element("label").update("Email:");
        divEmail.appendChild(labelEmail);
        var inputEmail = new dijit.form.ValidationTextBox({
            name : "email",
            value : user.getEmail(),
            regExp: "[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}",
            invalidMessage : "Invalid email address"
        });
        divEmail.appendChild(inputEmail.domNode);
        dialogDiv.appendChild(divEmail);
        var divEzWebURL = new Element("div", {
            "class" : "line"
        });
        var labelEzWebURL = new Element("label").update("EzWeb URL:");
        divEzWebURL.appendChild(labelEzWebURL);
        var inputEzWebURL = new dijit.form.ValidationTextBox({
            name : "ezWebURL",
            value : user.getEzWebURL(),
            regExp: "([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*",
            invalidMessage : "Invalid URL"
        });
        divEzWebURL.appendChild(inputEzWebURL.domNode);
        dialogDiv.appendChild(divEzWebURL);        

        container.insert (form.domNode);

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
            user.update(this._form.getForm().serialize(true));
            $super();
        }
    },
    
    /**
     * Reset method to leave the form as initially
     */
    _reset: function (){
        var user = GVSSingleton.getInstance().getUser();
        this._form.getForm().firstName.value = user.getFirstName();
        this._form.getForm().lastName.value = user.getLastName();
        this._form.getForm().email.value = user.getEmail();
        this._form.getForm().ezWebURL.value = user.getEzWebURL();
    }
});

// vim:ts=4:sw=4:et:
