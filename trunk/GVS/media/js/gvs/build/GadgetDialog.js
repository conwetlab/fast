var GadgetDialog = Class.create(GalleryDialog, /** @lends Builder.prototype */ {
    /**
     * On charge of building screenflows and showing the possibility to
     * Deploy the gadget into the mashup platrom
     * @constructs
     */
    initialize: function($super, /** ScreenflowDescription */ description) {
        $super("Available gadgets for the screenflow", {
            "onDblClick": this._showDeploymentInfo.bind(this)
        });

        /**
         * @type StoreGadgetDialog
         * @private @member
         */
        this._buildGadgetDialog = new BuildGadgetDialog(this._onBuildGadgetDialogCallback.bind(this));

        /**
         * @type PublishGadgetDialog
         * @private @member
         */
        this._publishGadgetDialog = new PublishGadgetDialog();


        /**
         * @type ScreenflowDescription
         * @private @member
         */
        this._description = description;

        /**
         * Array of stored gadgets
         * @private @member
         * @type Hash
         */
        this._storedGadgets = new Hash();
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Start the process of showing the Gadget dialog
     * @override
     */
    show: function() {
        var uri = URIs.getStore.replace("<screenflow_id>", this._description.id);
        PersistenceEngine.sendGet(uri, this, this._onLoadSuccess, Utils.onAJAXError);
    },


    // **************** PRIVATE METHODS **************** //

    /**
     * On storage list loaded
     * @private
     */
    _onLoadSuccess: function(/** XMLHttpRequest */ transport) {
        var gadgets = JSON.parse(transport.responseText);
        gadgets.each(function(gadget) {
            this._storedGadgets.set(gadget.id, gadget);
        }, this);
        if (this._storedGadgets.values().size() > 0) {
            this._show();
        } else {
            this._buildGadget();
        }
    },

    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        this._setHeader("Stored Gadgets for this screenflow",
                "These are the gadgets you have created for the current screenflow." +
                "Here you can deploy them to several mashup platforms or create " +
                "new ones");

        this._setFields([{
                'title': 'Gadget Name',
                'className': 'name'
            }, {
                'title': 'Gadget Vendor',
                'className': 'vendor'
            }, {
                'title': 'Gadget Version',
                'className': 'version'
            }, {
                'title': 'Mashup Platforms',
                'className': 'platforms'
            }, {
                'title': 'Description',
                'className': 'description'
            }
        ]);

        this._setButtons([{
                'value': 'Create new gadget',
                'handler': this._buildGadget.bind(this),
                'disableIfNotValid': false
            }, {
                'value': 'Show Available platforms',
                'handler': this._showDeploymentInfo.bind(this),
                'disableIfNotValid': true
            }, {
                'value': 'Delete Gadget',
                'handler': this._confirmDeleteGadget.bind(this),
                'disableIfNotValid': true
            }]);
        this._createGadgetList();
        this._render();
    },


    /**
     * Creates the gadget list to be handled by its parent class
     * @private
     */
    _createGadgetList: function() {
        this._emptyRows();
        this._storedGadgets.values().each(function(gadget) {
            this._addRow({
                            'key': gadget.id,
                            'values': [
                                       gadget.name,
                                       '<span class="bold">Vendor: </span>' +
                                         gadget.vendor,
                                       '<span class="bold">Version: </span>' +
                                         gadget.version,
                                       '<span class="bold">Mashup platforms: </span>' +
                                         gadget.platforms,
                                       '<span class="bold">Description </span><br />'+
                                	     gadget.description
                                      ],
                            'isValid': true
                        });
        }.bind(this));
    },

    /**
     * Creates a gadget deployment from the ScreenflowDescription
     * @private
     */
    _buildGadget: function () {
        this._hide();
        this._buildGadgetDialog.show({
            'name': this._description.name,
            'shortname': this._description.name,
            'desc': this._description.description['en-gb'],
            'owner': GVS.getUser().getUserName()
        });
    },

    _onBuildGadgetDialogCallback: function(/** Object */ data) {

       var gadgetInfo = Object.extend(data, {
                                            'description': {
                                                'en-gb': data.desc
                                             },
                                             'uri': 'buildingblock/' +
                                                    this._description.getId(),
                                             'label': {
                                                 'en-gb': data.name
                                                },
                                             'id': this._description.getId()
                                            });
       var storeParams = {
            'gadget': Object.toJSON(gadgetInfo),
            'screenflow': this._description.getId()
        };
       PersistenceEngine.sendPost(URIs.store, storeParams, null,
                this, this._onBuildSuccess, this._onError);
       Utils.showMessage("Creating and storing the gadget...");
    },

    _onBuildSuccess: function(/** XMLHttpRequest */ transport) {
        var result = JSON.parse(transport.responseText);
        this._storedGadgets.set(result.id, result);
        this._createGadgetList();
        if (this.isVisible()) {
            this._render();
        }
        Utils.showMessage("Creating and storing the gadget...Done", {
            "hide":true
        });
        this._showDeploymentInfo(result.id);
    },

    _showDeploymentInfo: function(/** String */ gadget_id) {
        var result = this._storedGadgets.get(gadget_id);
        this._publishGadgetDialog.show(result);
    },

    _confirmDeleteGadget: function(/** String */ gadget_id) {
        confirm("Are you sure you want to delete the gadget? This action" +
        " cannot be undone", function(ok) {
            if (ok) {
                this._deleteGadget(gadget_id);
            }
        }.bind(this));
    },

    _deleteGadget: function(/** String */ gadget_id) {
        var uri = URIs.store + gadget_id;
        PersistenceEngine.sendDelete(uri, this, function() {
            this._storedGadgets.unset(gadget_id);
            this._createGadgetList();
            if (this.isVisible()) {
                this._render();
            }
        }, this._onError);
    },

    _onDelete: function() {

    },

    _onError: function(/** XMLHttpRequest */ transport, /** Exception */ e) {
        var message;
        if (e) {
            message = e;
        } else {
            message = transport.responseText;
        }
        Utils.showMessage("Cannot store the gadget: " + message, {
            "error": true,
            "hide": true
        });
    }

});

// vim:ts=4:sw=4:et:
