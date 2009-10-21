/**
 * <p>This class implements the Singleton Design Pattern to make sure there is 
 * only one instance of the class GVS.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var gvs = GVSSingleton.getInstance();
 */ 
var GVSSingleton = function() {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;
    

    var GVS = Class.create(ToolbarModel,
        /** @lends GVSSingleton-GVS.prototype */ {

        /** 
         * GVS is the system facade.
         * @constructs
         * @extends ToolbarModel
         */
        initialize: function($super) {
            $super();
            
            /** 
             * @type DocumentController
             * @private @member
             */
            this._documentController = null;

            /** 
             * Hash keeping the action implementations.
             * @type Hash
             * @private @member
             */
            this._actions = null;
            
            /** 
             * User data object
             * @type User
             * @private @member
             */
            this._user = new User();
            
            /** 
             * Hash containing the different dialogs used in the welcome document
             * @type Hash
             * @private @member
             */            
            this._dialogs = new Hash();
            
            this._dialogs.set ("addScreen", new AddScreenDialog());
            this._dialogs.set ("newScreenflow", new NewScreenflowDialog());
            this._dialogs.set ("preferences", new PreferencesDialog());      
            
        },
        

        // **************** PUBLIC METHODS **************** //
        

        /**
         * Creates all the other objects and installs the event 
         * handlers.
         * @public
         */
        init: function () {
            this._actions = {
                openScreenflow: this._openScreenflow.bind(this),
                newScreenflow: this._newScreenflow.bind(this),
                addScreen: this._addScreen.bind(this)
            };
            this._documentController = new DocumentController();
            
            /**
             * Toolbar buttons
             */
            this._addToolbarElement('home', new ToolbarButton(
                'Home',
                'home',
                this._documentController.showWelcomeDocument.bind(this._documentController)
            ));
            
            var preferencesDialog = this._dialogs.get("preferences");
            this._addToolbarElement('preferences', new ToolbarButton(
                'User Preferences',
                'preferences',
                preferencesDialog.show.bind(preferencesDialog)
            ));
            
            this._documentController.getToolbar().setModel(0, this);
            
            this._documentController.getMenu().setModel('GVS', this);
        },

        /**
         * Ask the GVS application to perform a high-level action.
         * @public
         */
        action: function (/** String */ actionName){
            if (this._actions[actionName]){
                // Execute the action
                this._actions[actionName]();
            } else{
                throw "Unexpected exception: GVS::action";
            }
        },

        /**
         * Gets the document controller
         * @type DocumentController
         * @public
         */
        getDocumentController: function () {
            return this._documentController;
        },
        
        /**
         * Gets the user account object
         * @type User
         * @public
         */
        getUser: function () {
            return this._user;
        },
        
        /**
         * Sets the platform itself enabled or disabled
         * (for modal dialogs)
         */
        setEnabled: function (/** Boolean */ enabled) {
           this._documentController.getKeyPressRegistry().setEnabled(enabled);
        },
        
        /**
         * Implementing MenuModel interface
         * @type Object
         */
        getMenuElements: function() {        
            return {};
        },
        
        // **************** PRIVATE METHODS **************** //

        /** 
         * High-level action for creating a new screenflow.
         *
         * @private
         */
        _newScreenflow: function (){
            this._dialogs.get("newScreenflow").show();
        },
        
        /** 
         * High-level action for adding a new screen to the catalogue.
         *
         * @private
         */
        _addScreen: function(){
            this._dialogs.get("addScreen").show();
        },
        /**
         * Open a screenflow
         * @private
         */
        _openScreenflow: function() {
            alert("open");
        }
    });
    
  
    return new function(){
        /**
         * Returns the singleton instance
         * @type GVS
         */
        this.getInstance = function(){
            if (_instance == null) {
                _instance = new GVS();
            }
            return _instance;
        }
    }
}();

// vim:ts=4:sw=4:et:
