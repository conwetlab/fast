var Builder = Class.create( /** @lends Builder.prototype */ {
    /**
     * On charge of building screenflows and showing the possibility to
     * Deploy the gadget into the mashup platrom
     * @constructs
     */
    initialize: function() {
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
        this._description = null;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Creates a gadget deployment from the ScreenflowDescription
     * @public
     */
    buildGadget: function (/** ScreenflowDescription */ description) {
        this._description = description;
        this._buildGadgetDialog.show({
            'name': this._description.name,
            'shortname': this._description.name,
            'desc': this._description.description['en-gb'],
            'owner': GVS.getUser().getUserName()
        });
    },

    // **************** PRIVATE METHODS **************** //

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
    },

    _onBuildSuccess: function(/** XMLHttpRequest */ transport) {
        var result = JSON.parse(transport.responseText);
        this._publishGadgetDialog.show(result);
    },

    _onError: function(/** XMLHttpRequest */ transport, /** Exception */ e) {
        Logger.serverError(transport, e);
    }

});

// vim:ts=4:sw=4:et:
