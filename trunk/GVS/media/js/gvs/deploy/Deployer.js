var Deployer = Class.create( /** @lends Deployer.prototype */ {
    /**
     * On charge of deploying screenflows to the mashup platform.
     * @constructs
     */ 
    initialize: function() {
        /** 
         * @type StoreGadgetDialog
         * @private @member
         */
        this._storeGadgetDialog = new StoreGadgetDialog(this._onStoreGadgetDialogCallback.bind(this));
        
        /** 
         * @type ExternalContentDialog
         * @private @member
         */
        this._deployGadgetDialog = new ExternalContentDialog("Deploy gadget");       
        
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
    deployGadget: function (/** ScreenflowDescription */ description) {
        this._description = description;
        this._storeGadgetDialog.show(description.label['en-gb']);
    }, 

    // **************** PRIVATE METHODS **************** //

    _onStoreGadgetDialogCallback: function(/** Object */ data) {       
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
        
        this._storeGadget();  
    },
    
    _storeGadget: function() { 
        
        storeParams = {
            'gadget': this._description.toJSON(),
            'screenflow': this._description.id
        };        
        
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendPost(URIs.store, storeParams, null, 
                this, this._onStoreSuccess, this._onError);
    },
    
    _onStoreSuccess: function(/** XMLHttpRequest */ transport) {
        this._deployGadgetDialog.show(new Element('div').update(transport.responseText));
    },
    
    _onError: function(/** XMLHttpRequest */ transport, /** Exception */ e) {
        Logger.serverError(transport, e);
    }
    
});

// vim:ts=4:sw=4:et:
