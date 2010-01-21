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
            this._dialogs.set("newScreen", new NewScreenDialog());
            this._dialogs.set("browseScreens", new ManageScreensDialog());
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
                // browseScreenflow: this._browseScreenflow.bind(this),
                newScreenflow: this._newScreenflow.bind(this),
                addScreen: this._addScreen.bind(this),
                newScreen: this._newScreen.bind(this),
                browseScreens: this._browseScreens.bind(this),
                showAbout: this._showAboutDialog.bind(this)
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
                alert("This function is being implemented. Stay tuned");
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
         * High-level action for creating a new screen.
         *
         * @private
         */
        _newScreen: function(){
            this._dialogs.get("newScreen").show();
        },
        
        /** 
         * High-level action for adding a new screen to the catalogue
         * @private
         */
        _addScreen: function(){
            this._dialogs.get("addScreen").show();
        },
        /**
         * browse screens
         * @private
         */
        _browseScreens: function(){
            this._dialogs.get("browseScreens").show();
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
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.about, this, this._onSuccessAbout, Utils.onAJAXError);
        },
        /**
         * OnSuccess handler
         */
        _onSuccessAbout: function (/** XMLHttpRequest */ transport) {
            var dialog = new ExternalContentDialog("About GVS");
            dialog.show(transport.responseText);  
        },

        
        /**
         * Creates the menu structure for the GVS
         * @private
         */
        _setMenuItems: function(){
            this._menuConfig = {
                'file': {
                    'type': 'SubMenu',
                    'label': 'File',
                    'weight': 1,
                    'children': {
                        'new': {
                            'type': 'SubMenu',
                            'label': 'New...',
                            'weight': 1,
                            'group': 0,
                            'children': {
                                'newScreenflow': {
                                    'type': 'Action',
                                    'action': new MenuAction({
                                        'label': 'Screenflow',
                                        'weight': 1,
                                        'handler': function() {
                                            this.action("newScreenflow");
                                        }.bind(this),
                                        'shortcut': 'Shift+N'
                                    }),
                                    'group': 0
                                }
                            }
                        },
                        'browse': {
                            'type': 'SubMenu',
                            'label': 'Browse...',
                            'weight': 2,
                            'group': 0,
                            'children': {
                                'browseScreenflows': {
                                    'type': 'Action',
                                    'action': new MenuAction({
                                        'label': 'Screenflow',
                                        'weight': 2,
                                        'handler': function() {
                                            this.action("browseScreenflows");
                                        }.bind(this),
                                        'shortcut': 'Shift+O'
                                    }),
                                    'group': 0
                                }
                            }
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
                                'handler': function() {
                                    this._dialogs.get("preferences").show();
                                }.bind(this)
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
                                'handler': function() {
                                    this.action("showAbout");
                                }.bind(this)
                            }),
                            'group': 0
                        }
                    }
                    
                }
            };
            if (!GlobalOptions.isPublicDemo) {
                // Include the new screen feature
                this._menuConfig.file.children['new'].children.newScreen = {
                    'type': 'Action',
                    'action': new MenuAction({
                        'label': 'Screen',
                        'weight': 10,
                        'handler': function(){
                            this.action("newScreen")
                        }.bind(this),
                        'shortcut': 'Alt+N'
                    }),
                    'group': 0
                };
                this._menuConfig.file.children['browse'].children.browseScreens = {
                    'type': 'Action',
                    'action': new MenuAction({
                        'label': 'Screens',
                        'weight': 10,
                        'handler': function(){
                            this.action("browseScreens")
                        }.bind(this),
                        'shortcut': 'Alt+N'
                    }),
                    'group': 0
                };
            }
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
