var ManageScreenflowsDialog = Class.create(GalleryDialog /** @lends ManageScreenflowsDialog.prototype */, {
    /**
     * This class handles the dialog
     * to open an existing screen
     * @constructs
     * @extends GalleryDialog
     */
    initialize: function($super) {
        $super("Screenflow browser", {'onDblClick': this._openScreenflow.bind(this),
                                      'disableIfNotValid': true });

        /**
         * List of screens
         * @type Array
         * @private
         */
        this._screenflows = null;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function() {
        PersistenceEngine.sendGet(URIs.screenflow, this, this._onLoadSuccess, Utils.onAJAXError);
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        this._setHeader("Browse your screenflows",
                "These are the screenflows you have created. Here you can " +
                "continue editing them and share your work with the community");

        this._setFields([{
                'title': 'Screenflow Name',
                'className': 'name'
            }, {
                'title': 'Screenflow Version',
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
                'value': 'Open screenflow',
                'handler': this._openScreenflow.bind(this),
                'disableIfNotValid': true
            }, {
                'value': 'Clone screenflow',
                'handler': this._cloneScreenflow.bind(this),
                'disableIfNotValid': true
            }, {
                'value': 'Share/Unshare screenflow',
                'handler': this._shareScreenflow.bind(this)
            }, {
                'value': 'Delete screenflow',
                'handler': this._deleteScreenflow.bind(this)
            }/*, {
                'value': 'Add external screenflow',
                'handler': this._addScreenflow.bind(this)
            }*/]);

        this._createScreenflowList();
        this._render();
    },

    /**
     * Creates the the screen list to be handled by its parent class
     * @private
     */
    _createScreenflowList: function() {
        this._emptyRows();
        this._screenflows.each(function(screenflow) {
            var valid = screenflow.definition ? true : false;
            valid = valid && (screenflow.uri) ? false : true;
            this._addRow({
                            'key': screenflow.id,
                            'values': [
                                       screenflow.name,
                                       '<span class="bold">Version: </span>' +
                                         screenflow.version,
                                       '<span class="bold">Tags: </span>' +
                                         screenflow.tags.collect(function(tag) {
                                           return tag.label['en-gb'];
                                         }).join(", "),
                                       '<span class="bold">Description </span><br />'+
                                	 screenflow.description['en-gb'],
                                       '<span class=' + (screenflow.uri ? '"shared"': '"unshared"') +
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
        this._screenflows = JSON.parse(transport.responseText);
        this._show();
    },

    /**
     * On Success handler, when reload
     * @private
     */
    _onReLoadSuccess: function(/** XMLHttpRequest */ transport) {
        this._screenflows = JSON.parse(transport.responseText);
        this._createScreenflowList();
        this._render(false);
    },

    /**
     * Open a screen by its id
     * @private
     */
    _openScreenflow: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.loadScreenflow(id);
        this._dialog.hide();
    },

    /**
     * Clone a screen by its id
     * @private
     */
    _cloneScreenflow: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.cloneScreenflow(id);
        this._dialog.hide();
    },

    /**
     * Share or unshare a screen depending of its status
     * @private
     */
    _shareScreenflow: function(/** String */ id) {
        var uri = URIs.share.replace("<id>", id);

        var screen = this._screenflows.detect(function(element) {
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
    _deleteScreenflow: function(/** String */ id) {
        confirm("Are you sure you want to delete the screenflow? This action cannot " +
        "be undone. <br />All the generated gadgets will be destroyed (unless you have " +
        "deployed them before).", this._confirmDelete.bind({'mine': this, 'id': id}));
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
    _addScreenflow: function() {
        this._dialog.hide();
        //GVS.action("addScreenflow");
    },

    /**
     * Reloads the screen list
     * @private
     */
    _reload: function() {
        PersistenceEngine.sendGet(URIs.screenflow, this, this._onReLoadSuccess, Utils.onAJAXError);
    }
});

// vim:ts=4:sw=4:et:
