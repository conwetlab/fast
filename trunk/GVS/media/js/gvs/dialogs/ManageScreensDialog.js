var ManageScreensDialog = Class.create(GalleryDialog /** @lends ManageScreensDialog.prototype */, {
    /**
     * This class handles the dialog
     * to open an existing screen
     * @constructs
     * @extends GalleryDialog
     */ 
    initialize: function($super) {  
        $super("Screen management");

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
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendGet(URIs.screen, this, this._onLoadSuccess, Utils.onAJAXError);
    },


    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        this._emptyRows();

        this._setHeader("Manage your screens",
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
            }
        ]);

        this._setButtons([{
                'value': 'Open screen',
                'handler': this._openScreen.bind(this)
            }, {
                'value': 'Share screen',
                'handler': this._shareScreen.bind(this)
            }, {
                'value': 'Delete screen',
                'handler': this._deleteScreen.bind(this)
            }]);

        this._screens.each(function(screen) {
            var data = JSON.parse(screen.data);
            this._addRow({
                            'key': screen.id,
                            'values': [
                                new Element('img', {'src': data.icon}),
                                screen.name,
                                 '<span class="bold">Version: </span>' + screen.version,
                                '<span class="bold">Tags: </span>' + data.domainContext.tags.join(","),
                                '<span class="bold">Description </span><br />'+ data.description['en-gb']
                            ]
                        });
        }.bind(this));

        this._render();
    },
    
    /**
     * On Success handler
     * @private
     */
    _onLoadSuccess: function(/** XMLHttpRequest */ transport) {
        this._screens = JSON.parse(transport.responseText);
        this._show();
    },

    _openScreen: function(/** String */ id) {
        this._dialog.hide();
    },

    _shareScreen: function(/** String */ id) {
    },

    _deleteScreen: function(/** String */ id) {
    }
});

// vim:ts=4:sw=4:et:
