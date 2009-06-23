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
                
                var divEzWebUsername = new Element("div", {
                    "class" : "line"
                });
                var labelEzWebUsername = new Element("label").update("EzWeb Username:");
                divEzWebUsername.insert(labelEzWebUsername);
                var inputEzWebUsername = new Element("input", {
                    type : "text",
                    id : "PrefEzWebUsername",
                    name : "ezweb_username",
                    value : "",
                    "class" : "input_PrefDialog" 
                });
                divEzWebUsername.insert(inputEzWebUsername);
                dialogDiv.insert(divEzWebUsername);
                
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
			form["ezweb_url"].value = response.ezweb_url;
			form["ezweb_username"].value = response.ezweb_username;
        	
        	prefDialog.show();
        },

        /**
         * Handles the preference query error
         * 
         * @private
         */
         _getPrefOnError : function(/** XMLHttpRequest **/ transport) {
        	alert(transport.statusText);
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
				msg = "HTTP Error #{status} - #{text}".interpolate({status: transport.status, text: transport.statusText});
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
