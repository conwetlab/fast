var ManageScreensDialog = Class.create(GalleryDialog /** @lends ManageScreensDialog.prototype */, {
    /**
     * This class handles the dialog
     * to open an existing screen
     * @constructs
     * @extends GalleryDialog
     */
    initialize: function($super) {
        $super("Screen browser", {'onDblClick': this._openScreen.bind(this),
                                  'disableIfNotValid': true });

        /**
         * List of screens
         * @type Array
         * @private
         */
        this._screens = null;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function() {
        PersistenceEngine.sendGet(URIs.screen, this, this._onLoadSuccess, Utils.onAJAXError);
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        this._setHeader("Browse your screens",
                "These are the screens you have created. Here you can " +
                "continue editing them and share your work with the community");

        this._setFields([{
                'title': 'Icon',
                'className': 'icon'
            }, {
                'title': 'Screen Name',
                'className': 'name'
            }, {
                'title': 'Screen Version',
                'className': 'version'
            }, {
                'title': 'Tags',
                'className': 'tags'
            }, {
                'title': 'Description',
                'className': 'description'
            }, {
                'title': 'Sharing',
                'className': 'sharing'
            }
        ]);

        this._setButtons([{
                'value': 'Open screen',
                'handler': this._openScreen.bind(this),
                'disableIfNotValid': true
            }, {
                'value': 'Clone screen',
                'handler': this._cloneScreen.bind(this)
            }, {
                'value': 'Share/Unshare screen',
                'handler': this._shareScreen.bind(this)
            }, {
                'value': 'Delete screen',
                'handler': this._deleteScreen.bind(this)
            }
            /*, {
                'value': 'Add external screen',
                'handler': this._addScreen.bind(this)
            }*/]);

        this._createScreenList();
        this._render();
    },

    /**
     * Creates the the screen list to be handled by its parent class
     * @private
     */
    _createScreenList: function() {
        this._emptyRows();
        this._screens.each(function(screen) {
            var valid =  screen.definition ? true : false;
            valid = valid && (screen.uri) ? false : true;
            this._addRow({
                            'key': screen.id,
                            'values': [
                                new Element('img', {'src': screen.icon}),
                                	screen.name,
                                '<span class="bold">Version: </span>' +
                                     screen.version,
                                '<span class="bold">Tags: </span>' +
                                	screen.tags.collect(function(tag) {
                                        return tag.label['en-gb'];
                                    }).join(", "),
                                '<span class="bold">Description </span><br />'+
                                	screen.description['en-gb'],
                                '<span class=' + (screen.uri ? '"shared"': '"unshared"') +
                                    '>&nbsp;</span>'
                             ],
                             'isValid': valid
                        });
        }.bind(this));
    },

    /**
     * On Success handler
     * @private
     */
    _onLoadSuccess: function(/** XMLHttpRequest */ transport) {
        this._screens = JSON.parse(transport.responseText);
        this._show();
    },

    /**
     * On Success handler, when reload
     * @private
     */
    _onReLoadSuccess: function(/** XMLHttpRequest */ transport) {
        this._screens = JSON.parse(transport.responseText);
        this._createScreenList();
        this._render(false);
    },

    /**
     * Open a screen by its id
     * @private
     */
    _openScreen: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.loadScreen(id);
        this._dialog.hide();
    },

    _cloneScreen: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.cloneScreen(id);
        this._dialog.hide();
    },

    /**
     * Share or unshare a screen depending of its status
     * @private
     */
    _shareScreen: function(/** String */ id) {
        var uri = URIs.share.replace("<id>", id);

        var screen = this._screens.detect(function(element) {
            return element.id == id;
        });
        if (screen.uri) {
            // Unshare screen
            PersistenceEngine.sendDelete(uri, this, this._reload, Utils.onAJAXError);
        } else {
            // Share screen
            PersistenceEngine.sendPost(uri, null, null, this, this._reload,
                                        Utils.onAJAXError);
        }
    },

    /**
     * Starts the deletion of a screen
     * @private
     */
    _deleteScreen: function(/** String */ id) {
        confirm("Are you sure you want to delete the screen? This action cannot " +
        "be undone", this._confirmDelete.bind({'mine': this, 'id': id}));
    },

    /**
     * Execute the deletion of the screen
     * @private
     */
    _confirmDelete: function() {
        var uri = URIs.buildingblock + this.id;
        PersistenceEngine.sendDelete(uri, this.mine, this.mine._reload, Utils.onAJAXError);
    },

    /**
     * Starts the process of adding an external screen
     * @private
     */
    _addScreen: function() {
        this._dialog.hide();
        //GVS.action("addScreen");
    },

    /**
     * Reloads the screen list
     * @private
     */
    _reload: function() {
        PersistenceEngine.sendGet(URIs.screen, this, this._onReLoadSuccess, Utils.onAJAXError);
    }
});

// vim:ts=4:sw=4:et:
