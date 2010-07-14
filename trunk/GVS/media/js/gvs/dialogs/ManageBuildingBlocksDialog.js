var ManageBuildingBlocksDialog = Class.create(GalleryDialog /** @lends ManageScreensDialog.prototype */, {
    /**
     * This class handles the dialog
     * to open an existing screen
     * @constructs
     * @extends GalleryDialog
     */
    initialize: function($super) {
        $super("Building blocks browser", {
            'onDblClick': this._openBuildingBlock.bind(this),
            'disableIfNotValid': true
        });

        /**
         * List of building blocks
         * @type Array
         * @private
         */
        this._buildingBlocks = null;

        this._showForms = true;
        this._showOperators = true;
        this._showResources = true;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function() {
        this._loadBuildinBlocks(this._show.bind(this));
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * Builds the user interface, using the gathered information
     * @private
     */
    _render: function($super,/** Boolean(Optional) */ _loadAll) {
        $super(_loadAll);

        var content = document.createElement('div')
        content.style.textAlign = 'right';
        content.style.marginTop = '3px';
        this._contentNode.appendChild(content);

        var checkBox = new dijit.form.CheckBox({
            name: 'Forms',
            checked: this._showForms,
            onChange: function(b) {
                this._showForms = !(this._showForms && (this._showOperators || this._showResources))
                this._reload();
            }.bind(this)
        });
        content.appendChild(checkBox.domNode);

        var label = document.createElement('span');
        label.innerHTML = 'Forms '
        content.appendChild(label);

        var checkBox = new dijit.form.CheckBox({
            name: 'Operators',
            checked: this._showOperators,
            onChange: function(b) {
                this._showOperators = !(this._showOperators && (this._showForms || this._showResources))
                this._reload();
            }.bind(this)
        });
        content.appendChild(checkBox.domNode);

        var label = document.createElement('span');
        label.innerHTML = 'Operators '
        content.appendChild(label);

        var checkBox = new dijit.form.CheckBox({
            name: 'Resources',
            checked: this._showResources,
            onChange: function(b) {
                this._showResources = !(this._showResources && (this._showForms || this._showOperators));
                this._reload();
            }.bind(this)
        });
        content.appendChild(checkBox.domNode);

        var label = document.createElement('span');
        label.innerHTML = 'Resources'
        content.appendChild(label);
    },

    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        this._setHeader("Browse your building blocks",
                "These are the building blocks you have created. Here you can " +
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
                'value': 'Open building block',
                'handler': this._openBuildingBlock.bind(this),
                'disableIfNotValid': true
            }, {
                'value': 'Share/Unshare building block',
                'handler': this._shareBuildingBlock.bind(this)
            }, {
                'value': 'Delete building block',
                'handler': this._deleteBuildingBlock.bind(this)
            }
        ]);

        this._createBuildingBlockList();
        this._render();
    },

    /**
     * Creates the building block list to be handled by its parent class
     * @private
     */
    _createBuildingBlockList: function() {
        this._emptyRows();
        this._buildingBlocks.each(function(screen) {
            var valid = ! screen.uri;
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
     * Open a building block by its id
     * @private
     */
    _openBuildingBlock: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.loadBuildingBlock(id);
        this._dialog.hide();
    },

    /**
     * Share or unshare a screen depending of its status
     * @private
     */
    _shareBuildingBlock: function(/** String */ id) {
        var uri = URIs.share.replace("<id>", id);

        var screen = this._buildingBlocks.detect(function(element) {
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
     * Starts the deletion of a building block
     * @private
     */
    _deleteBuildingBlock: function(/** String */ id) {
        confirm("Are you sure you want to delete the building block? " +
            "This action cannot be undone",
            this._confirmDelete.bind({'mine': this, 'id': id}));
    },

    /**
     * Execute the deletion of the building block
     * @private
     */
    _confirmDelete: function(value) {
        var uri = URIs.buildingblock + this.id;
        if (value) {
            PersistenceEngine.sendDelete(uri, this.mine, this.mine._reload, Utils.onAJAXError);
        }
    },

    /**
     * Reloads the building block list
     * @private
     */
    _reload: function() {
        this._loadBuildinBlocks(function(){
            this._createBuildingBlockList();
            this._render(false);
        }.bind(this));
    },

    /**
     * Load selected building blocks
     * @private
     */
    _loadBuildinBlocks: function(onSucess) {
        var types = [];
        this._buildingBlocks = [];

        if (this._showForms) {
            types.push('form');
        }
        if (this._showOperators) {
            types.push('operator');
        }
        if (this._showResources) {
            types.push('resource');
        }
        this._getBuildingBlocks(types, this, onSucess);
    },

    /**
     * Get selected building blocks
     * @private
     */
    _getBuildingBlocks: function(/*Array<String>*/types, /*Object*/context, /*Function*/onSucess) {
        var type = types.pop()
        if (!type && onSucess instanceof Function) {
            onSucess.call(context);
        } else {
            PersistenceEngine.sendGet(URIs[type], context, function(transport) {
                this._buildingBlocks = this._buildingBlocks.concat(JSON.parse(transport.responseText));
                this._getBuildingBlocks(types, context, onSucess)
            }, Utils.onAJAXError);
        }
    },

});

// vim:ts=4:sw=4:et:
