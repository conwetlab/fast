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
                var form = new Element('form', {
                    "id" : "PreferencesForm",
                    method : "post"
                });
                var dialogDiv = new Element("div", {
                    "id" : "preferencesDialogDiv"
                });
                var divFirstName = new Element("div", {
                    "class" : "line"
                });
                var labelFirstName = new Element("label").update("First Name:");
                divFirstName.insert(labelFirstName);
                var inputFirstName = new Element("input", {
                    type : "text",
                    id : "PrefFirstName",
                    name : "first_name",
                    value : "",
                    "class" : "input_PrefDialog" 
                });
                divFirstName.insert(inputFirstName);
                dialogDiv.insert(divFirstName);
                var divLastName = new Element("div", {
                    "class" : "line"
                });
                var labelLastName = new Element("label").update("Last Name:");
                divLastName.insert(labelLastName);
                var inputLastName = new Element("input", {
                    type : "text",
                    id : "PrefLastName",
                    name : "last_name",
                    value : "",
                    "class" : "input_PrefDialog" 
                });
                divLastName.insert(inputLastName);
                dialogDiv.insert(divLastName);
                var divEmail = new Element("div", {
                    "class" : "line"
                });
                var labelEmail = new Element("label").update("Email:");
                divEmail.insert(labelEmail);
                var inputEmail = new Element("input", {
                    type : "text",
                    id : "PrefEmail",
                    name : "email",
                    value : "",
                    "class" : "input_PrefDialog" 
                });
                divEmail.insert(inputEmail);
                dialogDiv.insert(divEmail);
                var divEzWebURL = new Element("div", {
                    "class" : "line"
                });
                var labelEzWebURL = new Element("label").update("EzWeb URL:");
                divEzWebURL.insert(labelEzWebURL);
                var inputEzWebURL = new Element("input", {
                    type : "text",
                    id : "PrefEzWebURL",
                    name : "ezweb_url",
                    value : "",
                    "class" : "input_PrefDialog" 
                });
                divEzWebURL.insert(inputEzWebURL);
                dialogDiv.insert(divEzWebURL);
                
                var divButtons = new Element("div", {
                    "id" : "PrefButtons"
                });
                var acceptButton = new dijit.form.Button({
                    "id" : "acceptPrefButton",
                    "label" : "Accept",
                    onClick : this.save.bind(this)
                });
                divButtons.insert(acceptButton.domNode);
                var cancelButton = new dijit.form.Button({
                    id : "cancelPrefButton",
                    label : "Cancel",
                    onClick : this.hideDialog.bind(this)
                });
                divButtons.appendChild(cancelButton.domNode);
                dialogDiv.insert(divButtons);
                form.insert(dialogDiv);
                dialog.setContent(form);
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
        	var form = $("PreferencesForm");
            var formToSend = form.serialize(true);
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
			
			var form = $("PreferencesForm");
			form["first_name"].value = (response.user.first_name)? response.user.first_name : "";
			form["last_name"].value = (response.user.last_name)? response.user.last_name : "";
			form["email"].value = (response.user.email)? response.user.email : "";
			form["ezweb_url"].value = (response.profile.ezweb_url)? response.profile.ezweb_url : "";
        	
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
