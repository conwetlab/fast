/**
 * <p>This class implements the Singleton Design Pattern to make sure there is 
 * only one instance of the class Preferences.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var preferences = PreferencesSingleton.getInstance();
 */ 
var PreferencesSingleton = function() {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;
    

    var Preferences = Class.create(
        /** @lends PreferencesSingleton-Preferences.prototype */ {

        /** 
         * Preferences is the system facade.
         * @constructs
         */
        initialize: function() {

        },
        

        // **************** PUBLIC METHODS **************** //

        /**
         * Creates the user preferences dialog
         * @type dijit.Dialog
         */
        createDialog : function() {
            if (dijit.byId("preferencesDialog") == null) {
                var dialog = new dijit.Dialog({
                    "id" : "preferencesDialog",
                    "title" : "User Preferences",
                    "style" : "display:none;"
                });
                var form = new dijit.form.Form({
                    "id" : "PreferencesForm",
                    method : "post"
                });
                dialog.attr("content", form);
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
                    id : "PrefFirstName",
                    name : "first_name",
                    value : "",
                    trim : "true"
                });
                divFirstName.appendChild(inputFirstName.domNode);
                dialogDiv.appendChild(divFirstName);
                var divLastName = new Element("div", {
                    "class" : "line"
                });
                var labelLastName = new Element("label").update("Last Name:");
                divLastName.appendChild(labelLastName);
                var inputLastName = new dijit.form.TextBox({
                    id : "PrefLastName",
                    name : "last_name",
                    value : "",
                    trim : "true"
                });
                divLastName.appendChild(inputLastName.domNode);
                dialogDiv.appendChild(divLastName);
                var divEmail = new Element("div", {
                    "class" : "line"
                });
                var labelEmail = new Element("label").update("Email:");
                divEmail.appendChild(labelEmail);
                var inputEmail = new dijit.form.ValidationTextBox({
                    id : "PrefEmail",
                    name : "email",
                    value : "",
                    regExp: "[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}",
                    trim : "true",
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
                    id : "PrefEzWebURL",
                    name : "ezweb_url",
                    value : "",
                    regExp: "([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*",
                    trim : "true",
                    invalidMessage : "Invalid URL"
                });
                divEzWebURL.appendChild(inputEzWebURL.domNode);
                dialogDiv.appendChild(divEzWebURL);
                
                var divButtons = new Element("div", {
                    "id" : "PrefButtons"
                });
                dialogDiv.appendChild(divButtons);
                var acceptButton = new dijit.form.Button({
                    "id" : "acceptPrefButton",
                    "label" : "Accept",
                    onClick : this.save.bind(this)
                });
                divButtons.appendChild(acceptButton.domNode);
                var cancelButton = new dijit.form.Button({
                    id : "cancelPrefButton",
                    label : "Cancel",
                    onClick : this.hideDialog.bind(this)
                });
                divButtons.appendChild(cancelButton.domNode);
                return dialog;
            } else {
                return dijit.byId("preferencesDialog");
            }
        },
        
        /**
         * Shows the user preferences dialog
         * 
         */
        showDialog : function() {
        	var persistenceEngine = PersistenceEngineFactory.getInstance();
        	persistenceEngine.sendGet(URIs.userPreferences, null, this._getPrefOnSuccess.bind(this), this._OnError.bind(this));
        },
        
        /**
         * Hides the user preferences dialog
         * 
         */
        hideDialog : function() {
            dijit.byId("preferencesDialog").hide();
        },
        
        /**
         * Hides the user preferences dialog
         */
        save : function() {
        	var form = dijit.byId("PreferencesForm");
        	if(!form.validate()){
        		return;
        	}
            var formToSend = form.domNode.serialize(true);
            var preferences = {preferences :Object.toJSON(formToSend)};
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendUpdate(URIs.userPreferences, preferences, null, null, this._saveOnSuccess.bind(this), this._OnError.bind(this));
        },

        
        // **************** PRIVATE METHODS **************** //
        
        /**
         * Handles the successful preferences query
         * 
         * @private
         */
         _getPrefOnSuccess : function(/** XMLHttpRequest **/ transport) {
        	var responseJSON = transport.responseText;
			var response = eval ('(' + responseJSON + ')');
			
			var prefDialog = this.createDialog();
			
			dijit.byId("PrefFirstName").setValue((response.user.first_name)? response.user.first_name : "");
			dijit.byId("PrefLastName").setValue((response.user.last_name)? response.user.last_name : "");
			dijit.byId("PrefEmail").setValue((response.user.email)? response.user.email : "");
			dijit.byId("PrefEzWebURL").setValue((response.profile.ezweb_url)? response.profile.ezweb_url : "");
        	
        	prefDialog.show();
        },

        /**
         * Handles the successful saving
         * 
         * @private
         */
         _saveOnSuccess : function(/** XMLHttpRequest **/ transport) {
        	this.hideDialog();
        },
        
        /**
         * Handles the saving error
         *
         * @private
         */
         _OnError : function(/** XMLHttpRequest **/ transport, /** Exception **/ e) {
        	var msg;
			if (e) {
				msg = "JavaScript exception on file #{errorFile} (line: #{errorLine}): #{errorDesc}".interpolate({errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e});
			} else if (transport.responseXML) {
				msg = transport.responseXML.documentElement.textContent;
			} else {
				try {
					m = eval ('(' + transport.responseText + ')')
					msg = m.message;
				} catch (e) {}
				if(!msg){
					msg = "HTTP Error #{status} - #{text}".interpolate({status: transport.status, text: transport.statusText});
				}
			}
			alert(msg);
         }
        
    });

    return new function(){
        /**
         * Returns the singleton instance
         * @type Preferences
         */
        this.getInstance = function(){
            if (_instance == null) {
                _instance = new Preferences();
            }
            return _instance;
        }
    }
}();

// vim:ts=4:sw=4:et:
