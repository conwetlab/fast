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
var GVSSingleton = function(){

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;
    
    
    var GVS = Class.create(ToolbarModel,    /** @lends GVSSingleton-GVS.prototype */
    {
    
        /** 
         * GVS is the system facade.
         * @constructs
         * @extends ToolbarModel
         */
        initialize: function($super){
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
            
            
            /**
             * Object that contains the menu configuration for the GVS
             * @type Object
             * @private
             */
            this._menuConfig = null;
            
            this._dialogs.set("addScreen", new AddScreenDialog());
            this._dialogs.set("newScreenflow", new NewScreenflowDialog());
            this._dialogs.set("preferences", new PreferencesDialog());
            
        },
        
        
        // **************** PUBLIC METHODS **************** //
        
        
        /**
         * Creates all the other objects and installs the event
         * handlers.
         * @public
         */
        init: function(){
            this._actions = {
                openScreenflow: this._openScreenflow.bind(this),
                newScreenflow: this._newScreenflow.bind(this),
                addScreen: this._addScreen.bind(this)
            };
            this._documentController = new DocumentController();
            
            // Toolbar 
            this._addToolbarButtons();
            
            // Menu
            this._setMenuItems();
            
            this._documentController.getToolbar().setModel(0, this);
            
            this._documentController.getMenu().setModel('GVS', this);
        },
        
        /**
         * Ask the GVS application to perform a high-level action.
         * @public
         */
        action: function(/** String */actionName){
            if (this._actions[actionName]) {
                // Execute the action
                this._actions[actionName]();
            }
            else {
                throw "Unexpected exception: GVS::action";
            }
        },
        
        /**
         * Gets the document controller
         * @type DocumentController
         * @public
         */
        getDocumentController: function(){
            return this._documentController;
        },
        
        /**
         * Gets the user account object
         * @type User
         * @public
         */
        getUser: function(){
            return this._user;
        },
        
        /**
         * Sets the platform itself enabled or disabled
         * (for modal dialogs)
         */
        setEnabled: function(/** Boolean */enabled){
            this._documentController.getKeyPressRegistry().setEnabled(enabled);
        },
        
        /**
         * Implementing MenuModel interface
         * @type Object
         */
        getMenuElements: function(){
            return this._menuConfig;
        },
        
        // **************** PRIVATE METHODS **************** //
        
        /** 
         * High-level action for creating a new screenflow.
         *
         * @private
         */
        _newScreenflow: function(){
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
        _openScreenflow: function(){
            alert("open");
        },
        
        /**
         * Adds the toolbar buttons to the model
         * @private
         */
        _addToolbarButtons: function(){
            this._addToolbarElement('home', new ToolbarButton('Home', 'home', this._documentController.showWelcomeDocument.bind(this._documentController)));
            
            var preferencesDialog = this._dialogs.get("preferences");
            this._addToolbarElement('preferences', new ToolbarButton('User Preferences', 'preferences', preferencesDialog.show.bind(preferencesDialog)));
        },
        
        /**
         * Init the loading of the about section
         * @private
         */
        _showAboutDialog: function() {
            persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.about, this, this._onSuccessAbout, this._onError);
        },
        /**
         * OnSuccess handler
         */
        _onSuccessAbout: function (/** XMLHttpRequest */ transport) {
            var dialog = new ExternalContentDialog("About GVS");
            dialog.show(transport.responseText);  
        },
        
        _onError: function(/** XMLHttpRequest */ transport, /** Exception */ e) {
            Logger.serverError(transport, e);
        },
        
        /**
         * Creates the menu structure for the GVS
         * @private
         */
        _setMenuItems: function(){
            this._menuConfig = {
                'file': {
                    'type': 'SubMenu',
                    'label': 'File...',
                    'weight': 1,
                    'children': {
                        'newScreenflow': {
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'New Screenflow',
                                'weight': 1,
                                'handler': this._newScreenflow.bind(this),
                                'shortcut': 'Shift+N'
                            }),
                            'group': 0
                        },
                        'openScreenflow': {
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'Open Screenflow',
                                'weight': 2,
                                'handler':  function(){
                                    alert('Not yet implemented');
                                },
                                'shortcut': 'Shift+O'
                            }),
                            'group': 0
                        },
                        'newScreen': {
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'New Screen',
                                'weight': 10,
                                'handler':  function(){
                                    alert('Not yet implemented');
                                },
                                'shortcut': 'Alt+N'
                            }),
                            'group': 0
                        }
                    }
                },
                'edit': {
                    'type': 'SubMenu',
                    'weight': 2,
                    'label': 'Edit',
                    'children': {
                        'preferences':{
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'User Preferences',
                                'weight':1,
                                'handler': this._dialogs.get("preferences").
                                                show.bind(this._dialogs.get("preferences"))
                            }),
                            'group': 0
                        }
                    }
                    
                },
                'help': {
                    'type': 'Submenu',
                    'weight': MenuElement.MAXIMUM_WEIGHT,
                    'label': 'Help',
                    'children': {
                        'website': {
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'Fast Website',
                                'weight': 1,
                                'handler': function() {
                                     window.open('http://fast.morfeo-project.eu');
                                }
                            }),
                            'group': 0
                        },
                        'about': {
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'About GVS',
                                'weight': 2,
                                'handler': this._showAboutDialog.bind(this)
                            }),
                            'group': 0
                        }
                    }
                    
                }
            };
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
