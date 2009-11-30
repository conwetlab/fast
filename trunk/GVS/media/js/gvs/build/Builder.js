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
        this._buildGadgetDialog.show(description.label['en-gb']);
    }, 

    // **************** PRIVATE METHODS **************** //

    _onBuildGadgetDialogCallback: function(/** Object */ data) {       
        // save screenflow
        // TODO: to be managed by the PM
       
        Utils.addProperties(this._description, data);
        this._description.label['en-gb'] = data.name;
        this._description.description['en-gb'] = data.desc;
        
        var saveParams = {'buildingblock': this._description.toJSON()};
        
        PersistenceEngineFactory.getInstance().sendPost(URIs.screenflow, saveParams, null, 
                this, this._onSaveCallback, this._onError);
    },
    
    _onSaveCallback: function(/** XMLHttpRequest */ transport) {
        var json = JSON.parse(transport.responseText);
        this._description.id = json.id;
        this._description.uri = URIs.buildingblock + '/' + json.id;
        
        this._buildGadget();  
    },
    
    _buildGadget: function() { 
        
        storeParams = {
            'gadget': this._description.toJSON(),
            'screenflow': this._description.id
        };        
        
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendPost(URIs.store, storeParams, null, 
                this, this._onBuildSuccess, this._onError);
    },
    
    _onBuildSuccess: function(/** XMLHttpRequest */ transport) {
        var result = JSON.parse(transport.responseText);
        var gadgetBaseUrl = result.gadgetURL;
        this._publishGadgetDialog.show(gadgetBaseUrl);
    },
    
    _onError: function(/** XMLHttpRequest */ transport, /** Exception */ e) {
        Logger.serverError(transport, e);
    }
    
});

// vim:ts=4:sw=4:et:
